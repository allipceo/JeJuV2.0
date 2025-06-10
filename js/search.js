/* ================================
   제주도 통합검색 JavaScript 엔진
   ================================ */

// 전역 변수
let searchData = {};
let currentResults = [];
let currentFilters = {
    category: 'all',
    region: 'all',
    price: 'all'
};

// 검색 데이터 초기화
const initializeSearchData = () => {
    searchData = {
        attractions: [
            {
                id: 'hallasan',
                name: '한라산 국립공원',
                category: 'attractions',
                type: '자연명소',
                region: 'hallasan',
                description: '제주도의 상징이자 대한민국 최고봉(1,950m)으로, 사계절 아름다운 자연경관을 자랑합니다.',
                rating: 4.8,
                location: '제주시 해안동',
                keywords: ['한라산', '등산', '국립공원', '자연', '트레킹', '최고봉'],
                icon: 'fas fa-mountain'
            },
            {
                id: 'seongsan',
                name: '성산일출봉',
                category: 'attractions',
                type: '자연명소',
                region: 'east',
                description: '유네스코 세계자연유산으로 지정된 화산분화구로, 일출 명소로 유명합니다.',
                rating: 4.9,
                location: '서귀포시 성산읍',
                keywords: ['성산일출봉', '일출', '유네스코', '화산', '세계자연유산'],
                icon: 'fas fa-sun'
            },
            {
                id: 'manjanggul',
                name: '만장굴',
                category: 'attractions',
                type: '자연명소',
                region: 'east',
                description: '세계 최장의 용암동굴 중 하나로, 신비로운 지하세계를 체험할 수 있습니다.',
                rating: 4.6,
                location: '제주시 구좌읍',
                keywords: ['만장굴', '동굴', '용암동굴', '지하', '체험'],
                icon: 'fas fa-cave'
            },
            {
                id: 'hyeopjae',
                name: '협재해수욕장',
                category: 'attractions',
                type: '해변',
                region: 'west',
                description: '제주도 대표 해수욕장으로 에메랄드빛 바다와 하얀 모래사장이 아름다운 곳입니다.',
                rating: 4.6,
                location: '제주시 한림읍',
                keywords: ['협재해수욕장', '해수욕장', '바다', '모래사장', '해변'],
                icon: 'fas fa-umbrella-beach'
            }
        ],
        restaurants: [
            {
                id: 'donsadon',
                name: '돈사돈',
                category: 'restaurants',
                type: '제주향토음식',
                region: 'jeju-city',
                description: '제주 흑돼지 전문점으로 신선한 흑돼지 고기를 맛볼 수 있습니다.',
                rating: 4.7,
                price: 'medium',
                priceRange: '3-5만원',
                location: '제주시 이도일동',
                keywords: ['흑돼지', '고기', '제주특산품', '구이'],
                icon: 'fas fa-utensils'
            },
            {
                id: 'cafe1',
                name: '오션뷰카페',
                category: 'restaurants',
                type: '카페',
                region: 'seogwipo',
                description: '탁 트인 바다 전망과 함께 제주 원두 커피를 즐길 수 있는 카페입니다.',
                rating: 4.9,
                price: 'low',
                priceRange: '1-2만원',
                location: '서귀포시 성산읍',
                keywords: ['오션뷰', '카페', '바다전망', '제주원두', '커피'],
                icon: 'fas fa-coffee'
            }
        ],
        hotels: [
            {
                id: 'grand-hotel',
                name: '제주 그랜드 호텔',
                category: 'hotels',
                type: '호텔',
                region: 'jeju-city',
                description: '제주시 중심가에 위치한 5성급 럭셔리 호텔로 최고급 서비스를 제공합니다.',
                rating: 4.8,
                price: 'high',
                priceRange: '20만원 이상',
                location: '제주시 연동',
                keywords: ['5성급', '럭셔리', '호텔', '중심가'],
                icon: 'fas fa-hotel'
            }
        ]
    };
};

// DOM 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeSearchData();
    setupEventListeners();
    loadRecentSearches();
    addSearchAlertStyles();
});

