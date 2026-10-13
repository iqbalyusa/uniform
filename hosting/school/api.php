<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function fail_request(int $status, string $message): never {
    http_response_code($status);
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}
$config = require __DIR__ . '/config.php';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    fail_request(405, 'Metode tidak didukung.');
}
$route = $_GET['route'] ?? '';
if (!is_string($route)) { fail_request(404, 'Halaman API tidak ditemukan.'); }
$parts = explode('?', $route, 2);
$endpoint = $parts[0];
if (!preg_match('~^(state|history|backup(?:/[a-zA-Z0-9:_-]+)?|movement|import|settings|members)$~D', $endpoint)) {
    fail_request(404, 'Halaman API tidak ditemukan.');
}
if ($method === 'GET' && !in_array($endpoint, ['state', 'history', 'backup'], true) && !str_starts_with($endpoint, 'backup/')) {
    fail_request(405, 'Metode tidak didukung.');
}
if ($method === 'POST' && !in_array($endpoint, ['movement', 'import', 'settings', 'members'], true)) {
    fail_request(405, 'Metode tidak didukung.');
}
$body = null;
if ($method === 'POST') {
    if (($_SERVER['HTTP_ORIGIN'] ?? '') !== $config['origin']) {
        fail_request(403, 'Permintaan tidak berasal dari aplikasi ini.');
    }
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
        fail_request(415, 'Format permintaan harus JSON.');
    }
    $body = file_get_contents('php://input', false, null, 0, 3000001);
    if ($body === false || strlen($body) > 3000000) {
        fail_request(413, 'Data terlalu besar.');
    }
    try { json_decode($body, true, 512, JSON_THROW_ON_ERROR); }
    catch (JsonException $error) { fail_request(400, 'JSON tidak valid.'); }
}
if (!function_exists('curl_init')) {
    fail_request(503, 'Ekstensi PHP cURL belum diaktifkan pada hosting.');
}
$query = $parts[1] ?? '';
$url = $config['upstream'] . '/api/' . $endpoint . ($query !== '' ? '?' . $query : '');
$curl = curl_init($url);
$options = [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 40,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
];
if ($method === 'POST') {
    $options[CURLOPT_POST] = true;
    $options[CURLOPT_POSTFIELDS] = $body;
    // Browser origin is checked above; the server request uses the Worker's own origin.
    $options[CURLOPT_HTTPHEADER] = ['Content-Type: application/json', 'Origin: ' . $config['upstream']];
}
curl_setopt_array($curl, $options);
$response = curl_exec($curl);
$status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$type = (string) curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
curl_close($curl);
if ($response === false || $status < 200 || $status >= 600 || stripos($type, 'application/json') === false) {
    fail_request(502, 'Layanan stok belum merespons. Muat ulang sebelum mencoba menyimpan kembali.');
}
http_response_code($status);
echo $response;
