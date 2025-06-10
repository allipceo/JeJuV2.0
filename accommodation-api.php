<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// 숙박 API 프록시 서버
class AccommodationAPI {
    private $accommodations;
    
    public function __construct() {
        $this->initializeData();
    }
    
    // 실시간 숙박 데이터 초기화
    private function initializeData() {
        $this->accommodations = [
            [
                'id' => 'hotel_001',
                'name' => '제주 신라호텔',
                'type' => 'hotel',
                'location' => 'jeju-city',
                'address' => '제주시 연동 신라로 75',
                'rating' => 4.7,
                'reviews' => 1234,
                'price_range' => 'premium',
                'base_price' => 350000,
                'current_price' => 320000,
                'discount_rate' => 8,
                'available_rooms' => 12,
                'features' => ['오션뷰', '실내수영장', '스파', '피트니스', '무료WiFi', '무료주차'],
                'room_types' => [
                    ['type' => '스탠다드', 'price' => 320000, 'available' => 5],
                    ['type' => '디럭스', 'price' => 450000, 'available' => 4],
                    ['type' => '스위트', 'price' => 680000, 'available' => 3]
                ],
                'images' => ['hotel1.jpg', 'hotel1_2.jpg'],
                'last_updated' => date('Y-m-d H:i:s')
            ],
            [
                'id' => 'resort_001', 
                'name' => '롯데시티호텔 제주',
                'type' => 'hotel',
                'location' => 'jeju-city',
                'address' => '제주시 도령로 83',
                'rating' => 4.5,
                'reviews' => 987,
                'price_range' => 'premium',
                'base_price' => 280000,
                'current_price' => 252000,
                'discount_rate' => 10,
                'available_rooms' => 8,
                'features' => ['시티뷰', '비즈니스센터', '레스토랑', '무료WiFi', '주차가능'],
                'room_types' => [
                    ['type' => '스탠다드', 'price' => 252000, 'available' => 3],
                    ['type' => '비즈니스', 'price' => 320000, 'available' => 5]
                ],
                'images' => ['hotel2.jpg'],
                'last_updated' => date('Y-m-d H:i:s')
            ]
        ];
    }
    
    // 실시간 가격 업데이트 (동적 가격 시뮬레이션)
    private function updatePrices() {
        foreach ($this->accommodations as &$hotel) {
            // 시간대별 동적 가격 조정
            $hour = (int)date('H');
            $priceMultiplier = 1.0;
            
            // 새벽/밤 시간대 할인
            if ($hour >= 1 && $hour <= 6) {
                $priceMultiplier = 0.85;
            }
            // 낮 시간대 정상가
            elseif ($hour >= 10 && $hour <= 18) {
                $priceMultiplier = 1.0;
            }
            // 저녁 시간대 소폭 할인
            else {
                $priceMultiplier = 0.95;
            }
            
            $hotel['current_price'] = round($hotel['base_price'] * $priceMultiplier);
            $hotel['discount_rate'] = round((1 - $priceMultiplier) * 100);
            
            // 남은 방 수 랜덤 업데이트 (재고 시뮬레이션)
            $hotel['available_rooms'] = rand(3, 15);
        }
    }
    
    // 숙박시설 목록 조회
    public function getAccommodations($filters = []) {
        $this->updatePrices();
        
        $filtered = $this->accommodations;
        
        // 타입 필터
        if (!empty($filters['type'])) {
            $filtered = array_filter($filtered, function($hotel) use ($filters) {
                return $hotel['type'] === $filters['type'];
            });
        }
        
        // 지역 필터  
        if (!empty($filters['location'])) {
            $filtered = array_filter($filtered, function($hotel) use ($filters) {
                return $hotel['location'] === $filters['location'];
            });
        }
        
        // 가격대 필터
        if (!empty($filters['price_range'])) {
            $filtered = array_filter($filtered, function($hotel) use ($filters) {
                return $hotel['price_range'] === $filters['price_range'];
            });
        }
        
        return array_values($filtered);
    }
}

// API 엔드포인트 처리
$api = new AccommodationAPI();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_GET['action'] ?? 'list';

try {
    switch ($path) {
        case 'list':
            $filters = $_GET;
            unset($filters['action']);
            $result = $api->getAccommodations($filters);
            echo json_encode([
                'success' => true,
                'data' => $result,
                'count' => count($result),
                'timestamp' => date('Y-m-d H:i:s')
            ], JSON_UNESCAPED_UNICODE);
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'error' => 'Invalid endpoint'
            ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
