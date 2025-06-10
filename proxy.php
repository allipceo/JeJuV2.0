<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// 옵션 요청 처리
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// API 키 설정
$API_KEYS = [
    'weather' => 'f778d7297860bfbedb1aca5db5dae290',
    'aviation' => '80Ht7+KMEG5iy9QXzIUGVjOdpqcWqz7KtWeXWZgr2WNFZWKxNZDEBUhpgE40FnXXYvMz4qiRXJDmcRihEzm+ZA==',
    'traffic' => '80Ht7+KMEG5iy9QXzIUGVjOdpqcWqz7KtWeXWZgr2WNFZWKxNZDEBUhpgE40FnXXYvMz4qiRXJDmcRihEzm+ZA==',
    'bus' => '80Ht7+KMEG5iy9QXzIUGVjOdpqcWqz7KtWeXWZgr2WNFZWKxNZDEBUhpgE40FnXXYvMz4qiRXJDmcRihEzm+ZA==',
    'ferry' => '80Ht7+KMEG5iy9QXzIUGVjOdpqcWqz7KtWeXWZgr2WNFZWKxNZDEBUhpgE40FnXXYvMz4qiRXJDmcRihEzm+ZA==',
    'tourism' => '80Ht7+KMEG5iy9QXzIUGVjOdpqcWqz7KtWeXWZgr2WNFZWKxNZDEBUhpgE40FnXXYvMz4qiRXJDmcRihEzm+ZA=='
];

// 입력 파라미터 검증
$service = $_GET['service'] ?? '';
$type = $_GET['type'] ?? '';

if (empty($service) || empty($type)) {
    echo json_encode([
        'success' => false, 
        'error' => '서비스와 타입 파라미터가 필요합니다',
        'example' => 'proxy.php?service=weather&type=current'
    ]);
    exit;
}

// 허용된 서비스 목록
$allowed_services = ['weather', 'aviation', 'traffic', 'bus', 'ferry', 'tourism'];
if (!in_array($service, $allowed_services)) {
    echo json_encode([
        'success' => false, 
        'error' => '지원하지 않는 서비스입니다',
        'allowed' => $allowed_services
    ]);
    exit;
}

// API URL 매핑 함수
function getApiUrl($service, $type, $apiKey) {
    $urls = [
        'weather' => [
            'current' => "https://api.openweathermap.org/data/2.5/weather?q=Jeju,KR&appid={$apiKey}&units=metric&lang=kr",
            'forecast' => "https://api.openweathermap.org/data/2.5/forecast?q=Jeju,KR&appid={$apiKey}&units=metric&lang=kr",
            'alerts' => "https://api.openweathermap.org/data/2.5/onecall?lat=33.4996&lon=126.5312&appid={$apiKey}&exclude=minutely,hourly,daily&lang=kr"
        ],
        'aviation' => [
            'arrivals' => "http://openapi.airport.co.kr/service/rest/FlightStatusList/getFlightStatusList?serviceKey={$apiKey}&schAirportCode=CJU&schLineType=A",
            'departures' => "http://openapi.airport.co.kr/service/rest/FlightStatusList/getFlightStatusList?serviceKey={$apiKey}&schAirportCode=CJU&schLineType=D"
        ]
    ];
    
    return $urls[$service][$type] ?? null;
}

// API URL 생성
$apiUrl = getApiUrl($service, $type, $API_KEYS[$service]);
if (!$apiUrl) {
    echo json_encode([
        'success' => false, 
        'error' => '지원하지 않는 API 타입입니다',
        'service' => $service,
        'type' => $type
    ]);
    exit;
}

// 캐싱 로직 (5분 캐시)
$cacheKey = md5($service . '_' . $type);
$cacheFile = "cache/{$cacheKey}.json";
$cacheTime = 300; // 5분

// 캐시 디렉토리 생성
if (!is_dir('cache')) {
    mkdir('cache', 0755, true);
}

// 캐시 확인
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTime) {
    $cachedData = file_get_contents($cacheFile);
    echo $cachedData;
    exit;
}

// API 호출 함수
function callApi($url) {
    $context = stream_context_create([
        'http' => [
            'timeout' => 10,
            'method' => 'GET',
            'header' => 'User-Agent: JejuTourismPlatform/1.0'
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    if ($response === false) {
        return [
            'success' => false,
            'error' => 'API 호출 실패',
            'url' => $url
        ];
    }
    
    return [
        'success' => true,
        'data' => json_decode($response, true),
        'timestamp' => time(),
        'cached' => false
    ];
}

// API 호출 실행
$result = callApi($apiUrl);

// 성공한 경우 캐시 저장
if ($result['success']) {
    $responseData = json_encode($result, JSON_UNESCAPED_UNICODE);
    file_put_contents($cacheFile, $responseData);
    echo $responseData;
} else {
    // 실패 시 폴백 데이터
    include 'fallback_data.php';
    $fallbackData = getFallbackData($service, $type);
    echo json_encode($fallbackData, JSON_UNESCAPED_UNICODE);
}
?>
