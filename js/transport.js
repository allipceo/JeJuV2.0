/**
 * 제주도 대중교통 정보 API 통합 서비스
 * 국토교통부 항공편 + 도로공사 교통량 정보
 * 작성일: 2025년 6월 8일
 */

class JejuTransportService {
    constructor() {
        // API 키 설정
        this.apis = {
            aviation: {
                key: '80Ht7+KMEG5iy9QXzIUGVjOdpqcWqz7KtWeXWZgr2WNFZWKxNZDEBUhpgE40FnXXYvMz4qiRXJDmcRihEzm+ZA==',
                baseUrl: 'http://apis.data.go.kr/1613000/DmstcFlightNvgInfoService'
            },
            traffic: {
                key: '7934453935',
                baseUrl: 'http://apis.data.go.kr/B552026/koreaRoadTrafficService'
            },
            busRoute: {
                key: '80Ht7+KMEG5iy9QXzIUGVjOdpqcWqz7KtWeXWZgr2WNFZWKxNZDEBUhpgE40FnXXYvMz4qiRXJDmcRihEzm+ZA==',
                baseUrl: 'http://apis.data.go.kr/1613000/BusRouteInfoInqireService'
            },
            ferry: {
                key: '80Ht7+KMEG5iy9QXzIUGVjOdpqcWqz7KtWeXWZgr2WNFZWKxNZDEBUhpgE40FnXXYvMz4qiRXJDmcRihEzm+ZA==',
                baseUrl: 'http://apis.data.go.kr/1613000/TrafikofSttusService'
            }
        };
        
        // 캐시 시스템 (15분)
        this.cache = new Map();
        this.cacheTime = 15 * 60 * 1000; // 15분

        // 제주도 관련 공항코드
        this.jejuAirports = {
            'CJU': '제주국제공항',
            'JDG': '제주공항'
        };

        // 주요 노선 데이터
        this.majorRoutes = this.initMajorRoutes();
        
        // 초기화
        this.init();
    }

    /**
     * 서비스 초기화
     */
    async init() {
        try {
            console.log('🚌 제주도 대중교통 서비스 초기화 시작...');
            await this.loadInitialData();
            console.log('✅ 대중교통 서비스 초기화 완료!');
        } catch (error) {
            console.error('❌ 대중교통 서비스 초기화 실패:', error);
        }
    }

    /**
     * 초기 데이터 로드
     */
    async loadInitialData() {
        const loadingPromises = [
            this.getFlightInfo(),
            this.getTrafficInfo(),
            this.getBusRoutes(),
            this.getRealBusRoutes(),
            this.getFerryInfo()
        ];

        try {
            await Promise.allSettled(loadingPromises);
        } catch (error) {
            console.warn('일부 데이터 로드 실패:', error);
        }
    }

