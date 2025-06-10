/**
 * 제주도 대중교통 정보 최적화 서비스
 * PHP 프록시 연동 + 빠른 로딩 최적화
 * 작성일: 2025.06.08
 * 버전: 2.0
 */

class JejuTransportOptimized {
    constructor() {
        this.proxyUrl = 'proxy.php';
        this.cache = new Map();
        this.cacheTime = 5 * 60 * 1000; // 5분 캐시 (단축)
        this.loadingTimeouts = new Map();
        this.init();
    }

    /**
     * 최적화된 초기화
     */
    async init() {
        console.log('🚌 교통정보 최적화 서비스 시작...');
        
        // 동시 로딩으로 속도 향상
        const promises = [
            this.loadAviationDataFast(),
            this.loadTrafficDataFast(),
            this.loadBusDataFast(),
            this.loadFerryDataFast()
        ];

        // 각 API에 2초 타임아웃 설정
        const timeoutPromises = promises.map(promise => 
            this.withTimeout(promise, 2000)
        );

        try {
            await Promise.allSettled(timeoutPromises);
            console.log('✅ 교통정보 로딩 완료');
        } catch (error) {
            console.warn('⚠️ 일부 교통정보 로딩 지연, 기본 데이터 표시');
            this.showFallbackData();
        }

        this.setupFastRefresh();
    }

