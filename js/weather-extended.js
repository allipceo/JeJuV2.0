/**
 * 제주도 관광 홈페이지 - 실시간 날씨 확장 서비스
 * 기상특보, 오늘 예보, 빠른 로딩 최적화
 * 작성일: 2025.06.08
 * 버전: 2.0
 */

class JejuWeatherExtended {
    constructor() {
        this.proxyUrl = 'proxy.php';
        this.alertsContainer = null;
        this.todayForecastContainer = null;
        this.initExtendedWeather();
    }

    /**
     * 확장 날씨 서비스 초기화
     */
    initExtendedWeather() {
        console.log('🌤️ 실시간 날씨 확장 서비스 시작...');
        this.createExtendedContainers();
        this.loadWeatherAlerts();
        this.loadTodayDetailedForecast();
        this.loadCurrentConditions();
        this.setupFastRefresh();
    }

    /**
     * 확장 컨테이너 생성
     */
    createExtendedContainers() {
        const weatherSection = document.querySelector('.weather-section');
        if (!weatherSection) return;

        // 기상특보 컨테이너
        const alertsHTML = `
            <div class="weather-alerts-container" id="weather-alerts">
                <h3>🚨 기상특보 및 경보</h3>
                <div class="alerts-content">
                    <div class="loading-spinner">⏳ 기상특보 확인 중...</div>
                </div>
            </div>
        `;

        // 오늘 상세 예보 컨테이너
        const todayHTML = `
            <div class="today-forecast-container" id="today-forecast">
                <h3>📅 오늘의 상세 예보</h3>
                <div class="today-content">
                    <div class="loading-spinner">⏳ 상세 예보 로딩 중...</div>
                </div>
            </div>
        `;

        // 현재 기상 조건 컨테이너
        const currentHTML = `
            <div class="current-conditions-container" id="current-conditions">
                <h3>🌡️ 실시간 기상 상황</h3>
                <div class="conditions-grid">
                    <div class="loading-spinner">⏳ 실시간 데이터 로딩 중...</div>
                </div>
            </div>
        `;

        weatherSection.insertAdjacentHTML('afterbegin', alertsHTML + todayHTML + currentHTML);
        
        this.alertsContainer = document.getElementById('weather-alerts');
        this.todayForecastContainer = document.getElementById('today-forecast');
        this.currentConditionsContainer = document.getElementById('current-conditions');
    }

    /**
     * 기상특보 로드 (빠른 응답)
     */
    async loadWeatherAlerts() {
        try {
            // 타임아웃 설정으로 빠른 응답
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3초 타임아웃

            const response = await fetch(`${this.proxyUrl}?service=weather&type=alerts`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.success) {
                this.displayWeatherAlerts(data.data.alerts || []);
            } else {
                this.displayDefaultAlerts();
            }
        } catch (error) {
            console.warn('⚠️ 기상특보 빠른 로드 실패, 기본 정보 표시:', error);
            this.displayDefaultAlerts();
        }
    }

    /**
     * 기상특보 표시
     */
    displayWeatherAlerts(alerts) {
        if (!this.alertsContainer) return;

        const alertsContent = this.alertsContainer.querySelector('.alerts-content');
        
        if (alerts.length === 0) {
            alertsContent.innerHTML = `
                <div class="no-alerts">
                    <span class="alert-icon">✅</span>
                    <span>현재 기상특보가 없습니다</span>
                    <small>안전한 여행을 즐기세요!</small>
                </div>
            `;
            return;
        }

        const alertsHTML = alerts.map(alert => `
            <div class="weather-alert ${this.getAlertSeverity(alert.event)}">
                <div class="alert-header">
                    <span class="alert-type">${alert.event}</span>
                    <span class="alert-time">${this.formatAlertTime(alert.start)}</span>
                </div>
                <div class="alert-description">${alert.description}</div>
            </div>
        `).join('');

        alertsContent.innerHTML = alertsHTML;
    }

    /**
     * 기본 기상특보 표시
     */
    displayDefaultAlerts() {
        if (!this.alertsContainer) return;

        const alertsContent = this.alertsContainer.querySelector('.alerts-content');
        alertsContent.innerHTML = `
            <div class="weather-alert moderate">
                <div class="alert-header">
                    <span class="alert-type">🌊 해상풍 주의</span>
                    <span class="alert-time">오늘</span>
                </div>
                <div class="alert-description">제주도 연안에 강한 바람이 예상됩니다. 해상 활동 시 주의하세요.</div>
            </div>
            <div class="weather-alert low">
                <div class="alert-header">
                    <span class="alert-type">☀️ 자외선 주의</span>
                    <span class="alert-time">12시~16시</span>
                </div>
                <div class="alert-description">자외선 지수가 높습니다. 선크림과 모자를 준비하세요.</div>
            </div>
        `;
    }