// 이벤트 리스너 설정
const setupEventListeners = () => {
    const searchInput = document.getElementById('mainSearchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = Object.keys(btn.dataset)[0];
            const filterValue = btn.dataset[filterType];
            
            const groupBtns = document.querySelectorAll(`[data-${filterType}]`);
            groupBtns.forEach(b => b.classList.remove('active'));
            
            btn.classList.add('active');
            currentFilters[filterType] = filterValue;
            
            if (currentResults.length > 0) {
                filterAndDisplayResults(currentResults);
            }
        });
    });
};

// 메인 검색 수행
const performSearch = () => {
    const query = document.getElementById('mainSearchInput').value.trim();
    
    if (query.length === 0) {
        showAlert('검색어를 입력해주세요.', 'warning');
        return;
    }
    
    addToSearchHistory(query);
    const results = searchItems(query);
    currentResults = results;
    filterAndDisplayResults(results);
    hideSearchSuggestions();
};

// 검색 실행
const searchItems = (query) => {
    const allItems = [
        ...searchData.attractions,
        ...searchData.restaurants,
        ...searchData.hotels
    ];
    
    const results = allItems.filter(item => {
        const searchFields = [
            item.name,
            item.description,
            item.type,
            item.location,
            ...item.keywords
        ].join(' ').toLowerCase();
        
        const queryWords = query.toLowerCase().split(' ');
        return queryWords.some(word => searchFields.includes(word));
    });
    
    return results.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, query);
        const bScore = calculateRelevanceScore(b, query);
        return bScore - aScore;
    });
};

// 관련도 점수 계산
const calculateRelevanceScore = (item, query) => {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    if (item.name.toLowerCase().includes(queryLower)) score += 10;
    
    const matchingKeywords = item.keywords.filter(keyword => 
        keyword.toLowerCase().includes(queryLower)
    );
    score += matchingKeywords.length * 5;
    
    if (item.description.toLowerCase().includes(queryLower)) score += 3;
    score += item.rating;
    
    return score;
};

// 필터링 및 결과 표시
const filterAndDisplayResults = (results) => {
    let filteredResults = results.filter(item => {
        if (currentFilters.category !== 'all' && item.category !== currentFilters.category) {
            return false;
        }
        
        if (currentFilters.region !== 'all' && item.region !== currentFilters.region) {
            return false;
        }
        
        if (currentFilters.price !== 'all' && item.price && item.price !== currentFilters.price) {
            return false;
        }
        
        return true;
    });
    
    displaySearchResults(filteredResults);
};

// 검색 결과 표시
const displaySearchResults = (results) => {
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsHeader = document.getElementById('resultsHeader');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    
    if (results.length === 0) {
        resultsHeader.style.display = 'none';
        resultsContainer.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    resultsHeader.style.display = 'flex';
    resultsCount.textContent = `${results.length}개의 검색 결과`;
    noResults.style.display = 'none';
    
    resultsContainer.innerHTML = results.map(item => createResultCard(item)).join('');
    
    document.getElementById('searchResults').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
};

// 결과 카드 생성
const createResultCard = (item) => {
    const priceInfo = item.priceRange ? 
        `<div class="result-price">${item.priceRange}</div>` : '';
    
    const categoryText = {
        'attractions': '관광명소',
        'restaurants': '맛집',
        'hotels': '숙박'
    };
    
    return `
        <div class="result-card">
            <div class="result-card-image">
                <i class="${item.icon}"></i>
            </div>
            <div class="result-card-content">
                <div class="result-card-header">
                    <h4>${item.name}</h4>
                    <span class="result-category">${categoryText[item.category]}</span>
                </div>
                <p>${item.description}</p>
                <div class="result-meta">
                    <div class="result-rating">
                        <i class="fas fa-star"></i>
                        <span>${item.rating}</span>
                    </div>
                    <div class="result-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${item.location}</span>
                    </div>
                    ${priceInfo}
                </div>
            </div>
        </div>
    `;
};

// 키워드 검색
const searchKeyword = (keyword) => {
    document.getElementById('mainSearchInput').value = keyword;
    performSearch();
};

// 검색 기록 관리
const addToSearchHistory = (query) => {
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    history = history.filter(item => item !== query);
    history.unshift(query);
    history = history.slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(history));
    updateRecentSearchesDisplay();
};

