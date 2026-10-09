<?php
/**
 * SWISSO KAFFEE — Consultation Inquiry Endpoint
 * Zpracovává formulář konzultace a odesílá zprávu do Telegramu.
 *
 * Ochrana: Rate limiting, Origin kontrola, honeypot, display_errors=off
 */

// ── Bezpečnost: skrýt chyby před uživatelem ──
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// ── CORS: povolit pouze naši doménu ──
$allowedOrigins = ['https://bestcoffe.shop', 'https://www.bestcoffe.shop', 'http://localhost:8085'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {
    header('Access-Control-Allow-Origin: https://bestcoffe.shop');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// ── OPTIONS preflight ──
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ── Kontrola metody: pouze POST ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method Not Allowed'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Kontrola Origin (ochrana před CSRF) ──
if (!empty($origin) && !in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'Forbidden'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Rate Limiting (souborový, pro hosting) ──
$rateLimitDir = sys_get_temp_dir() . '/swisso_rate_limit/';
if (!is_dir($rateLimitDir)) {
    @mkdir($rateLimitDir, 0700, true);
}

$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimitFile = $rateLimitDir . md5($clientIp) . '.json';
$maxRequests = 3;       // maximum požadavků
$windowSeconds = 300;   // za 5 minut

if (file_exists($rateLimitFile)) {
    $rateData = json_decode(file_get_contents($rateLimitFile), true);
    if (!is_array($rateData) || !isset($rateData['attempts'])) {
        $rateData = ['attempts' => []];
    }
    // Odstranění starých pokusů
    $rateData['attempts'] = array_values(array_filter(
        $rateData['attempts'],
        fn($ts) => $ts > (time() - $windowSeconds)
    ));

    if (count($rateData['attempts']) >= $maxRequests) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Příliš mnoho požadavků. Zkuste to prosím za několik minut.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
} else {
    $rateData = ['attempts' => []];
}

$rateData['attempts'][] = time();
file_put_contents($rateLimitFile, json_encode($rateData), LOCK_EX);

// ── Připojení konfigurace Telegramu ──
require_once __DIR__ . '/config.php';

// ── Získání dat (JSON nebo POST) ──
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
}

// ── Honeypot kontrola (pole "website" musí být prázdné) ──
if (!empty(trim($data['website'] ?? ''))) {
    // Bot vyplnil honeypot — tiše zahodit
    echo json_encode([
        'success' => true,
        'message' => 'OK'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$topic = !empty(trim($data['topic'] ?? '')) ? trim($data['topic']) : 'Všeobecná konzultace';
$comment = trim($data['message'] ?? $data['comment'] ?? '');

if (empty($name) || empty($phone)) {
    echo json_encode([
        'success' => false,
        'error' => 'Prosím, uveďte své jméno a telefonní číslo.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Serverová validace telefonu ──
if (!preg_match('/^[\+]?[\d\s\(\)\-]{7,25}$/', $phone)) {
    echo json_encode([
        'success' => false,
        'error' => 'Zadejte platné telefonní číslo.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Formátování zprávy pro Telegram ──
$dateStr = date('d.m.Y H:i');
$telegramText = "☕ <b>NOVÝ POŽADAVEK NA KONZULTACI!</b>\n\n"
              . "👤 <b>Jméno:</b> " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "\n"
              . "📞 <b>Telefon:</b> <code>" . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</code>\n"
              . "📋 <b>Kategorie:</b> " . htmlspecialchars($topic, ENT_QUOTES, 'UTF-8') . "\n";

if (!empty($comment)) {
    $telegramText .= "💬 <b>Komentář:</b>\n" . htmlspecialchars($comment, ENT_QUOTES, 'UTF-8') . "\n";
}

$telegramText .= "\n🕒 <i>Čas: {$dateStr} (Web bestcoffe.shop)</i>";

// ── Odeslání do Telegramu ──
$sendResult = sendTelegramMessage($telegramText);

echo json_encode([
    'success' => ($sendResult !== false),
    'message' => ($sendResult !== false) ? 'Požadavek byl úspěšně odeslán!' : 'Chyba při odesílání do Telegramu.',
    'telegram_sent' => ($sendResult !== false)
], JSON_UNESCAPED_UNICODE);
