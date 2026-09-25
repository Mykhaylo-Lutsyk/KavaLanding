<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

// Отримуємо дані (JSON або звичайний POST)
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    $data = $_POST;
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

// Формуємо гарне повідомлення для Telegram
$dateStr = date('d.m.Y H:i');
$telegramText = "☕ <b>НОВИЙ ЗАПИТ НА КОНСУЛЬТАЦІЮ!</b>\n\n"
              . "👤 <b>Ім'я:</b> " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "\n"
              . "📞 <b>Телефон:</b> <code>" . htmlspecialchars($phone, ENT_QUOTES, 'UTF-8') . "</code>\n"
              . "📋 <b>Категорія:</b> " . htmlspecialchars($topic, ENT_QUOTES, 'UTF-8') . "\n";

if (!empty($comment)) {
    $telegramText .= "💬 <b>Коментар:</b>\n" . htmlspecialchars($comment, ENT_QUOTES, 'UTF-8') . "\n";
}

$telegramText .= "\n🕒 <i>Час: {$dateStr} (Сайт bestcoffe.shop)</i>";

// Відправляємо в Telegram
$sendResult = sendTelegramMessage($telegramText);

echo json_encode([
    'success' => ($sendResult !== false),
    'message' => ($sendResult !== false) ? 'Запит успішно надіслано!' : 'Помилка надсилання в Telegram.',
    'telegram_sent' => ($sendResult !== false)
], JSON_UNESCAPED_UNICODE);
