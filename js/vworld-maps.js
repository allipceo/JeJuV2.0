/**
 * 제주도 관광 홈페이지 - 브이월드 디지털 트윈 지도 서비스
 * V-World Digital Twin Maps Integration for Jeju Tourism
 * 
 * 기능:
 * - 브이월드 2D/3D 지도 연동
 * - 제주도 관광지 위치 표시
 * - 실시간 지오코딩 검색
 * - 거리 계산 및 길찾기
 * 
 * API: 국토교통부 V-World API
 * 키: 2B038C2D-DB04-3C0E-935C-B3A873465608
 */

// 중복 실행 방지
if (typeof window.JejuVWorldMaps !== 'undefined') {
    console.log('브이월드 지도 스크립트가 이미 로드되었습니다.');
} else {

class JejuVWorldMaps {
    constructor() {
        this.apiKey = '2B038C2D-DB04-3C0E-935C-B3A873465608';
        this.map = null;
        this.markers = [];
        this.currentPosition = null;
        this.touristSpots = [];
        
        // 제주도 중심 좌표
        this.jejuCenter = {
            lat: 33.4996213,
            lng: 126.5311884
        };
        
        // 브이월드 지도 레이어 설정
        this.mapLayers = {
            base: 'Base',           // 기본 지도
            satellite: 'Satellite', // 위성 지도
            hybrid: 'Hybrid'        // 하이브리드 지도
        };
        
        this.currentLayer = 'base';
        this.isLoading = false;
    }
    
    /**
     * 지도 초기화
     */
    async initialize() {
        try {
            this.showLoading('지도를 초기화하는 중...');
            
            // 브이월드 SDK 로드 확인
            if (typeof vworld === 'undefined') {
                console.warn('브이월드 SDK 로드 실패, 폴백 모드로 전환');
                this.initializeFallbackMode();
                return;
            }
            
            // 지도 컨테이너 확인
            const mapContainer = document.getElementById('vworld-map');
            if (!mapContainer) {
                throw new Error('지도 컨테이너를 찾을 수 없습니다.');
            }
            
            // 브이월드 지도 초기화
            this.map = new vworld.Map(mapContainer, {
                center: [this.jejuCenter.lng, this.jejuCenter.lat],
                zoom: 10,
                minZoom: 8,
                maxZoom: 18,
                basemap: this.getBasemapUrl('base')
            });
            
            // 지도 이벤트 설정
            this.setupMapEvents();
            
            // 관광지 데이터 로드
            await this.loadTouristSpots();
            
            // 관광지 마커 표시
            this.displayTouristMarkers();
            
            // 현재 위치 확인 시도
            await this.getCurrentLocation();
            
            this.hideLoading();
            this.showSuccessMessage('지도가 성공적으로 로드되었습니다!');
            
        } catch (error) {
            this.hideLoading();
            this.showErrorMessage('지도 초기화 실패: ' + error.message);
            console.error('VWorld Maps 초기화 오류:', error);
        }
    }
    
    /**
     * 브이월드 베이스맵 URL 생성
     */
    getBasemapUrl(layerType) {
        const baseUrl = 'https://api.vworld.kr/req/wmts/1.0.0';
        const layer = this.mapLayers[layerType] || this.mapLayers.base;
        
        return `${baseUrl}/${this.apiKey}/${layer}/{z}/{y}/{x}.png`;
    }
    
    /**
     * 지도 이벤트 설정
     */
    setupMapEvents() {
        // 지도 클릭 이벤트
        this.map.on('click', (e) => {
            const coords = e.lngLat;
            this.handleMapClick(coords.lng, coords.lat);
        });
        
        // 지도 로드 완료 이벤트
        this.map.on('load', () => {
            console.log('브이월드 지도 로드 완료');
        });
        
        // 줌 변경 이벤트
        this.map.on('zoom', () => {
            this.updateMarkerVisibility();
        });
    }
    
    /**
     * 관광지 데이터 로드
     */
    async loadTouristSpots() {
        try {
            // locationData.js에서 관광지 데이터 가져오기
            if (typeof touristSpotsData !== 'undefined') {
                this.touristSpots = touristSpotsData;
            } else {
                // 기본 제주도 관광지 데이터 (임시)
                this.touristSpots = await this.getDefaultTouristSpots();
            }
            
            console.log(`${this.touristSpots.length}개 관광지 데이터 로드 완료`);
            
        } catch (error) {
            console.error('관광지 데이터 로드 실패:', error);
            this.touristSpots = await this.getDefaultTouristSpots();
        }
    }
    
    /**
     * 기본 관광지 데이터 반환
     */
    async getDefaultTouristSpots() {
        return [
            {
                id: 1,
                name: '한라산',
                category: 'nature',
                lat: 33.3617,
                lng: 126.5292,
                description: '제주도의 상징, 대한민국 최고봉',
                address: '제주시 1100로 2070-61'
            },
            {
                id: 2,
                name: '성산일출봉',
                category: 'nature',
                lat: 33.4584,
                lng: 126.9424,
                description: '유네스코 자연유산, 일출 명소',
                address: '서귀포시 성산읍 성산리'
            },
            {
                id: 3,
                name: '만장굴',
                category: 'cave',
                lat: 33.5267,
                lng: 126.7712,
                description: '세계 최장의 용암동굴',
                address: '제주시 구좌읍 김녕리'
            }
        ];
    }
    
    /**
     * 관광지 마커 표시
     */
    displayTouristMarkers() {
        this.clearMarkers();
        
        this.touristSpots.forEach(spot => {
            const marker = this.createMarker(spot);
            this.markers.push(marker);
        });
        
        console.log(`${this.markers.length}개 마커 표시 완료`);
    }
    
    /**
     * 마커 생성
     */
    createMarker(spot) {
        // 카테고리별 마커 아이콘 설정
        const iconUrl = this.getMarkerIcon(spot.category);
        
        // 마커 생성
        const marker = new vworld.Marker([spot.lng, spot.lat], {
            icon: iconUrl,
            title: spot.name
        });
        
        // 팝업 내용 생성
        const popupContent = `
            <div class="marker-popup">
                <h3>${spot.name}</h3>
                <p class="category">${this.getCategoryName(spot.category)}</p>
                <p class="description">${spot.description}</p>
                <p class="address">${spot.address}</p>
                <div class="popup-actions">
                    <button onclick="jejuMaps.showDirections(${spot.lat}, ${spot.lng})">길찾기</button>
                    <button onclick="jejuMaps.showSpotDetails(${spot.id})">상세보기</button>
                </div>
            </div>
        `;
        
        // 팝업 연결
        marker.bindPopup(popupContent);
        
        // 지도에 추가
        marker.addTo(this.map);
        
        return marker;
    }
    
    /**
     * 카테고리별 마커 아이콘 반환
     */
    getMarkerIcon(category) {
        const iconBase = 'https://maps.google.com/mapfiles/ms/icons/';
        
        switch (category) {
            case 'nature':
                return iconBase + 'green-dot.png';
            case 'restaurant':
                return iconBase + 'red-dot.png';
            case 'hotel':
                return iconBase + 'blue-dot.png';
            case 'culture':
                return iconBase + 'purple-dot.png';
            case 'beach':
                return iconBase + 'lightblue-dot.png';
            case 'cave':
                return iconBase + 'yellow-dot.png';
            default:
                return iconBase + 'red-dot.png';
        }
    }
    
    /**
     * 카테고리명 반환
     */
    getCategoryName(category) {
        const categoryNames = {
            nature: '자연명소',
            restaurant: '맛집',
            hotel: '숙박',
            culture: '문화유산',
            beach: '해변',
            cave: '동굴',
            activity: '체험활동'
        };
        
        return categoryNames[category] || '기타';
    }
    
    /**
     * 현재 위치 확인
     */
    async getCurrentLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.log('위치 서비스를 지원하지 않는 브라우저입니다.');
                resolve(null);
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // 현재 위치 마커 표시
                    this.showCurrentLocationMarker();
                    
                    console.log('현재 위치 확인:', this.currentPosition);
                    resolve(this.currentPosition);
                },
                (error) => {
                    console.log('위치 확인 실패:', error.message);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000
                }
            );
        });
    }
    
    /**
     * 현재 위치 마커 표시
     */
    showCurrentLocationMarker() {
        if (!this.currentPosition) return;
        
        const currentMarker = new vworld.Marker(
            [this.currentPosition.lng, this.currentPosition.lat],
            {
                icon: 'https://maps.google.com/mapfiles/ms/icons/man.png',
                title: '현재 위치'
            }
        );
        
        currentMarker.bindPopup('현재 위치');
        currentMarker.addTo(this.map);
        this.markers.push(currentMarker);
    }
    
    /**
     * 지도 클릭 처리
     */
    handleMapClick(lng, lat) {
        console.log(`지도 클릭: ${lat}, ${lng}`);
        
        // 클릭 위치에 임시 마커 표시
        this.showTemporaryMarker(lat, lng);
        
        // 가장 가까운 관광지 찾기
        const nearestSpot = this.findNearestSpot(lat, lng);
        if (nearestSpot) {
            this.showNearestSpotInfo(nearestSpot, lat, lng);
        }
    }
    
    /**
     * 임시 마커 표시
     */
    showTemporaryMarker(lat, lng) {
        // 기존 임시 마커 제거
        this.clearTemporaryMarkers();
        
        const tempMarker = new vworld.Marker([lng, lat], {
            icon: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
            title: '선택된 위치'
        });
        
        tempMarker.addTo(this.map);
        this.temporaryMarkers = this.temporaryMarkers || [];
        this.temporaryMarkers.push(tempMarker);
    }
    
    /**
     * 가장 가까운 관광지 찾기
     */
    findNearestSpot(lat, lng) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.touristSpots.forEach(spot => {
            const distance = this.calculateDistance(lat, lng, spot.lat, spot.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = { ...spot, distance: Math.round(distance * 1000) }; // 미터 단위
            }
        });
        
        return nearest;
    }
    
    /**
     * 두 지점 간 거리 계산 (Haversine 공식)
     */
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // 지구 반지름 (km)
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    /**
     * 도를 라디안으로 변환
     */
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    /**
     * 브이월드 지오코딩 API를 이용한 주소 검색
     */
    async searchAddress(query) {
        try {
            this.showLoading('주소를 검색하는 중...');
            
            const encodedQuery = encodeURIComponent(query);
            const geocodingUrl = `https://api.vworld.kr/req/address?service=address&key=${this.apiKey}&request=getCoord&address=${encodedQuery}&type=road`;
            
            const response = await fetch(geocodingUrl);
            const data = await response.json();
            
            this.hideLoading();
            
            if (data.response && data.response.status === 'OK') {
                const result = data.response.result;
                if (result && result.point) {
                    const coords = {
                        lat: parseFloat(result.point.y),
                        lng: parseFloat(result.point.x)
                    };
                    
                    // 검색 결과로 지도 이동
                    this.moveToLocation(coords.lat, coords.lng);
                    
                    return coords;
                } else {
                    throw new Error('검색 결과가 없습니다.');
                }
            } else {
                throw new Error('주소 검색 실패');
            }
            
        } catch (error) {
            this.hideLoading();
            this.showErrorMessage(`주소 검색 실패: ${error.message}`);
            console.error('지오코딩 오류:', error);
            return null;
        }
    }
    
    /**
     * 지도 레이어 변경
     */
    changeMapLayer(layerType) {
        if (this.mapLayers[layerType] && this.currentLayer !== layerType) {
            this.currentLayer = layerType;
            console.log(`지도 레이어 변경: ${layerType}`);
        }
    }
    
    /**
     * 지정 위치로 지도 이동
     */
    moveToLocation(lat, lng, zoom = 14) {
        this.map.flyTo({
            center: [lng, lat],
            zoom: zoom,
            duration: 1000
        });
    }
    
    /**
     * UI 헬퍼 함수들
     */
    showLoading(message = '로딩 중...') {
        this.isLoading = true;
        console.log(message);
    }
    
    hideLoading() {
        this.isLoading = false;
    }
    
    showErrorMessage(message) {
        console.error(message);
        alert(message);
    }
    
    showSuccessMessage(message) {
        console.log(message);
    }
    
    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }
    
    clearTemporaryMarkers() {
        if (this.temporaryMarkers) {
            this.temporaryMarkers.forEach(marker => marker.remove());
            this.temporaryMarkers = [];
        }
    }
    
    /**
     * 폴백 모드 초기화 (브이월드 SDK 없을 때)
     */
    initializeFallbackMode() {
        const mapContainer = document.getElementById('vworld-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="fallback-map">
                    <div class="fallback-content">
                        <i class="fas fa-map-marked-alt"></i>
                        <h3>지도 서비스 준비 중</h3>
                        <p>브이월드 API 연결을 확인하고 있습니다.</p>
                        <p>잠시 후 다시 시도해주세요.</p>
                        <button onclick="location.reload()" class="retry-button">
                            <i class="fas fa-refresh"></i> 새로고침
                        </button>
                    </div>
                    <div class="tourist-spots-preview">
                        <h4>제주도 주요 관광지</h4>
                        <div class="spots-grid">
                            <div class="spot-item">📍 한라산 국립공원</div>
                            <div class="spot-item">📍 성산일출봉</div>
                            <div class="spot-item">📍 만장굴</div>
                            <div class="spot-item">📍 협재해수욕장</div>
                            <div class="spot-item">📍 우도</div>
                            <div class="spot-item">📍 천지연폭포</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        console.log('폴백 모드 활성화 - 기본 지도 인터페이스 표시');
    }
}