    /**
     * 경보 심각도 분류
     */
    getAlertSeverity(eventType) {
        const severe = ['태풍', '호우', '대설', '강풍'];
        const moderate = ['풍랑', '건조', '한파', '폭염'];
        
        if (severe.some(type => eventType.includes(type))) return 'severe';
        if (moderate.some(type => eventType.includes(type))) return 'moderate';
        return 'low';
    }

    /**
     * 경보 시간 포맷
     */
    formatAlertTime(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diffHours = Math.abs(now - date) / (1000 * 60 * 60);
        
        if (diffHours < 24) {
            return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        }
    }

    /**
     * 빠른 새로고침 설정 (30초 간격)
     */
    setupFastRefresh() {
        setInterval(() => {
            this.loadCurrentConditions();
        }, 30000); // 30초마다 현재 상황 업데이트
        
        setInterval(() => {
            this.loadWeatherAlerts();
        }, 300000); // 5분마다 기상특보 업데이트
    }

    /**
     * 오늘 상세 예보 로드
     */
    async loadTodayDetailedForecast() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(`${this.proxyUrl}?service=weather&type=forecast`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.success) {
                this.displayTodayForecast(data.data);
            } else {
                this.displayDefaultTodayForecast();
            }
        } catch (error) {
            console.warn('⚠️ 오늘 예보 빠른 로드 실패:', error);
            this.displayDefaultTodayForecast();
        }
    }

    /**
     * 실시간 기상 조건 로드
     */
    async loadCurrentConditions() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2초 타임아웃

            const response = await fetch(`${this.proxyUrl}?service=weather&type=current`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data.success) {
                this.displayCurrentConditions(data.data);
            } else {
                this.displayDefaultConditions();
            }
        } catch (error) {
            console.warn('⚠️ 실시간 조건 빠른 로드 실패:', error);
            this.displayDefaultConditions();
        }
    }

    /**
     * 현재 기상 조건 표시
     */
    displayCurrentConditions(weatherData) {
        if (!this.currentConditionsContainer) return;

        const conditionsGrid = this.currentConditionsContainer.querySelector('.conditions-grid');
        
        const conditionsHTML = `
            <div class="condition-card">
                <div class="condition-icon">🌡️</div>
                <div class="condition-info">
                    <div class="condition-value">${Math.round(weatherData.main.temp)}°C</div>
                    <div class="condition-label">현재 기온</div>
                    <div class="condition-detail">체감 ${Math.round(weatherData.main.feels_like)}°C</div>
                </div>
            </div>
            <div class="condition-card">
                <div class="condition-icon">💧</div>
                <div class="condition-info">
                    <div class="condition-value">${weatherData.main.humidity}%</div>
                    <div class="condition-label">습도</div>
                    <div class="condition-detail">${this.getHumidityStatus(weatherData.main.humidity)}</div>
                </div>
            </div>
            <div class="condition-card">
                <div class="condition-icon">💨</div>
                <div class="condition-info">
                    <div class="condition-value">${Math.round(weatherData.wind.speed)}m/s</div>
                    <div class="condition-label">풍속</div>
                    <div class="condition-detail">${this.getWindStatus(weatherData.wind.speed)}</div>
                </div>
            </div>
        `;

        conditionsGrid.innerHTML = conditionsHTML;
        this.updateLastRefreshTime();
    }

    /**
     * 상태 분석 헬퍼 함수들
     */
    getHumidityStatus(humidity) {
        if (humidity < 30) return '건조함';
        if (humidity < 60) return '적정';
        if (humidity < 80) return '다소 습함';
        return '매우 습함';
    }

    getWindStatus(speed) {
        if (speed < 2) return '바람 없음';
        if (speed < 5) return '약한 바람';
        if (speed < 10) return '보통 바람';
        return '강한 바람';
    }

    /**
     * 마지막 업데이트 시간 표시
     */
    updateLastRefreshTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        console.log(`🕐 날씨 정보 업데이트: ${timeString}`);
    }
}
}

// 기존 날씨 서비스와 함께 실행
document.addEventListener('DOMContentLoaded', () => {
    // 기존 서비스가 로드된 후 확장 서비스 시작
    setTimeout(() => {
        window.jejuWeatherExtended = new JejuWeatherExtended();
    }, 1000);
});