// 최근 검색어 표시 업데이트
const updateRecentSearchesDisplay = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const container = document.getElementById('recentSearches');
    const clearBtn = document.querySelector('.clear-history-btn');
    
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = '<p class="no-recent">아직 검색 기록이 없습니다.</p>';
        if (clearBtn) clearBtn.style.display = 'none';
        return;
    }
    
    container.innerHTML = history.map(query => 
        `<span class="recent-search-item" onclick="searchKeyword('${query}')">${query}</span>`
    ).join('');
    
    if (clearBtn) clearBtn.style.display = 'inline-block';
};

// 최근 검색어 로드
const loadRecentSearches = () => {
    updateRecentSearchesDisplay();
};

// 검색 기록 삭제
const clearSearchHistory = () => {
    if (confirm('검색 기록을 모두 삭제하시겠습니까?')) {
        localStorage.removeItem('searchHistory');
        updateRecentSearchesDisplay();
        showAlert('검색 기록이 삭제되었습니다.', 'success');
    }
};

// 검색 입력 처리
const handleSearchInput = (e) => {
    const query = e.target.value.trim();
    
    if (query.length > 0) {
        showSearchSuggestions(query);
    } else {
        hideSearchSuggestions();
    }
};

// 검색 제안 표시
const showSearchSuggestions = (query) => {
    const suggestions = generateSuggestions(query);
    const suggestionsContainer = document.getElementById('searchSuggestions');
    
    if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = suggestions.map(item => `
            <div class="suggestion-item" onclick="selectSuggestion('${item.name}')">
                <i class="${item.icon}"></i>
                <span>${item.name}</span>
                <small>${item.type}</small>
            </div>
        `).join('');
        suggestionsContainer.style.display = 'block';
    } else {
        hideSearchSuggestions();
    }
};

// 제안 항목 생성
const generateSuggestions = (query) => {
    const allItems = [
        ...searchData.attractions,
        ...searchData.restaurants,
        ...searchData.hotels
    ];
    
    return allItems.filter(item => {
        const searchFields = [
            item.name,
            item.description,
            ...item.keywords
        ].join(' ').toLowerCase();
        
        return searchFields.includes(query.toLowerCase());
    }).slice(0, 5);
};

// 제안 선택
const selectSuggestion = (name) => {
    document.getElementById('mainSearchInput').value = name;
    hideSearchSuggestions();
    performSearch();
};

// 검색 제안 숨기기
const hideSearchSuggestions = () => {
    const suggestionsContainer = document.getElementById('searchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }
};

// 결과 정렬
const sortResults = () => {
    const sortValue = document.getElementById('sortSelect').value;
    
    if (currentResults.length === 0) return;
    
    let sortedResults = [...currentResults];
    
    switch (sortValue) {
        case 'name':
            sortedResults.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            sortedResults.sort((a, b) => b.rating - a.rating);
            break;
        case 'price':
            sortedResults.sort((a, b) => {
                const priceOrder = { 'low': 1, 'medium': 2, 'high': 3 };
                return (priceOrder[a.price] || 0) - (priceOrder[b.price] || 0);
            });
            break;
        default:
            break;
    }
    
    filterAndDisplayResults(sortedResults);
};

// 알림 메시지 표시
const showAlert = (message, type = 'info') => {
    const existingAlert = document.querySelector('.search-alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `search-alert search-alert-${type}`;
    alert.innerHTML = `
        <div class="alert-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
};

// CSS 애니메이션 추가
const addSearchAlertStyles = () => {
    if (document.getElementById('search-alert-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'search-alert-styles';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .alert-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    `;
    
    document.head.appendChild(style);
};

console.log('제주도 통합검색 시스템이 초기화되었습니다.');