// 전역 변수로 지도 인스턴스 생성
let jejuMaps = null;

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    jejuMaps = new JejuVWorldMaps();
    
    // 페이지 요소 확인 후 초기화
    if (document.getElementById('vworld-map')) {
        await jejuMaps.initialize();
    }
    
    // 검색 기능 연결
    const searchInput = document.getElementById('address-search');
    const searchButton = document.getElementById('search-button');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', async () => {
            const query = searchInput.value.trim();
            if (query) {
                await jejuMaps.searchAddress(query);
            }
        });
        
        searchInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    await jejuMaps.searchAddress(query);
                }
            }
        });
    }
    
    // 레이어 변경 버튼 연결
    const layerButtons = document.querySelectorAll('.layer-button');
    layerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const layerType = button.dataset.layer;
            if (layerType && jejuMaps) {
                jejuMaps.changeMapLayer(layerType);
            }
        });
    });
    
    // 현재 위치 버튼 연결
    const currentLocationButton = document.getElementById('current-location-button');
    if (currentLocationButton) {
        currentLocationButton.addEventListener('click', async () => {
            if (jejuMaps.currentPosition) {
                jejuMaps.moveToLocation(jejuMaps.currentPosition.lat, jejuMaps.currentPosition.lng, 15);
            } else {
                await jejuMaps.getCurrentLocation();
                if (jejuMaps.currentPosition) {
                    jejuMaps.moveToLocation(jejuMaps.currentPosition.lat, jejuMaps.currentPosition.lng, 15);
                }
            }
        });
    }
    
    // 카테고리 필터 버튼 연결
    const categoryButtons = document.querySelectorAll('.category-filter');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            if (jejuMaps) {
                jejuMaps.filterByCategory(category);
            }
        });
    });
});

