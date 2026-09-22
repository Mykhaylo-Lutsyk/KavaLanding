<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/config.php';

$dataPath = dirname(__DIR__) . '/data';
$dataFile = $dataPath . '/reviews.json';

// Створюємо папку data, якщо вона відсутня
if (!is_dir($dataPath)) {
    mkdir($dataPath, 0777, true);
}

// Завантажуємо існуючі відгуки
$reviews = [];
if (file_exists($dataFile)) {
    $content = file_get_contents($dataFile);
    $decoded = json_decode($content, true);
    if (is_array($decoded)) {
        $reviews = $decoded;
    }
}

// GET-запит: повертаємо всі збережені відгуки
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo json_encode($reviews, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// POST-запит: збереження нового відгуку
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data) {
        $data = $_POST;
    }

    $author = trim($data['author'] ?? '');
    $variety = trim($data['variety'] ?? 'Кава Swisso');
    $text = trim($data['text'] ?? '');
    $rating = intval($data['rating'] ?? 5);

    if ($rating < 1 || $rating > 5) {
        $rating = 5;
    }

    if (empty($author) || empty($text)) {
        echo json_encode([
            'success' => false,
            'error' => 'Будь ласка, заповніть ім\'я та текст відгуку.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $newReview = [
        'id' => uniqid('rev_'),
        'author' => htmlspecialchars($author),
        'variety' => htmlspecialchars($variety),
        'text' => htmlspecialchars($text),
        'rating' => $rating,
        'date' => date('d.m.Y'),
        'created_at' => time()
    ];

    // Додаємо новий відгук на початок списку
    array_unshift($reviews, $newReview);

    // Зберігаємо у файл reviews.json
    file_put_contents($dataFile, json_encode($reviews, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);

    // Відправляємо сповіщення власнику в Telegram про новий відгук
    $starsStr = str_repeat('⭐', $rating);
    $telegramText = "🌟 <b>НОВИЙ ВІДГУК НА САЙТІ!</b>\n\n"
                  . "👤 <b>Автор:</b> {$newReview['author']}\n"
                  . "☕ <b>Сорт:</b> {$newReview['variety']}\n"
                  . "⭐ <b>Оцінка:</b> {$starsStr} ({$rating}/5)\n"
                  . "💬 <b>Відгук:</b>\n<i>\"{$newReview['text']}\"</i>\n\n"
                  . "🕒 <i>Дата: {$newReview['date']}</i>";

    sendTelegramMessage($telegramText);

    echo json_encode([
        'success' => true,
        'message' => 'Відгук успішно опубліковано!',
        'review' => $newReview,
        'reviews' => $reviews
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
