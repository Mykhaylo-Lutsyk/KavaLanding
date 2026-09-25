<?php
/**
 * Налаштування Telegram Bot для сайту bestcoffe.shop
 * 
 * 1. Створіть бота в Telegram через @BotFather та отримайте токен
 * 2. Отримайте свій Chat ID через бота @userinfobot
 * 3. Скопіюйте цей файл як `config.php` та вкажіть власні токен і chat ID.
 */

define('TELEGRAM_BOT_TOKEN', 'YOUR_TELEGRAM_BOT_TOKEN_HERE');
define('TELEGRAM_CHAT_ID', 'YOUR_TELEGRAM_CHAT_ID_HERE');

/**
 * Функція для відправки повідомлення в Telegram
 */
function sendTelegramMessage($text) {
    $token = TELEGRAM_BOT_TOKEN;
    $chatId = TELEGRAM_CHAT_ID;

    if (empty($token) || empty($chatId) || $token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
        return false;
    }

    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $postData = http_build_query([
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'HTML'
    ]);

    // Спроба відправити через cURL
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        curl_close($ch);
        if ($response !== false) {
            return $response;
        }
    }

    // Резервний спосіб через file_get_contents, якщо cURL вимкнено
    $opts = [
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $postData,
            'timeout' => 10
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true
        ]
    ];
    $context = stream_context_create($opts);
    return @file_get_contents($url, false, $context);
}
