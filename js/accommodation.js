// 제주도 숙박 예약 API 연동 엔진
class JejuAccommodationService {
    constructor() {
        this.apiUrl = '/accommodation-api.php';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5분 캐싱
        this.isLoading = false;
    }

    // 실시간 숙박 데이터 조회
    async getAccommodations(filters = {}) {
        const cacheKey = JSON.stringify(filters);
        
        // 캐시 확인
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            this.isLoading = true;
            this.showLoadingState();

            const params = new URLSearchParams({
                action: 'list',
                ...filters
            });

            const response = await fetch(`${this.apiUrl}?${params}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || '데이터를 불러올 수 없습니다');
            }

            // 캐시 저장
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            this.displayAccommodations(result.data);
            return result;

        } catch (error) {
            console.error('숙박 API 오류:', error);
            this.showErrorState(error.message);
            return null;
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
        }
    }

    // 로딩 상태 표시
    showLoadingState() {
        const container = document.getElementById('hotels-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>실시간 숙박 정보를 불러오는 중...</p>
                </div>
            `;
        }
    }

    // 로딩 상태 숨기기
    hideLoadingState() {
        const loadingElement = document.querySelector('.loading-state');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // 에러 상태 표시
    showErrorState(message) {
        const container = document.getElementById('hotels-container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>데이터를 불러올 수 없습니다</h3>
                    <p>${message}</p>
                    <button onclick="accommodationService.retryLoad()" class="retry-btn">
                        다시 시도
                    </button>
                </div>
            `;
        }
    }

    // 숙박시설 목록 렌더링
    displayAccommodations(accommodations) {
        const container = document.getElementById('hotels-container');
        if (!container) return;

        if (!accommodations || accommodations.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-bed"></i>
                    <h3>검색 결과가 없습니다</h3>
                    <p>다른 조건으로 검색해보세요.</p>
                </div>
            `;
            return;
        }

        const hotelCards = accommodations.map(hotel => this.createHotelCard(hotel)).join('');
        container.innerHTML = hotelCards;

        // 예약 버튼 이벤트 연결
        this.attachEventListeners();
    }

    // 숙박시설 카드 생성
    createHotelCard(hotel) {
        const discountBadge = hotel.discount_rate > 0 ? 
            `<span class="discount-badge">${hotel.discount_rate}% 할인</span>` : '';
        
        const availabilityBadge = hotel.available_rooms <= 5 ? 
            `<span class="availability-badge urgent">마지막 ${hotel.available_rooms}개 방</span>` :
            `<span class="availability-badge">${hotel.available_rooms}개 방 예약가능</span>`;

        return `
            <div class="hotel-card modern" data-hotel-id="${hotel.id}">
                <div class="hotel-image">
                    <i class="fas fa-hotel"></i>
                    <span class="hotel-badge">${this.getTypeLabel(hotel.type)}</span>
                    ${discountBadge}
                    ${availabilityBadge}
                </div>
                <div class="hotel-content">
                    <h3 class="hotel-title">${hotel.name}</h3>
                    <div class="hotel-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${hotel.address}
                    </div>
                    <div class="hotel-features">
                        ${hotel.features.slice(0, 4).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                    </div>
                    <div class="hotel-meta">
                        <div class="hotel-rating">
                            <span class="rating-stars">${this.generateStars(hotel.rating)}</span>
                            <span class="rating-text">${hotel.rating} (${hotel.reviews})</span>
                        </div>
                        <div class="hotel-price">
                            ${hotel.discount_rate > 0 ? 
                                `<div class="price-original">${hotel.base_price.toLocaleString()}원</div>` : ''
                            }
                            <div class="price-amount">${hotel.current_price.toLocaleString()}원</div>
                            <div class="price-unit">/ 1박</div>
                        </div>
                    </div>
                    <div class="hotel-buttons">
                        <button class="btn-reserve-new" data-hotel-id="${hotel.id}">
                            실시간 예약
                        </button>
                        <button class="btn-detail-new" data-hotel-id="${hotel.id}">
                            상세정보
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 숙박 타입 라벨 반환
    getTypeLabel(type) {
        const labels = {
            'hotel': '호텔',
            'resort': '리조트', 
            'pension': '펜션',
            'guesthouse': '게스트하우스'
        };
        return labels[type] || type;
    }

    // 별점 생성
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }

    // 이벤트 리스너 연결
    attachEventListeners() {
        // 실시간 예약 버튼
        document.querySelectorAll('.btn-reserve-new').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const hotelId = e.target.dataset.hotelId;
                this.openReservationModal(hotelId);
            });
        });

        // 상세정보 버튼
        document.querySelectorAll('.btn-detail-new').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const hotelId = e.target.dataset.hotelId;
                this.showHotelDetails(hotelId);
            });
        });
    }

    // 예약 모달 열기
    openReservationModal(hotelId) {
        alert(`${hotelId} 실시간 예약 기능이 곧 오픈됩니다!`);
    }

    // 숙박시설 상세정보 표시
    showHotelDetails(hotelId) {
        alert(`${hotelId} 상세정보 기능이 곧 오픈됩니다!`);
    }

    // 다시 로드
    retryLoad() {
        this.cache.clear();
        this.getAccommodations();
    }

    // 필터 적용
    applyFilters(filters) {
        this.getAccommodations(filters);
    }
}

// 전역 인스턴스 생성
const accommodationService = new JejuAccommodationService();

// 페이지 로드 시 자동 실행
document.addEventListener('DOMContentLoaded', () => {
    accommodationService.getAccommodations();
});
