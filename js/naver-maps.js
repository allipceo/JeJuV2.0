/**
 * 제주도 관광 홈페이지 - 네이버맵 서비스
 * Naver Maps API를 활용한 제주도 관광지 지도 서비스
 * 작성일: 2025.06.08
 * 버전: 1.0
 */

// 중복 실행 방지
if (typeof window.JejuNaverMaps !== 'undefined') {
    console.log('네이버맵 스크립트가 이미 로드되었습니다.');
} else {

class JejuNaverMaps {
    constructor() {
        this.clientId = 'KQ0iz0IyBJkeUlkmblDyWvpzTPTaGy2MqDopM0BA';
        this.map = null;
        this.markers = [];
        this.infoWindows = [];
        this.currentPosition = null;
        
        // 제주도 중심 좌표
        this.jejuCenter = new naver.maps.LatLng(33.4996213, 126.5311884);
        
        // 지도 설정
        this.mapOptions = {
            center: this.jejuCenter,
            zoom: 10,
            mapTypeId: naver.maps.MapTypeId.NORMAL,
            mapDataControl: false,
            scaleControl: true,
            logoControl: true,
            mapTypeControl: true,
            zoomControl: true,
            zoomControlOptions: {
                position: naver.maps.Position.TOP_RIGHT
            }
        };
        
        this.isInitialized = false;
    }
    
    /**
     * 네이버맵 초기화
     */
    async initialize() {
        try {
            console.log('🗺️ 네이버맵 서비스 초기화 시작...');
            
            // 네이버맵 SDK 로드 확인
            if (typeof naver === 'undefined' || !naver.maps) {
                throw new Error('네이버맵 SDK가 로드되지 않았습니다.');
            }
            
            // 지도 컨테이너 확인
            const mapContainer = document.getElementById('vworld-map');
            if (!mapContainer) {
                throw new Error('지도 컨테이너를 찾을 수 없습니다.');
            }
            
            // 로딩 표시 제거
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // 네이버맵 생성
            this.map = new naver.maps.Map(mapContainer, this.mapOptions);
            
            // 지도 이벤트 설정
            this.setupMapEvents();
            
            // 컨트롤 이벤트 설정
            this.setupControlEvents();
            
            console.log('✅ 네이버맵 초기화 완료');
            this.isInitialized = true;
            
            // 관광지 데이터 로드
            if (typeof jejuTouristSpots !== 'undefined') {
                this.loadTouristSpots();
            }
            
        } catch (error) {
            console.error('❌ 네이버맵 초기화 실패:', error);
            this.showFallbackMode(error.message);
        }
    }
    
    /**
     * 지도 이벤트 설정
     */
    setupMapEvents() {
        // 지도 클릭 이벤트
        naver.maps.Event.addListener(this.map, 'click', (e) => {
            console.log('지도 클릭:', e.coord.toString());
        });
        
        // 지도 줌 변경 이벤트
        naver.maps.Event.addListener(this.map, 'zoom_changed', (zoom) => {
            console.log('줌 레벨 변경:', zoom);
        });
        
        // 지도 중심 변경 이벤트
        naver.maps.Event.addListener(this.map, 'center_changed', (center) => {
            console.log('중심점 변경:', center.toString());
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
                    const currentPos = new naver.maps.LatLng(lat, lng);
                    
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
        if (this.currentPosition) {
            this.currentPosition.setMap(null);
        }
        
        // 새 마커 생성
        this.currentPosition = new naver.maps.Marker({
            position: position,
            map: this.map,
            icon: {
                content: '<div style="background: #ff4757; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                anchor: new naver.maps.Point(6, 6)
            }
        });
    }
    
    /**
     * 지도 리셋
     */
    resetMap() {
        if (this.map) {
            this.map.setCenter(this.jejuCenter);
            this.map.setZoom(10);
            console.log('🔄 지도 리셋 완료');
        }
    }
    
    /**
     * 폴백 모드 표시
     */
    showFallbackMode(errorMessage) {
        const mapContainer = document.getElementById('vworld-map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div class="fallback-map">
                    <div class="fallback-content">
                        <i class="fas fa-map-marked-alt"></i>
                        <h3>네이버맵 로딩 중...</h3>
                        <p>${errorMessage}</p>
                        <button onclick="location.reload()" class="retry-button">
                            <i class="fas fa-refresh"></i> 새로고침
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// 전역 네이버맵 서비스 인스턴스
let jejuNaverMaps;

// DOM 로드 완료 시 네이버맵 서비스 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 네이버맵 SDK 로드 대기
    if (typeof naver !== 'undefined' && naver.maps) {
        jejuNaverMaps = new JejuNaverMaps();
        jejuNaverMaps.initialize();
    } else {
        // SDK 로드 대기
        setTimeout(() => {
            if (typeof naver !== 'undefined' && naver.maps) {
                jejuNaverMaps = new JejuNaverMaps();
                jejuNaverMaps.initialize();
            } else {
                console.error('네이버맵 SDK 로드 실패');
            }
        }, 1000);
    }
});

// 외부에서 사용할 수 있는 함수들
window.JejuNaverMaps = {
    getInstance: () => jejuNaverMaps,
    resetMap: () => jejuNaverMaps?.resetMap(),
    getCurrentLocation: () => jejuNaverMaps?.getCurrentLocation()
};

} // 중복 실행 방지 종료