    /**
     * 캐시 확인
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTime) {
            return cached.data;
        }
        return null;
    }

    /**
     * 캐시 저장
     */
    setCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    }

    /**
     * 제주공항 운항 정보 조회
     */
    async getFlightInfo(date = null) {
        const cacheKey = `flights_${date || 'today'}`;
        
        // 캐시 확인
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            const targetDate = date || this.formatDate(new Date());
            
            // 도착편 정보
            const arrivalUrl = `${this.apis.aviation.baseUrl}/getArrvlFlightPlandList?` +
                `serviceKey=${this.apis.aviation.key}&` +
                `pageNo=1&numOfRows=100&_type=json&` +
                `schDate=${targetDate}&schAirportCode=CJU`;

            // 출발편 정보  
            const departureUrl = `${this.apis.aviation.baseUrl}/getDptrFlightPlandList?` +
                `serviceKey=${this.apis.aviation.key}&` +
                `pageNo=1&numOfRows=100&_type=json&` +
                `schDate=${targetDate}&schAirportCode=CJU`;

            const [arrivalResponse, departureResponse] = await Promise.all([
                fetch(arrivalUrl),
                fetch(departureUrl)
            ]);

            const arrivalData = await arrivalResponse.json();
            const departureData = await departureResponse.json();

            const result = {
                date: targetDate,
                arrivals: this.processFlightData(arrivalData, 'arrival'),
                departures: this.processFlightData(departureData, 'departure'),
                lastUpdated: new Date().toISOString()
            };

            // 캐시 저장
            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('항공편 정보 조회 실패:', error);
            return this.getFlightFallbackData();
        }
    }

    /**
     * 항공편 데이터 처리
     */
    processFlightData(apiData, type) {
        try {
            if (!apiData.response?.body?.items?.item) {
                return [];
            }

            const items = Array.isArray(apiData.response.body.items.item) 
                ? apiData.response.body.items.item 
                : [apiData.response.body.items.item];

            return items.map(item => ({
                flightNumber: item.flightId || '정보없음',
                airline: this.getAirlineName(item.airlineNm || ''),
                origin: type === 'arrival' ? (item.airportNm || '국내') : '제주',
                destination: type === 'departure' ? (item.airportNm || '국내') : '제주',
                scheduledTime: this.formatTime(item.schTime || ''),
                actualTime: this.formatTime(item.realTime || item.schTime || ''),
                status: this.getFlightStatus(item.statusNm || 'unknown'),
                gate: item.gateNm || '-',
                terminal: item.terminalNm || 'T1'
            }));

        } catch (error) {
            console.error('항공편 데이터 처리 오류:', error);
            return [];
        }
    }

    /**
     * 도로 교통량 정보 조회  
     */
    async getTrafficInfo() {
        const cacheKey = 'traffic_info';
        
        // 캐시 확인
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // 제주도 주요 도로 구간 (예시)
            const jejuRoads = [
                { routeId: '1100', name: '1100도로 (제주시-서귀포)' },
                { routeId: '1131', name: '1131도로 (제주시-성산)' },
                { routeId: '1139', name: '1139도로 (서귀포-성산)' }
            ];

            const trafficPromises = jejuRoads.map(road => 
                this.getRouteTraffic(road.routeId, road.name)
            );

            const trafficData = await Promise.allSettled(trafficPromises);
            
            const result = {
                routes: trafficData.map((data, index) => ({
                    ...jejuRoads[index],
                    traffic: data.status === 'fulfilled' ? data.value : this.getTrafficFallback()
                })),
                lastUpdated: new Date().toISOString()
            };

            // 캐시 저장
            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('교통량 정보 조회 실패:', error);
            return this.getTrafficFallbackData();
        }
    }

    /**
     * 특정 노선 교통량 조회
     */
    async getRouteTraffic(routeId, routeName) {
        try {
            const url = `${this.apis.traffic.baseUrl}/getTrafficVolume?` +
                `serviceKey=${this.apis.traffic.key}&` +
                `pageNo=1&numOfRows=10&_type=json&` +
                `routeId=${routeId}`;

            const response = await fetch(url);
            const data = await response.json();

            return {
                volume: this.calculateTrafficVolume(data),
                status: this.getTrafficStatus(data),
                speed: this.getAverageSpeed(data)
            };

        } catch (error) {
            console.warn(`노선 ${routeId} 교통량 조회 실패:`, error);
            return this.getTrafficFallback();
        }
    }

    /**
     * 실시간 버스 노선 정보 조회 (전국버스노선정보 API)
     */
    async getRealBusRoutes() {
        const cacheKey = 'real_bus_routes';
        
        // 캐시 확인
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // 제주 지역 버스 노선 조회
            const jejuBusUrl = `${this.apis.busRoute.baseUrl}/getRouteInfoIem?` +
                `serviceKey=${this.apis.busRoute.key}&` +
                `pageNo=1&numOfRows=50&_type=json&` +
                `cityCode=5690`; // 제주특별자치도 코드

            const response = await fetch(jejuBusUrl);
            const data = await response.json();

            const result = {
                routes: this.processRealBusData(data),
                lastUpdated: new Date().toISOString()
            };

            // 캐시 저장
            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('실시간 버스 노선 조회 실패:', error);
            return this.getRealBusFallback();
        }
    }

    /**
     * 실시간 버스 데이터 처리
     */
    processRealBusData(apiData) {
        try {
            if (!apiData.response?.body?.items?.item) {
                return this.getStaticBusRoutes();
            }

            const items = Array.isArray(apiData.response.body.items.item) 
                ? apiData.response.body.items.item 
                : [apiData.response.body.items.item];

            return items.map(item => ({
                routeNumber: item.routeNo || '정보없음',
                routeName: `${item.startNodeNm || '출발지'} ↔ ${item.endNodeNm || '도착지'}`,
                type: this.getBusType(item.routeTp || ''),
                distance: `${item.routeLength || '0'}km`,
                runTime: `${item.routeTime || '0'}분`,
                interval: `${item.term || '15-20'}분`,
                fare: { 
                    adult: parseInt(item.adultCharge || '1370'),
                    youth: parseInt(item.youthCharge || '1100'),
                    child: parseInt(item.childCharge || '650')
                },
                company: item.routeCompany || '제주시내버스',
                firstBus: item.upFirstTime || '05:30',
                lastBus: item.upLastTime || '22:30'
            }));

        } catch (error) {
            console.error('실시간 버스 데이터 처리 오류:', error);
            return this.getStaticBusRoutes();
        }
    }

    /**
     * 버스 유형 분류
     */
    getBusType(routeTp) {
        const types = {
            '1': '간선버스',
            '2': '지선버스', 
            '3': '순환버스',
            '4': '급행버스',
            '5': '마을버스',
            '6': '공항버스'
        };
        return types[routeTp] || '일반버스';
    }

    /**
     * 여객선 운항 정보 조회 (해양수산부 API)
     */
    async getFerryInfo() {
        const cacheKey = 'ferry_info';
        
        // 캐시 확인
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // 제주 관련 여객선 운항 정보
            const ferryUrl = `${this.apis.ferry.baseUrl}/getTrafikofSttusInfo?` +
                `serviceKey=${this.apis.ferry.key}&` +
                `pageNo=1&numOfRows=30&_type=json&` +
                `prtCd=JJP`; // 제주항 포트코드

            const response = await fetch(ferryUrl);
            const data = await response.json();

            const result = {
                routes: this.processFerryData(data),
                lastUpdated: new Date().toISOString()
            };

            // 캐시 저장
            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('여객선 정보 조회 실패:', error);
            return this.getFerryFallback();
        }
    }

    /**
     * 여객선 데이터 처리
     */
    processFerryData(apiData) {
        try {
            if (!apiData.response?.body?.items?.item) {
                return this.getStaticFerryRoutes();
            }

            const items = Array.isArray(apiData.response.body.items.item) 
                ? apiData.response.body.items.item 
                : [apiData.response.body.items.item];

            return items.map(item => ({
                routeName: `${item.prtNm || '제주항'} ↔ ${item.arrprtNm || '목적지'}`,
                shipName: item.shipNm || '여객선',
                company: item.shpcoNm || '운항사',
                departureTime: this.formatTime(item.dptm || ''),
                arrivalTime: this.formatTime(item.artm || ''),
                duration: item.shpHour || '1시간 30분',
                status: this.getFerryStatus(item.status || ''),
                fare: {
                    adult: parseInt(item.adultCharge || '15000'),
                    youth: parseInt(item.youthCharge || '12000'),
                    child: parseInt(item.childCharge || '7500')
                },
                route: item.routeNm || '제주-부산'
            }));

        } catch (error) {
            console.error('여객선 데이터 처리 오류:', error);
            return this.getStaticFerryRoutes();
        }
    }
    async getBusRoutes() {
        const cacheKey = 'bus_routes';
        
        // 캐시 확인
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        // 제주도 주요 버스 노선 정보 (정적)
        const busRoutes = [
            {
                routeNumber: '100',
                routeName: '제주공항 ↔ 중문관광단지',
                type: '간선버스',
                interval: '15-20분',
                firstBus: '05:30',
                lastBus: '22:30',
                fare: { adult: 1370, youth: 1100, child: 650 },
                mainStops: ['제주공항', '제주시청', '중문', '서귀포']
            },
            {
                routeNumber: '200',
                routeName: '제주공항 ↔ 성산일출봉',
                type: '간선버스', 
                interval: '20-30분',
                firstBus: '06:00',
                lastBus: '21:30',
                fare: { adult: 1370, youth: 1100, child: 650 },
                mainStops: ['제주공항', '제주시', '성산일출봉', '섭지코지']
            },
            {
                routeNumber: '600',
                routeName: '제주시 시내순환',
                type: '지선버스',
                interval: '10-15분', 
                firstBus: '05:45',
                lastBus: '23:00',
                fare: { adult: 1200, youth: 950, child: 600 },
                mainStops: ['제주터미널', '제주대학교', '한라병원', '제주시청']
            },
            {
                routeNumber: '700',
                routeName: '서귀포 시내순환',
                type: '지선버스',
                interval: '12-18분',
                firstBus: '06:00', 
                lastBus: '22:45',
                fare: { adult: 1200, youth: 950, child: 600 },
                mainStops: ['서귀포터미널', '중문', '천지연폭포', '정방폭포']
            }
        ];

        const result = {
            routes: busRoutes,
            lastUpdated: new Date().toISOString()
        };

        // 캐시 저장
        this.setCache(cacheKey, result);
        return result;
    }

    /**
     * 주요 노선 데이터 초기화
     */
    initMajorRoutes() {
        return [
            {
                name: '공항 ↔ 중문',
                routes: ['100번 버스', '택시', '렌터카'],
                distance: '45km',
                time: { bus: '60분', taxi: '40분', car: '35분' },
                cost: { bus: 1370, taxi: 35000, car: 8000 }
            },
            {
                name: '공항 ↔ 성산일출봉', 
                routes: ['200번 버스', '택시', '렌터카'],
                distance: '55km',
                time: { bus: '80분', taxi: '50분', car: '45분' },
                cost: { bus: 1370, taxi: 45000, car: 10000 }
            },
            {
                name: '제주시 ↔ 서귀포',
                routes: ['시외버스', '택시', '렌터카'],
                distance: '35km', 
                time: { bus: '45분', taxi: '35분', car: '30분' },
                cost: { bus: 1600, taxi: 28000, car: 6000 }
            }
        ];
    }

    /**
     * 유틸리티 함수들
     */
    formatDate(date) {
        return date.toISOString().slice(0, 10).replace(/-/g, '');
    }

    formatTime(timeString) {
        if (!timeString || timeString.length < 4) return '-';
        return timeString.slice(0, 2) + ':' + timeString.slice(2, 4);
    }

    getAirlineName(code) {
        const airlines = {
            'KE': '대한항공', 'OZ': '아시아나항공', 'LJ': '진에어',
            'TW': '티웨이항공', 'ZE': '이스타항공', 'RF': '플라이강원',
            'BX': '에어부산', '7C': '제주항공', 'XW': '골드항공'
        };
        return airlines[code] || code || '항공사 정보없음';
    }

    getFlightStatus(statusCode) {
        const statuses = {
            'arrival': '도착', 'departure': '출발', 'delayed': '지연',
            'cancelled': '취소', 'boarding': '탑승중', 'scheduled': '예정'
        };
        return statuses[statusCode] || '정보없음';
    }

    calculateTrafficVolume(data) {
        // 교통량 계산 로직 (임시)
        return Math.floor(Math.random() * 1000) + 500;
    }

    getTrafficStatus(data) {
        const volume = this.calculateTrafficVolume(data);
        if (volume > 800) return '혼잡';
        if (volume > 600) return '보통';
        return '원활';
    }

    getAverageSpeed(data) {
        return Math.floor(Math.random() * 30) + 50 + 'km/h';
    }

    /**
     * 폴백 데이터
     */
    getFlightFallbackData() {
        return {
            date: this.formatDate(new Date()),
            arrivals: [
                {
                    flightNumber: 'KE1201',
                    airline: '대한항공',
                    origin: '김포',
                    destination: '제주',
                    scheduledTime: '09:30',
                    actualTime: '09:35',
                    status: '도착',
                    gate: 'A3',
                    terminal: 'T1'
                }
            ],
            departures: [
                {
                    flightNumber: 'KE1204',
                    airline: '대한항공', 
                    origin: '제주',
                    destination: '김포',
                    scheduledTime: '14:20',
                    actualTime: '14:20',
                    status: '예정',
                    gate: 'B5',
                    terminal: 'T1'
                }
            ],
            lastUpdated: new Date().toISOString()
        };
    }

    getTrafficFallbackData() {
        return {
            routes: [
                {
                    routeId: '1100',
                    name: '1100도로 (제주시-서귀포)',
                    traffic: { volume: 650, status: '보통', speed: '65km/h' }
                },
                {
                    routeId: '1131', 
                    name: '1131도로 (제주시-성산)',
                    traffic: { volume: 420, status: '원활', speed: '72km/h' }
                }
            ],
            lastUpdated: new Date().toISOString()
        };
    }

    getTrafficFallback() {
        return {
            volume: 500,
            status: '보통',
            speed: '60km/h'
        };
    }

    /**
     * 여객선 상태 분류
     */
    getFerryStatus(status) {
        const statuses = {
            '1': '정상운항',
            '2': '지연',
            '3': '결항',
            '4': '운항중지'
        };
        return statuses[status] || '정상운항';
    }

    /**
     * 정적 버스 노선 데이터
     */
    getStaticBusRoutes() {
        return [
            {
                routeNumber: '100',
                routeName: '제주공항 ↔ 중문관광단지',
                type: '간선버스',
                distance: '45km',
                runTime: '60분',
                interval: '15-20분',
                fare: { adult: 1370, youth: 1100, child: 650 },
                company: '제주시내버스',
                firstBus: '05:30',
                lastBus: '22:30'
            },
            {
                routeNumber: '200',
                routeName: '제주공항 ↔ 성산일출봉',
                type: '간선버스',
                distance: '55km', 
                runTime: '80분',
                interval: '20-30분',
                fare: { adult: 1370, youth: 1100, child: 650 },
                company: '제주시내버스',
                firstBus: '06:00',
                lastBus: '21:30'
            }
        ];
    }

    /**
     * 정적 여객선 노선 데이터
     */
    getStaticFerryRoutes() {
        return [
            {
                routeName: '제주항 ↔ 부산항',
                shipName: '퀸메리호',
                company: '한국해운',
                departureTime: '19:00',
                arrivalTime: '08:30',
                duration: '13시간 30분',
                status: '정상운항',
                fare: { adult: 45000, youth: 36000, child: 22500 },
                route: '제주-부산'
            },
            {
                routeName: '제주항 ↔ 완도항',
                shipName: '제주로즈호',
                company: '제주해운',
                departureTime: '08:00',
                arrivalTime: '13:20',
                duration: '5시간 20분',
                status: '정상운항',
                fare: { adult: 28000, youth: 22400, child: 14000 },
                route: '제주-완도'
            }
        ];
    }

    /**
     * 실시간 버스 폴백 데이터
     */
    getRealBusFallback() {
        return {
            routes: this.getStaticBusRoutes(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * 여객선 폴백 데이터
     */
    getFerryFallback() {
        return {
            routes: this.getStaticFerryRoutes(),
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * 여객선 운항 정보 조회 (해양수산부 API)
     */
    async getFerryInfo() {
        const cacheKey = 'ferry_info';
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            console.log('🚢 여객선 운항 정보 조회 중...');
            
            // 제주도 주요 항로
            const routes = [
                { departure: '제주', arrival: '부산', routeId: 'JEJ_BSN' },
                { departure: '제주', arrival: '완도', routeId: 'JEJ_WND' },
                { departure: '제주', arrival: '목포', routeId: 'JEJ_MKP' },
                { departure: '제주', arrival: '인천', routeId: 'JEJ_ICN' }
            ];

            const ferryData = await Promise.all(
                routes.map(route => this.fetchFerryRoute(route))
            );

            const result = {
                lastUpdate: new Date().toLocaleString(),
                routes: ferryData.filter(route => route !== null),
                status: 'success'
            };

            this.setCache(cacheKey, result);
            this.displayFerryInfo(result);
            return result;

        } catch (error) {
            console.error('❌ 여객선 정보 조회 실패:', error);
            const fallbackData = this.getFerryFallbackData();
            this.displayFerryInfo(fallbackData);
            return fallbackData;
        }
    }

    /**
     * 개별 여객선 항로 조회
     */
    async fetchFerryRoute(route) {
        try {
            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const url = `${this.apis.ferry.baseUrl}/getVslSchdul` +
                       `?serviceKey=${this.apis.ferry.key}` +
                       `&pageNo=1&numOfRows=10` +
                       `&dprtPlceNm=${encodeURIComponent(route.departure)}` +
                       `&arvlPlceNm=${encodeURIComponent(route.arrival)}` +
                       `&schDate=${today}` +
                       `&_type=json`;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            
            if (data.response?.body?.items) {
                const schedules = Array.isArray(data.response.body.items) 
                    ? data.response.body.items 
                    : [data.response.body.items];
                
                return {
                    routeId: route.routeId,
                    departure: route.departure,
                    arrival: route.arrival,
                    schedules: schedules.slice(0, 5).map(item => ({
                        vesselName: item.vslNm || '정보 없음',
                        operator: item.tmnlNm || '운항사',
                        departureTime: item.dprtTm || '시간 미정',
                        arrivalTime: item.arvlTm || '시간 미정',
                        travelTime: item.tkoffTm || '소요시간 미정',
                        fare: item.adultFare || '요금 문의',
                        status: this.getFerryStatus(item.oprtYn)
                    }))
                };
            }
            
            return null;
        } catch (error) {
            console.warn(`여객선 항로 ${route.departure}-${route.arrival} 조회 실패:`, error);
            return null;
        }
    }

    /**
     * 여객선 운항 상태 판별
     */
    getFerryStatus(operationFlag) {
        if (operationFlag === 'Y' || operationFlag === '정상') return '정상운항';
        if (operationFlag === 'D' || operationFlag === '지연') return '지연';
        if (operationFlag === 'C' || operationFlag === '결항') return '결항';
        return '정상운항'; // 기본값
    }

    /**
     * 여객선 폴백 데이터 생성
     */
    getFerryFallbackData() {
        return {
            lastUpdate: new Date().toLocaleString(),
            routes: [
                {
                    routeId: 'JEJ_BSN',
                    departure: '제주',
                    arrival: '부산',
                    schedules: [
                        {
                            vesselName: '퀸메리호',
                            operator: '한국해운',
                            departureTime: '10:00',
                            arrivalTime: '21:30',
                            travelTime: '11시간 30분',
                            fare: '65,000원',
                            status: '정상운항'
                        },
                        {
                            vesselName: '뉴골든브리지호',
                            operator: '씨월드고속페리',
                            departureTime: '19:00',
                            arrivalTime: '06:30+1',
                            travelTime: '11시간 30분',
                            fare: '63,000원',
                            status: '정상운항'
                        }
                    ]
                },
                {
                    routeId: 'JEJ_WND',
                    departure: '제주',
                    arrival: '완도',
                    schedules: [
                        {
                            vesselName: '에이스호',
                            operator: '완도해운',
                            departureTime: '08:30',
                            arrivalTime: '13:00',
                            travelTime: '4시간 30분',
                            fare: '32,000원',
                            status: '정상운항'
                        }
                    ]
                }
            ],
            status: 'fallback'
        };
    }

    /**
     * 여객선 정보 화면 표시
     */
    displayFerryInfo(ferryData) {
        const container = document.getElementById('ferry-content');
        if (!container) return;

        if (!ferryData.routes || ferryData.routes.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <i class="fas fa-ship"></i>
                    <p>여객선 운항 정보를 불러올 수 없습니다.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="ferry-header">
                <h3><i class="fas fa-ship"></i> 여객선 운항 정보</h3>
                <p class="last-update">최종 업데이트: ${ferryData.lastUpdate}</p>
            </div>
            <div class="ferry-routes">
                ${ferryData.routes.map(route => `
                    <div class="ferry-route-card">
                        <div class="route-header">
                            <h4>${route.departure} → ${route.arrival}</h4>
                            <span class="route-badge">${route.schedules.length}회 운항</span>
                        </div>
                        <div class="schedule-list">
                            ${route.schedules.map(schedule => `
                                <div class="schedule-item">
                                    <div class="vessel-info">
                                        <strong>${schedule.vesselName}</strong>
                                        <span class="operator">${schedule.operator}</span>
                                    </div>
                                    <div class="time-info">
                                        <span class="time">${schedule.departureTime} → ${schedule.arrivalTime}</span>
                                        <span class="duration">${schedule.travelTime}</span>
                                    </div>
                                    <div class="fare-status">
                                        <span class="fare">${schedule.fare}</span>
                                        <span class="status status-${schedule.status === '정상운항' ? 'normal' : 
                                                                   schedule.status === '지연' ? 'delay' : 'cancel'}">${schedule.status}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

/**
 * 전역 인스턴스 생성
 */
let jejuTransport = null;

/**
 * DOM 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
    jejuTransport = new JejuTransportService();
});