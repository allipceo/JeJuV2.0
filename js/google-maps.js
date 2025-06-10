/**
 * 제주도 관광 홈페이지 - 구글맵 서비스
 * Google Maps API를 활용한 제주도 관광지 지도 서비스
 * 작성일: 2025.06.08
 * 버전: 1.0
 */

// 중복 실행 방지
if (typeof window.JejuGoogleMaps !== 'undefined') {
    console.log('구글맵 스크립트가 이미 로드되었습니다.');
} else {

class JejuGoogleMaps {
    constructor() {
        this.apiKey = 'AIzaSyDs5dJdgT4N9aL3xMEMIjf0nRTpQRxNxx4';
        this.map = null;
        this.markers = [];
        this.infoWindows = [];
        this.currentLocationMarker = null;
        
        // 제주도 중심 좌표
        this.jejuCenter = { lat: 33.4996213, lng: 126.5311884 };
        
        // 지도 기본 설정
        this.mapOptions = {
            center: this.jejuCenter,
            zoom: 10,
            mapTypeId: 'roadmap',
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            gestureHandling: 'auto'
        };
        
        this.isInitialized = false;
    }
    
    /**
     * 구글맵 초기화
     */
    async initialize() {
        try {
            console.log('🗺️ 구글맵 서비스 초기화 시작...');
            
            // 최대 10회까지 재시도
            let retryCount = 0;
            const maxRetries = 10;
            
            const tryInitialize = () => {
                // 구글맵 API 로드 확인
                if (typeof google === 'undefined' || !google.maps) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.warn(`⚠️ 구글맵 API 대기 중... (${retryCount}/${maxRetries})`);
                        setTimeout(tryInitialize, 1000);
                        return;
                    } else {
                        throw new Error('구글맵 API 로드 실패 - 최대 재시도 횟수 초과');
                    }
                }
                
                // DOM이 준비될 때까지 기다림
                const mapContainer = document.getElementById('google-map');
                if (!mapContainer) {
                    if (retryCount < maxRetries) {
                        retryCount++;
                        console.warn(`⚠️ 지도 컨테이너 대기 중... (${retryCount}/${maxRetries})`);
                        setTimeout(tryInitialize, 500);
                        return;
                    } else {
                        throw new Error('지도 컨테이너를 찾을 수 없음 - 최대 재시도 횟수 초과');
                    }
                }
                
                // 성공적으로 초기화 진행
                this.createMap(mapContainer);
            };
            
            tryInitialize();
            
        } catch (error) {
            console.error('❌ 구글맵 초기화 실패:', error);
            this.showFallbackMode(error.message);
        }
    }
    
    /**
     * 지도 생성
     */
    createMap(mapContainer) {
        try {
            // 로딩 표시 제거
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // 구글맵 생성
            this.map = new google.maps.Map(mapContainer, this.mapOptions);
            
            // 지도 서비스 초기화
            this.geocoder = new google.maps.Geocoder();
            this.placesService = new google.maps.places.PlacesService(this.map);
            
            // 이벤트 설정
            this.setupMapEvents();
            this.setupControlEvents();
            
            console.log('✅ 구글맵 초기화 완료');
            this.isInitialized = true;
            
            // 관광지 데이터 로드
            if (typeof jejuTouristSpots !== 'undefined') {
                this.loadTouristSpots();
            }
            
        } catch (error) {
            console.error('❌ 지도 생성 실패:', error);
            throw error;
        }
    }
    
    /**
     * 지도 이벤트 설정
     */
    setupMapEvents() {
        // 지도 클릭 이벤트
        this.map.addListener('click', (event) => {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            console.log('지도 클릭:', lat, lng);
        });
        
        // 줌 변경 이벤트
        this.map.addListener('zoom_changed', () => {
            const zoom = this.map.getZoom();
            console.log('줌 레벨 변경:', zoom);
        });
        
        // 중심점 변경 이벤트
        this.map.addListener('center_changed', () => {
            const center = this.map.getCenter();
            console.log('중심점 변경:', center.lat(), center.lng());
        });
    }
    
    /**
     * 컨트롤 이벤트 설정
     */
    setupControlEvents() {
        // 검색 버튼
        const searchButton = document.getElementById('search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const query = document.getElementById('address-search').value;
                if (query.trim()) {
                    this.searchLocation(query);
                }
            });
        }
        
        // 검색 입력 (엔터키)
        const searchInput = document.getElementById('address-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value;
                    if (query.trim()) {
                        this.searchLocation(query);
                    }
                }
            });
        }
        
        // 현재 위치 버튼
        const currentLocationBtn = document.getElementById('current-location-button');
        if (currentLocationBtn) {
            currentLocationBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }
        
        // 지도 리셋 버튼
        const resetBtn = document.getElementById('reset-map-button');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetMap();
            });
        }
        
        // 지도 타입 변경 버튼들
        const layerButtons = document.querySelectorAll('.layer-button');
        layerButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const layerType = e.target.getAttribute('data-layer');
                this.changeMapType(layerType);
                
                // 버튼 활성화 상태 변경
                layerButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    /**
     * 위치 검색
     */
    searchLocation(query) {
        console.log('위치 검색:', query);
        
        const request = {
            query: query + ' 제주도',
            fields: ['name', 'geometry', 'formatted_address']
        };
        
        this.placesService.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                const place = results[0];
                const location = place.geometry.location;
                
                // 지도 이동
                this.map.setCenter(location);
                this.map.setZoom(15);
                
                // 검색 결과 마커 표시
                this.showSearchResultMarker(location, place.name);
                
                console.log('✅ 검색 완료:', place.name);
            } else {
                console.warn('❌ 검색 결과 없음:', query);
                alert('검색 결과를 찾을 수 없습니다.');
            }
        });
    }
    
    /**
     * 검색 결과 마커 표시
     */
    showSearchResultMarker(position, title) {
        // 기존 검색 마커 제거
        if (this.searchMarker) {
            this.searchMarker.setMap(null);
        }
        
        // 새 마커 생성
        this.searchMarker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: title,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="15" cy="15" r="12" fill="#ff4757" stroke="white" stroke-width="3"/>
                        <text x="15" y="20" text-anchor="middle" fill="white" font-size="16">📍</text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(30, 30)
            }
        });
        
        // 정보창 생성
        const infoWindow = new google.maps.InfoWindow({
            content: `<div style="padding: 10px;"><strong>${title}</strong></div>`
        });
        
        this.searchMarker.addListener('click', () => {
            infoWindow.open(this.map, this.searchMarker);
        });
    }
    
    /**
     * 현재 위치 가져오기
     */
    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const currentPos = { lat, lng };
                    
                    this.map.setCenter(currentPos);
                    this.map.setZoom(15);
                    
                    // 현재 위치 마커 표시
                    this.showCurrentLocationMarker(currentPos);
                    
                    console.log('✅ 현재 위치 확인:', lat, lng);
                },
                (error) => {
                    console.error('❌ 위치 정보 획득 실패:', error);
                    alert('위치 정보를 가져올 수 없습니다.');
                }
            );
        } else {
            alert('이 브라우저에서는 위치 서비스를 지원하지 않습니다.');
        }
    }
    
    /**
     * 현재 위치 마커 표시
     */
    showCurrentLocationMarker(position) {
        // 기존 현재 위치 마커 제거
        if (this.currentLocationMarker) {
            this.currentLocationMarker.setMap(null);
        }
        
        // 새 마커 생성
        this.currentLocationMarker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: '현재 위치',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="8" fill="#2196F3" stroke="white" stroke-width="3"/>
                        <circle cx="12" cy="12" r="3" fill="white"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(24, 24)
            }
        });
    }
    
    /**
     * 지도 타입 변경
     */
    changeMapType(layerType) {
        const mapTypeMap = {
            'base': 'roadmap',
            'satellite': 'satellite',
            'hybrid': 'hybrid'
        };
        
        const mapTypeId = mapTypeMap[layerType] || 'roadmap';
        this.map.setMapTypeId(mapTypeId);
        console.log('지도 타입 변경:', mapTypeId);
    }
    
    /**
     * 지도 리셋
     */
    resetMap() {
        if (this.map) {
            this.map.setCenter(this.jejuCenter);
            this.map.setZoom(10);
            this.map.setMapTypeId('roadmap');
            console.log('🔄 지도 리셋 완료');
        }
    }
    
    /**
     * 관광지 데이터 로드
     */
    loadTouristSpots() {
        if (!jejuTouristSpots || !Array.isArray(jejuTouristSpots)) {
            console.warn('관광지 데이터가 없습니다.');
            return;
        }
        
        console.log(`📍 ${jejuTouristSpots.length}개 관광지 마커 생성 중...`);
        
        jejuTouristSpots.forEach((spot, index) => {
            if (spot.coordinates && spot.coordinates.lat && spot.coordinates.lng) {
                this.createTouristSpotMarker(spot, index);
            }
        });
        
        console.log(`✅ ${this.markers.length}개 관광지 마커 생성 완료`);
        
        // 카테고리 필터 설정
        this.setupCategoryFilters();
    }
    
    /**
     * 관광지 마커 생성
     */
    createTouristSpotMarker(spot, index) {
        const position = {
            lat: parseFloat(spot.coordinates.lat),
            lng: parseFloat(spot.coordinates.lng)
        };
        
        // 카테고리별 마커 색상
        const categoryColors = {
            'nature': '#00b894',      // 자연명소 - 초록
            'restaurant': '#fd79a8',  // 맛집 - 핑크
            'hotel': '#fdcb6e',       // 숙박 - 노랑
            'culture': '#6c5ce7',     // 문화유산 - 보라
            'beach': '#00cec9',       // 해변 - 청록
            'cave': '#a29bfe'         // 동굴 - 연보라
        };
        
        const color = categoryColors[spot.category] || '#74b9ff';
        
        // 마커 생성
        const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: spot.name,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="3"/>
                        <text x="16" y="21" text-anchor="middle" fill="white" font-size="14" font-weight="bold">
                            ${this.getCategoryIcon(spot.category)}
                        </text>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32)
            }
        });
        
        // 마커에 카테고리 정보 저장
        marker.category = spot.category;
        marker.spotData = spot;
        
        // 정보창 생성
        const infoWindow = new google.maps.InfoWindow({
            content: this.createInfoWindowContent(spot)
        });
        
        // 마커 클릭 이벤트
        marker.addListener('click', () => {
            // 다른 정보창 닫기
            this.infoWindows.forEach(iw => iw.close());
            
            // 현재 정보창 열기
            infoWindow.open(this.map, marker);
            
            // 지도 중심 이동
            this.map.panTo(position);
            
            console.log('관광지 선택:', spot.name);
        });
        
        // 마커와 정보창 저장
        this.markers.push(marker);
        this.infoWindows.push(infoWindow);
    }
    
    /**
     * 카테고리별 아이콘 반환
     */
    getCategoryIcon(category) {
        const icons = {
            'nature': '🌲',
            'restaurant': '🍽️',
            'hotel': '🏨',
            'culture': '🏛️',
            'beach': '🏖️',
            'cave': '🕳️'
        };
        return icons[category] || '📍';
    }
    
    /**
     * 정보창 내용 생성
     */
    createInfoWindowContent(spot) {
        const categoryNames = {
            'nature': '자연명소',
            'restaurant': '맛집',
            'hotel': '숙박',
            'culture': '문화유산',
            'beach': '해변',
            'cave': '동굴'
        };
        
        return `
            <div class="info-window-content" style="max-width: 280px; padding: 15px;">
                <h3 style="margin: 0 0 8px 0; color: #2d3436; font-size: 16px;">${spot.name}</h3>
                <div style="margin-bottom: 8px;">
                    <span class="category-badge" style="
                        background: linear-gradient(135deg, #74b9ff, #0984e3);
                        color: white;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        font-weight: 500;
                    ">${categoryNames[spot.category] || spot.category}</span>
                </div>
                <p style="margin: 8px 0; color: #636e72; font-size: 13px; line-height: 1.4;">
                    ${spot.description || '제주도의 아름다운 관광지입니다.'}
                </p>
                ${spot.address ? `<p style="margin: 4px 0; color: #b2bec3; font-size: 12px;">📍 ${spot.address}</p>` : ''}
                ${spot.phone ? `<p style="margin: 4px 0; color: #b2bec3; font-size: 12px;">📞 ${spot.phone}</p>` : ''}
                ${spot.hours ? `<p style="margin: 4px 0; color: #b2bec3; font-size: 12px;">🕒 ${spot.hours}</p>` : ''}
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button onclick="window.open('https://map.google.com/search/${encodeURIComponent(spot.name + ' 제주도')}', '_blank')" 
                            style="flex: 1; padding: 8px 12px; background: #00b894; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">
                        길찾기
                    </button>
                    <button onclick="navigator.share ? navigator.share({title: '${spot.name}', text: '${spot.description || ''}', url: location.href}) : alert('공유 기능을 지원하지 않는 브라우저입니다.')"
                            style="flex: 1; padding: 8px 12px; background: #fd79a8; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;">
                        공유
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 카테고리 필터 설정
     */
    setupCategoryFilters() {
        const categoryButtons = document.querySelectorAll('.category-filter');
        
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.filterMarkersByCategory(category);
                
                // 버튼 활성화 상태 변경
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                console.log('카테고리 필터:', category);
            });
        });
    }
    
    /**
     * 카테고리별 마커 필터링
     */
    filterMarkersByCategory(category) {
        this.markers.forEach(marker => {
            if (category === 'all' || marker.category === category) {
                marker.setVisible(true);
            } else {
                marker.setVisible(false);
            }
        });
        
        // 정보창 닫기
        this.infoWindows.forEach(iw => iw.close());
        
        // 필터링된 마커 개수 표시
        const visibleCount = this.markers.filter(m => m.getVisible()).length;
        console.log(`${category === 'all' ? '전체' : category} 카테고리: ${visibleCount}개 표시`);
    }
}

// 전역 구글맵 서비스 인스턴스
let jejuGoogleMaps;

// 구글맵 콜백 함수 (전역)
window.initGoogleMap = function() {
    console.log('🎯 Google Maps API 콜백 호출됨');
    jejuGoogleMaps = new JejuGoogleMaps();
    jejuGoogleMaps.initialize();
};

// 외부에서 사용할 수 있는 함수들
window.JejuGoogleMaps = {
    getInstance: () => jejuGoogleMaps,
    resetMap: () => jejuGoogleMaps?.resetMap(),
    getCurrentLocation: () => jejuGoogleMaps?.getCurrentLocation()
};

} // 중복 실행 방지 종료
