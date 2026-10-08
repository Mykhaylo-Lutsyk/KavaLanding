<?php
/**
 * SWISSO KAFFEE — Consultation Inquiry Endpoint
 * Приймає форму консультації та надсилає повідомлення в Telegram.
 *
 * Захист: Rate limiting, Origin-перевірка, honeypot, display_errors=off
 */

// ── Безпека: приховати помилки від користувача ──
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

// ── CORS: дозволяємо тільки наш домен ──
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

// ── Перевірка методу: тільки POST ──
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method Not Allowed'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Перевірка Origin (захист від CSRF із чужих доменів) ──
if (!empty($origin) && !in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'error' => 'Forbidden'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Rate Limiting (файловий, для shared-хостингу) ──
$rateLimitDir = sys_get_temp_dir() . '/swisso_rate_limit/';
if (!is_dir($rateLimitDir)) {
    @mkdir($rateLimitDir, 0700, true);
}

$clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateLimitFile = $rateLimitDir . md5($clientIp) . '.json';
$maxRequests = 3;       // максимум запитів
$windowSeconds = 300;   // за 5 хвилин

if (file_exists($rateLimitFile)) {
    $rateData = json_decode(file_get_contents($rateLimitFile), true);
    if (!is_array($rateData) || !isset($rateData['attempts'])) {
        $rateData = ['attempts' => []];
    }
    // Видаляємо застарілі спроби
    $rateData['attempts'] = array_values(array_filter(
        $rateData['attempts'],
        fn($ts) => $ts > (time() - $windowSeconds)
    ));

    if (count($rateData['attempts']) >= $maxRequests) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => 'Забагато запитів. Спробуйте через кілька хвилин.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
} else {
    $rateData = ['attempts' => []];
}

$rateData['attempts'][] = time();
file_put_contents($rateLimitFile, json_encode($rateData), LOCK_EX);

// ── Підключення конфігурації Telegram ──
require_once __DIR__ . '/config.php';

// ── Отримуємо дані (JSON або звичайний POST) ──
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
}

// ── Honeypot-перевірка (поле "website" має бути порожнім) ──
if (!empty(trim($data['website'] ?? ''))) {
    // Бот заповнив honeypot — тихо відкидаємо
    echo json_encode([
        'success' => true,
        'message' => 'OK'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$topic = !empty(trim($data['topic'] ?? '')) ? trim($data['topic']) : 'Загальна консультація';
$comment = trim($data['message'] ?? $data['comment'] ?? '');

if (empty($name) || empty($phone)) {
    echo json_encode([
        'success' => false,
        'error' => 'Будь ласка, вкажіть ім\'я та номер телефону.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Серверна валідація телефону ──
if (!preg_match('/^[\+]?[\d\s\(\)\-]{7,25}$/', $phone)) {
    echo json_encode([
        'success' => false,
        'error' => 'Введіть коректний номер телефону.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Формуємо гарне повідомлення для Telegram ──
$dateStr = date('d.m.Y H:i');
$telegramText = "☕ <b>НОВИЙ ЗАПИТ НА КОНСУЛЬТАЦІЮ!</b>\n\n"
              . "👤 <b>Ім'я:</b> " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "\n"
              . "📞 <b>Телефон:</b> <code>" . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</code>\n"
              . "📋 <b>Категорія:</b> " . htmlspecialchars($topic, ENT_QUOTES, 'UTF-8') . "\n";

if (!empty($comment)) {
    $telegramText .= "💬 <b>Коментар:</b>\n" . htmlspecialchars($comment, ENT_QUOTES, 'UTF-8') . "\n";
}

$telegramText .= "\n🕒 <i>Час: {$dateStr} (Сайт bestcoffe.shop)</i>";

// ── Відправляємо в Telegram ──
$sendResult = sendTelegramMessage($telegramText);

echo json_encode([
    'success' => ($sendResult !== false),
    'message' => ($sendResult !== false) ? 'Запит успішно надіслано!' : 'Помилка надсилання в Telegram.',
    'telegram_sent' => ($sendResult !== false)
], JSON_UNESCAPED_UNICODE);