/**
 * 추가 프로토타입 함수들
 */

// 카테고리별 필터링
JejuVWorldMaps.prototype.filterByCategory = function(category) {
    if (category === 'all') {
        this.displayTouristMarkers();
        return;
    }
    
    this.clearMarkers();
    const filteredSpots = this.touristSpots.filter(spot => spot.category === category);
    
    filteredSpots.forEach(spot => {
        const marker = this.createMarker(spot);
        this.markers.push(marker);
    });
    
    console.log(`${category} 카테고리 ${filteredSpots.length}개 관광지 표시`);
};

// 관광지 상세 정보
JejuVWorldMaps.prototype.showSpotDetails = function(spotId) {
    const spot = this.touristSpots.find(s => s.id === spotId);
    if (!spot) return;
    
    const detailText = `${spot.name}\n${spot.description}\n주소: ${spot.address}`;
    alert(detailText);
    console.log('관광지 상세:', spot);
};

// 길찾기 기능
JejuVWorldMaps.prototype.showDirections = function(toLat, toLng, fromLat = null, fromLng = null) {
    const startPoint = fromLat && fromLng ? 
        { lat: fromLat, lng: fromLng } : 
        this.currentPosition || this.jejuCenter;
    
    const distance = this.calculateDistance(startPoint.lat, startPoint.lng, toLat, toLng);
    const distanceText = distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
    
    const walkingTime = Math.round((distance / 4) * 60);
    const drivingTime = Math.round((distance / 40) * 60);
    
    const directionInfo = `길찾기 정보\n거리: ${distanceText}\n예상시간: 도보 ${walkingTime}분, 차량 ${drivingTime}분`;
    alert(directionInfo);
};

// 관광지로 이동
JejuVWorldMaps.prototype.moveToSpot = function(spotId) {
    const spot = this.touristSpots.find(s => s.id === spotId);
    if (spot) {
        this.moveToLocation(spot.lat, spot.lng, 15);
    }
};

// 가장 가까운 관광지 정보 표시
JejuVWorldMaps.prototype.showNearestSpotInfo = function(spot, clickLat, clickLng) {
    const infoText = `가장 가까운 관광지: ${spot.name}\n거리: ${spot.distance}m`;
    
    if (confirm(`${infoText}\n이동하시겠습니까?`)) {
        this.moveToSpot(spot.id);
    }
};

// 중복 실행 방지 블록 닫기
window.JejuVWorldMaps = JejuVWorldMaps;
}