    /**
     * 타임아웃 설정 헬퍼
     */
    withTimeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), ms)
            )
        ]);
    }

    /**
     * 빠른 항공편 정보 로딩
     */
    async loadAviationDataFast() {
        const container = document.getElementById('aviation-content');
        if (!container) return;

        // 즉시 로딩 표시
        container.innerHTML = `
            <div class="quick-loading">
                <div class="loading-dots">⚡ 실시간 항공편 확인 중...</div>
            </div>
        `;

        try {
            const [arrivals, departures] = await Promise.allSettled([
                fetch(`${this.proxyUrl}?service=aviation&type=arrivals`),
                fetch(`${this.proxyUrl}?service=aviation&type=departures`)
            ]);

            let arrivalsData = [], departuresData = [];

            if (arrivals.status === 'fulfilled') {
                const arrivalsResponse = await arrivals.value.json();
                arrivalsData = arrivalsResponse.success ? arrivalsResponse.data.items || [] : [];
            }

            if (departures.status === 'fulfilled') {
                const departuresResponse = await departures.value.json();
                departuresData = departuresResponse.success ? departuresResponse.data.items || [] : [];
            }

            this.displayAviationData(arrivalsData, departuresData);

        } catch (error) {
            console.warn('⚠️ 항공편 정보 빠른 로드 실패:', error);
            this.displayDefaultAviationData();
        }
    }

    /**
     * 빠른 교통량 정보 로딩
     */
    async loadTrafficDataFast() {
        const container = document.getElementById('traffic-content');
        if (!container) return;

        container.innerHTML = `
            <div class="quick-loading">
                <div class="loading-dots">🛣️ 실시간 교통량 확인 중...</div>
            </div>
        `;

        try {
            const response = await fetch(`${this.proxyUrl}?service=traffic&type=info`);
            const data = await response.json();

            if (data.success) {
                this.displayTrafficData(data.data.routes || []);
            } else {
                this.displayDefaultTrafficData();
            }

        } catch (error) {
            console.warn('⚠️ 교통량 정보 빠른 로드 실패:', error);
            this.displayDefaultTrafficData();
        }
    }

    /**
     * 빠른 버스 정보 로딩
     */
    async loadBusDataFast() {
        const container = document.getElementById('bus-content');
        if (!container) return;

        container.innerHTML = `
            <div class="quick-loading">
                <div class="loading-dots">🚌 버스 노선 확인 중...</div>
            </div>
        `;

        try {
            const response = await fetch(`${this.proxyUrl}?service=bus&type=routes`);
            const data = await response.json();

            if (data.success) {
                this.displayBusData(data.data.busRoutes || []);
            } else {
                this.displayDefaultBusData();
            }

        } catch (error) {
            console.warn('⚠️ 버스 정보 빠른 로드 실패:', error);
            this.displayDefaultBusData();
        }
    }

    /**
     * 빠른 여객선 정보 로딩
     */
    async loadFerryDataFast() {
        const container = document.getElementById('ferry-content');
        if (!container) return;

        container.innerHTML = `
            <div class="quick-loading">
                <div class="loading-dots">🚢 여객선 운항 확인 중...</div>
            </div>
        `;

        try {
            const response = await fetch(`${this.proxyUrl}?service=ferry&type=schedules`);
            const data = await response.json();

            if (data.success) {
                this.displayFerryData(data.data.ferries || []);
            } else {
                this.displayDefaultFerryData();
            }

        } catch (error) {
            console.warn('⚠️ 여객선 정보 빠른 로드 실패:', error);
            this.displayDefaultFerryData();
        }
    }

    /**
     * 항공편 데이터 표시
     */
    displayAviationData(arrivals, departures) {
        const container = document.getElementById('aviation-content');
        if (!container) return;

        const aviationHTML = `
            <div class="aviation-sections">
                <div class="arrivals-section">
                    <h4>✈️ 도착편</h4>
                    <div class="flights-list">
                        ${arrivals.slice(0, 5).map(flight => `
                            <div class="flight-item">
                                <div class="flight-info">
                                    <span class="flight-number">${flight.flightId || 'KE1201'}</span>
                                    <span class="airline">${flight.airline || '대한항공'}</span>
                                </div>
                                <div class="flight-route">
                                    <span class="origin">${flight.origin || '김포'}</span>
                                    <span class="arrow">→</span>
                                    <span class="destination">제주</span>
                                </div>
                                <div class="flight-time">
                                    <span class="schedule">${flight.scheduleTime || '09:30'}</span>
                                    <span class="status ${this.getFlightStatusClass(flight.status)}">${flight.status || '정시'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="departures-section">
                    <h4>🛫 출발편</h4>
                    <div class="flights-list">
                        ${departures.slice(0, 5).map(flight => `
                            <div class="flight-item">
                                <div class="flight-info">
                                    <span class="flight-number">${flight.flightId || 'OZ8901'}</span>
                                    <span class="airline">${flight.airline || '아시아나'}</span>
                                </div>
                                <div class="flight-route">
                                    <span class="origin">제주</span>
                                    <span class="arrow">→</span>
                                    <span class="destination">${flight.destination || '부산'}</span>
                                </div>
                                <div class="flight-time">
                                    <span class="schedule">${flight.scheduleTime || '10:15'}</span>
                                    <span class="status ${this.getFlightStatusClass(flight.status)}">${flight.status || '정시'}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="last-update">마지막 업데이트: ${new Date().toLocaleTimeString('ko-KR')}</div>
        `;

        container.innerHTML = aviationHTML;
    }

    /**
     * 기본 항공편 데이터 표시
     */
    displayDefaultAviationData() {
        const container = document.getElementById('aviation-content');
        if (!container) return;

        container.innerHTML = `
            <div class="default-aviation">
                <div class="default-info">
                    <span class="info-icon">✈️</span>
                    <div class="info-text">
                        <strong>제주공항 운항 정보</strong>
                        <small>실시간 데이터 일시 불가, 일반적인 운항 정보를 표시합니다</small>
                    </div>
                </div>
                <div class="general-schedule">
                    <div class="schedule-item">
                        <span class="time">06:00 - 22:00</span>
                        <span class="desc">김포↔제주 (15분 간격)</span>
                    </div>
                    <div class="schedule-item">
                        <span class="time">07:00 - 21:30</span>
                        <span class="desc">부산↔제주 (30분 간격)</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 빠른 새로고침 설정
     */
    setupFastRefresh() {
        // 30초마다 빠른 업데이트
        setInterval(() => {
            this.refreshVisibleTab();
        }, 30000);
    }

    /**
     * 현재 보이는 탭만 새로고침
     */
    refreshVisibleTab() {
        const activeTab = document.querySelector('.transport-tab.active');
        if (!activeTab) return;

        const tabType = activeTab.dataset.tab;
        
        switch(tabType) {
            case 'aviation':
                this.loadAviationDataFast();
                break;
            case 'traffic':
                this.loadTrafficDataFast();
                break;
            case 'bus':
                this.loadBusDataFast();
                break;
            case 'ferry':
                this.loadFerryDataFast();
                break;
        }
    }

    /**
     * 항공편 상태 CSS 클래스 반환
     */
    getFlightStatusClass(status) {
        const statusMap = {
            '정시': 'on-time',
            '지연': 'delayed',
            '취소': 'cancelled',
            '도착': 'arrived',
            '출발': 'departed'
        };
        return statusMap[status] || 'on-time';
    }
}

// DOM 로드 완료 후 즉시 실행
document.addEventListener('DOMContentLoaded', () => {
    window.jejuTransportOptimized = new JejuTransportOptimized();
});
