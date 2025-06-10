/**
 * 제주도 관광 홈페이지 - 날씨 API 서비스 V2.0
 * OpenWeatherMap API를 활용한 실시간 날씨 정보 제공
 * 작성일: 2025.06.06
 * 버전: 2.0
 */

// 환경 설정
const CONFIG = {
    API_KEY: 'f778d7297860bfbedb1aca5db5dae290', // API 키 직접 설정
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    CACHE_TIMEOUT: 10 * 60 * 1000, // 10분
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    RATE_LIMIT: 60, // 분당 요청 수
    CITIES: {
            'jeju': { id: 1846266, name: '제주시', lat: 33.4996213, lon: 126.5311884 },
            'seogwipo': { id: 1835848, name: '서귀포시', lat: 33.2541501, lon: 126.5600042 },
            'hallasan': { id: null, name: '한라산', lat: 33.3616667, lon: 126.5291667 },
            'seongsan': { id: null, name: '성산일출봉', lat: 33.4588889, lon: 126.9427778 }
    }
};

// 커스텀 에러 클래스
class WeatherError extends Error {
    constructor(message, type, details = {}) {
        super(message);
        this.name = 'WeatherError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date();
    }
}

// 로깅 시스템
class Logger {
    static log(level, message, data = {}) {
        const logEntry = {
            timestamp: new Date(),
            level,
            message,
            data
        };
        
        console.log(`[${logEntry.timestamp.toISOString()}] ${level}: ${message}`, data);
        
        // 프로덕션에서는 서버로 전송
        if (process.env.NODE_ENV === 'production') {
            // TODO: 서버 로깅 구현
        }
    }

    static error(message, error) {
        this.log('ERROR', message, error);
    }

    static info(message, data) {
        this.log('INFO', message, data);
    }

    static warn(message, data) {
        this.log('WARN', message, data);
    }
}

// 캐시 관리자
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    set(key, value, ttl = CONFIG.CACHE_TIMEOUT) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

// Rate Limiter
class RateLimiter {
    constructor(limit) {
        this.limit = limit;
        this.tokens = limit;
        this.lastRefill = Date.now();
    }

    async waitForToken() {
        this.refillTokens();
        
        if (this.tokens > 0) {
            this.tokens--;
            return;
        }

        const waitTime = 60000 / this.limit;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitForToken();
    }

    refillTokens() {
        const now = Date.now();
        const timePassed = now - this.lastRefill;
        const newTokens = Math.floor(timePassed / (60000 / this.limit));
        
        if (newTokens > 0) {
            this.tokens = Math.min(this.limit, this.tokens + newTokens);
            this.lastRefill = now;
        }
    }
}

// API 클라이언트
class WeatherAPIClient {
    constructor() {
        this.controller = new AbortController();
        this.rateLimiter = new RateLimiter(CONFIG.RATE_LIMIT);
    }

    async fetchWithRetry(url, options = {}, retries = CONFIG.RETRY_ATTEMPTS) {
        try {
            await this.rateLimiter.waitForToken();
            
            const response = await fetch(url, {
                ...options,
                signal: this.controller.signal
            });

            if (!response.ok) {
                throw new WeatherError(
                    `API 요청 실패: ${response.status}`,
                    'API_ERROR',
                    { status: response.status }
                );
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new WeatherError('요청이 취소되었습니다.', 'ABORTED');
            }

            if (retries > 0) {
                await new Promise(resolve => 
                    setTimeout(resolve, CONFIG.RETRY_DELAY * (CONFIG.RETRY_ATTEMPTS - retries + 1))
                );
                return this.fetchWithRetry(url, options, retries - 1);
            }

            throw error;
        }
    }

    abort() {
        this.controller.abort();
        this.controller = new AbortController();
    }
}

// 날씨 서비스 (싱글톤)
class JejuWeatherService {
    static instance = null;

    static getInstance() {
        if (!JejuWeatherService.instance) {
            JejuWeatherService.instance = new JejuWeatherService();
        }
        return JejuWeatherService.instance;
    }

    constructor() {
        if (JejuWeatherService.instance) {
            return JejuWeatherService.instance;
        }

        this.apiClient = new WeatherAPIClient();
        this.cacheManager = new CacheManager();
        this.observers = new Set();
        
        this.initWeatherService();
        JejuWeatherService.instance = this;
    }

    // 옵저버 패턴 구현
    subscribe(observer) {
        this.observers.add(observer);
        return () => this.observers.delete(observer);
    }

    notify(data) {
        this.observers.forEach(observer => observer(data));
    }

