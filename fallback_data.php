<?php
function getFallbackData($service, $type) {
    $fallbackData = [
        'weather' => [
            'current' => [
                'success' => true,
                'data' => [
                    'main' => ['temp' => 22, 'feels_like' => 24, 'humidity' => 65],
                    'weather' => [['main' => 'Clear', 'description' => '맑음']],
                    'wind' => ['speed' => 3.2],
                    'name' => '제주시'
                ],
                'fallback' => true,
                'message' => '실시간 데이터 일시 불가, 평균 데이터 표시'
            ],
            'alerts' => [
                'success' => true,
                'data' => [
                    'alerts' => [
                        [
                            'event' => '강풍주의보',
                            'description' => '제주도 전체에 강풍주의보가 발효 중입니다.',
                            'start' => time(),
                            'end' => time() + 86400
                        ]
                    ]
                ],
                'fallback' => true
            ]
        ],
        'aviation' => [
            'arrivals' => [
                'success' => true,
                'data' => [
                    'items' => [
                        ['flightId' => 'KE1201', 'airline' => '대한항공', 'origin' => '김포', 'scheduleTime' => '09:30', 'estimatedTime' => '09:35', 'status' => '도착'],
                        ['flightId' => 'OZ8901', 'airline' => '아시아나', 'origin' => '부산', 'scheduleTime' => '10:15', 'estimatedTime' => '10:15', 'status' => '정시']
                    ]
                ],
                'fallback' => true
            ]
        ],
        'traffic' => [
            'info' => [
                'success' => true,
                'data' => [
                    'routes' => [
                        ['name' => '제주공항-중문', 'status' => '원활', 'speed' => 65],
                        ['name' => '제주시-서귀포', 'status' => '보통', 'speed' => 45],
                        ['name' => '한림-성산', 'status' => '혼잡', 'speed' => 35]
                    ]
                ],
                'fallback' => true
            ]
        ],
        'bus' => [
            'routes' => [
                'success' => true,
                'data' => [
                    'busRoutes' => [
                        ['routeNo' => '100', 'routeName' => '공항-중문', 'interval' => '15분', 'firstBus' => '05:30', 'lastBus' => '22:30'],
                        ['routeNo' => '200', 'routeName' => '공항-서귀포', 'interval' => '20분', 'firstBus' => '06:00', 'lastBus' => '21:30']
                    ]
                ],
                'fallback' => true
            ]
        ],
        'ferry' => [
            'schedules' => [
                'success' => true,
                'data' => [
                    'ferries' => [
                        ['route' => '제주-부산', 'departure' => '19:30', 'arrival' => '06:00+1', 'status' => '정상운항'],
                        ['route' => '제주-완도', 'departure' => '08:30', 'arrival' => '13:30', 'status' => '정상운항']
                    ]
                ],
                'fallback' => true
            ]
        ]
    ];
    
    return $fallbackData[$service][$type] ?? [
        'success' => false,
        'error' => '해당 서비스의 폴백 데이터가 없습니다',
        'service' => $service,
        'type' => $type
    ];
}
?>