    async initWeatherService() {
        Logger.info('날씨 서비스 초기화 중...');
        
        try {
            // 현재 시간 표시
            this.updateCurrentTime();
            setInterval(() => this.updateCurrentTime(), 1000);

            await this.loadAllWeatherData();
        this.setupAutoRefresh();
        this.initWeatherEvents();
            
            // 오프라인 모드 감지
            window.addEventListener('online', () => this.handleOnline());
            window.addEventListener('offline', () => this.handleOffline());
            
            Logger.info('날씨 서비스 초기화 완료');
        } catch (error) {
            Logger.error('날씨 서비스 초기화 실패', error);
            this.showErrorState();
        }
    }

    updateCurrentTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        }
    }

    async loadAllWeatherData() {
        const weatherContainer = document.getElementById('weather-container');
        if (!weatherContainer) return;

        this.showLoadingState();

        try {
            const weatherPromises = Object.keys(CONFIG.CITIES).map(cityKey => 
                this.getCurrentWeather(cityKey)
            );

            const weatherResults = await Promise.all(weatherPromises);
            
            this.renderWeatherWidgets(weatherResults);
            await this.loadForecastData();
            this.updateTourismRecommendations(weatherResults);

            this.notify({ type: 'WEATHER_UPDATED', data: weatherResults });
        } catch (error) {
            Logger.error('날씨 데이터 로드 실패', error);
            this.showErrorState();
        }
    }

    async getCurrentWeather(cityKey) {
        const cacheKey = `current_${cityKey}`;
        const cached = this.cacheManager.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const city = CONFIG.CITIES[cityKey];
            const url = `${CONFIG.BASE_URL}/weather?lat=${city.lat}&lon=${city.lon}&appid=${CONFIG.API_KEY}&units=metric&lang=kr`;
            
            const data = await this.apiClient.fetchWithRetry(url);
            const processedData = this.processWeatherData(data, cityKey);
            
            this.cacheManager.set(cacheKey, processedData);
            return processedData;

        } catch (error) {
            Logger.error(`${cityKey} 날씨 정보 가져오기 실패`, error);
            return this.getDefaultWeatherData(cityKey);
        }
    }

    async getForecastWeather(cityKey = 'jeju') {
        const cacheKey = `forecast_${cityKey}`;
        const cached = this.cacheManager.get(cacheKey);
        
        if (cached) {
            return cached;
        }

        try {
            const city = CONFIG.CITIES[cityKey];
            const url = `${CONFIG.BASE_URL}/forecast?lat=${city.lat}&lon=${city.lon}&appid=${CONFIG.API_KEY}&units=metric&lang=kr`;
            
            const data = await this.apiClient.fetchWithRetry(url);
            const processedData = this.processForecastData(data);
            
            this.cacheManager.set(cacheKey, processedData);
            return processedData;

        } catch (error) {
            Logger.error(`${cityKey} 예보 정보 가져오기 실패`, error);
            return this.getDefaultForecastData();
        }
    }

    processWeatherData(data, cityKey) {
        const city = CONFIG.CITIES[cityKey];
        
        return {
            cityKey: cityKey,
            cityName: city.name,
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            windSpeed: data.wind.speed,
            windDirection: data.wind.deg,
            visibility: data.visibility / 1000,
            weather: {
                main: data.weather[0].main,
                description: data.weather[0].description,
                icon: data.weather[0].icon
            },
            sunrise: new Date(data.sys.sunrise * 1000),
            sunset: new Date(data.sys.sunset * 1000),
            timestamp: Date.now(),
            recommendations: this.getWeatherRecommendations(data, cityKey)
        };
    }

    processForecastData(data) {
        const dailyForecasts = {};
        
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toISOString().split('T')[0];
            
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    date: date,
                    temperatures: [],
                    weather: [],
                    humidity: [],
                    wind: []
                };
            }
            
            dailyForecasts[dateKey].temperatures.push(item.main.temp);
            dailyForecasts[dateKey].weather.push({
                main: item.weather[0].main,
                description: item.weather[0].description,
                icon: item.weather[0].icon
            });
            dailyForecasts[dateKey].humidity.push(item.main.humidity);
            dailyForecasts[dateKey].wind.push(item.wind.speed);
        });

        return Object.values(dailyForecasts).slice(0, 5).map(day => ({
            date: day.date,
            maxTemp: Math.round(Math.max(...day.temperatures)),
            minTemp: Math.round(Math.min(...day.temperatures)),
            avgHumidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length),
            avgWind: Math.round(day.wind.reduce((a, b) => a + b) / day.wind.length * 10) / 10,
            weather: this.getMostFrequentWeather(day.weather)
        }));
    }

    getWeatherRecommendations(weatherData, cityKey) {
        const temp = weatherData.main.temp;
        const weather = weatherData.weather[0].main.toLowerCase();
        const windSpeed = weatherData.wind.speed;
        
        let recommendations = [];

        if (temp >= 25) {
            recommendations.push({
                type: 'beach',
                title: '해변 관광지',
                places: ['협재해수욕장', '함덕해수욕장', '표선해비치'],
                reason: '따뜻한 날씨로 해변 활동이 좋습니다'
            });
        } else if (temp >= 15) {
            recommendations.push({
                type: 'hiking',
                title: '등산/트레킹',
                places: ['한라산 국립공원', '올레길', '사려니숲길'],
                reason: '쾌적한 날씨로 야외활동이 적합합니다'
            });
        } else {
            recommendations.push({
                type: 'indoor',
                title: '실내 관광지',
                places: ['제주민속촌', '테디베어뮤지엄', '아쿠아플라넷'],
                reason: '실내에서 따뜻하게 관광하기 좋습니다'
            });
        }

        if (weather.includes('clear')) {
            recommendations.push({
                type: 'outdoor',
                title: '야외 활동',
                places: ['성산일출봉', '우도', '만장굴'],
                reason: '맑은 날씨로 경치 감상이 최적입니다'
            });
        }

        return recommendations;
    }

    renderWeatherWidgets(weatherData) {
        const container = document.getElementById('weather-container');
        if (!container) return;

        container.innerHTML = weatherData.map(data => this.createWeatherWidget(data)).join('');
        this.applyWeatherAnimations();
    }

    createWeatherWidget(data) {
        return `
            <div class="weather-widget" data-city="${data.cityKey}">
                <div class="weather-header">
                    <h3>${data.cityName}</h3>
                    <span class="temperature">${data.temperature}°C</span>
                </div>
                <div class="weather-body">
                    <img src="https://openweathermap.org/img/wn/${data.weather.icon}@2x.png" 
                         alt="${data.weather.description}"
                         class="weather-icon">
                    <p class="weather-description">${data.weather.description}</p>
                <div class="weather-details">
                        <p>체감온도: ${data.feelsLike}°C</p>
                        <p>습도: ${data.humidity}%</p>
                        <p>풍속: ${data.windSpeed}m/s</p>
                    </div>
                </div>
                    <div class="weather-recommendations">
                        <h4>추천 관광지</h4>
                    <ul>
                        ${data.recommendations.map(rec => `
                            <li>
                                <strong>${rec.title}</strong>
                                <p>${rec.reason}</p>
                                <ul>
                                    ${rec.places.map(place => `<li>${place}</li>`).join('')}
                                </ul>
                            </li>
                        `).join('')}
                    </ul>
                    </div>
            </div>
        `;
    }

    async loadForecastData() {
        try {
            const forecastData = await this.getForecastWeather();
            this.renderForecastWidget(forecastData);
        } catch (error) {
            Logger.error('예보 데이터 로드 실패', error);
        }
    }

    renderForecastWidget(forecastData) {
        const container = document.getElementById('forecast-container');
        if (!container) return;

        container.innerHTML = `
            <h3>5일 예보</h3>
            <div class="forecast-grid">
                    ${forecastData.map(day => this.createForecastItem(day)).join('')}
            </div>
        `;
    }

    createForecastItem(dayData) {
        return `
            <div class="forecast-item">
                <div class="forecast-date">
                    ${dayData.date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                </div>
                <img src="https://openweathermap.org/img/wn/${dayData.weather.icon}@2x.png" 
                     alt="${dayData.weather.description}"
                     class="forecast-icon">
                <div class="forecast-temp">
                    <span class="max">${dayData.maxTemp}°</span>
                    <span class="min">${dayData.minTemp}°</span>
                </div>
                <div class="forecast-details">
                    <p>습도: ${dayData.avgHumidity}%</p>
                    <p>풍속: ${dayData.avgWind}m/s</p>
                </div>
            </div>
        `;
    }

    getMostFrequentWeather(weatherArray) {
        const counts = weatherArray.reduce((acc, curr) => {
            acc[curr.main] = (acc[curr.main] || 0) + 1;
            return acc;
        }, {});

        const mostFrequent = Object.entries(counts)
            .sort((a, b) => b[1] - a[1])[0][0];

        return weatherArray.find(w => w.main === mostFrequent);
    }

    setupAutoRefresh() {
        setInterval(() => {
            this.loadAllWeatherData();
        }, CONFIG.CACHE_TIMEOUT);
    }

    initWeatherEvents() {
        // 도시 선택 이벤트
        const citySelector = document.getElementById('city-selector');
        if (citySelector) {
            citySelector.addEventListener('change', (e) => {
                const selectedCity = e.target.value;
                if (selectedCity === 'all') {
                this.loadAllWeatherData();
                } else {
                    this.loadSpecificCityWeather(selectedCity);
            }
        });
    }

        // 새로고침 버튼 이벤트
        const refreshButton = document.getElementById('weather-refresh');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.loadAllWeatherData();
            });
        }

        // 날씨 위젯 클릭 이벤트
        document.addEventListener('click', (e) => {
            const widget = e.target.closest('.weather-widget');
            if (widget) {
                const cityKey = widget.dataset.city;
                this.loadSpecificCityWeather(cityKey);
            }
        });
    }

    showLoadingState() {
        const container = document.getElementById('weather-container');
        if (!container) return;

            container.innerHTML = `
            <div class="weather-skeleton">
                <div class="skeleton-header"></div>
                <div class="skeleton-content">
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                    <div class="skeleton-item"></div>
                </div>
                </div>
            `;
    }

    showErrorState() {
        const container = document.getElementById('weather-container');
        if (!container) return;

            container.innerHTML = `
            <div class="weather-error" role="alert">
                    <i class="fas fa-exclamation-triangle"></i>
                <p>날씨 정보를 불러오는데 실패했습니다.</p>
                <button onclick="JejuWeatherService.getInstance().loadAllWeatherData()">
                    다시 시도
                </button>
                </div>
            `;
    }

    getDefaultWeatherData(cityKey) {
        const city = CONFIG.CITIES[cityKey];
        return {
            cityKey: cityKey,
            cityName: city.name,
            temperature: 20,
            feelsLike: 20,
            humidity: 60,
            pressure: 1013,
            windSpeed: 3,
            windDirection: 0,
            visibility: 10,
            weather: {
                main: 'Clear',
                description: '맑음',
                icon: '01d'
            },
            sunrise: new Date(),
            sunset: new Date(),
            timestamp: Date.now(),
            recommendations: []
        };
    }

    getDefaultForecastData() {
        return Array(5).fill(null).map((_, index) => ({
            date: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
            maxTemp: 25,
                minTemp: 15,
                avgHumidity: 60,
            avgWind: 3,
                weather: {
                    main: 'Clear',
                    description: '맑음',
                    icon: '01d'
                }
        }));
    }

    applyWeatherAnimations() {
        const widgets = document.querySelectorAll('.weather-widget');
        widgets.forEach(widget => {
            widget.style.opacity = '0';
            widget.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                widget.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                widget.style.opacity = '1';
                widget.style.transform = 'translateY(0)';
            });
        });
    }

    async loadSpecificCityWeather(cityKey) {
        try {
            const weatherData = await this.getCurrentWeather(cityKey);
            this.updateSpecificWeatherWidget(weatherData);
        } catch (error) {
            Logger.error(`${cityKey} 날씨 정보 업데이트 실패`, error);
        }
    }

    updateSpecificWeatherWidget(weatherData) {
        const widget = document.querySelector(`.weather-widget[data-city="${weatherData.cityKey}"]`);
        if (!widget) return;

        const newWidget = this.createWeatherWidget(weatherData);
        widget.outerHTML = newWidget;
    }

    updateTourismRecommendations(weatherData) {
        const recommendations = this.getOverallRecommendations(weatherData);
        const container = document.getElementById('tourism-recommendations');
        if (!container) return;

        container.innerHTML = `
                <h3>오늘의 추천 관광지</h3>
                <div class="recommendations-grid">
                ${recommendations.map(rec => `
                        <div class="recommendation-card">
                            <h4>${rec.title}</h4>
                            <p>${rec.reason}</p>
                        <ul>
                            ${rec.places.map(place => `<li>${place}</li>`).join('')}
                        </ul>
                        </div>
                    `).join('')}
            </div>
        `;
    }

    getOverallRecommendations(weatherData) {
        const allRecommendations = weatherData.flatMap(data => data.recommendations);
        return this.getUniqueRecommendations(allRecommendations);
    }

    getUniqueRecommendations(recommendations) {
        const uniqueTypes = new Set();
        return recommendations.filter(rec => {
            if (uniqueTypes.has(rec.type)) return false;
            uniqueTypes.add(rec.type);
            return true;
        });
    }

    handleOnline() {
        Logger.info('온라인 상태로 전환');
        this.loadAllWeatherData();
    }

    handleOffline() {
        Logger.warn('오프라인 상태로 전환');
        this.showOfflineState();
    }

    showOfflineState() {
        const container = document.getElementById('weather-container');
        if (!container) return;

        container.innerHTML = `
            <div class="weather-offline" role="alert">
                <i class="fas fa-wifi-slash"></i>
                <p>오프라인 상태입니다. 마지막으로 저장된 날씨 정보를 표시합니다.</p>
            </div>
        `;
    }
}

// 서비스 초기화
document.addEventListener('DOMContentLoaded', () => {
    const weatherService = JejuWeatherService.getInstance();
});
