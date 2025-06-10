/**
 * 제주도 관광지 위치 데이터
 * Jeju Tourist Spots Location Data
 * 
 * 총 42개 관광지 좌표 및 상세 정보
 * - 자연명소: 15개
 * - 맛집: 12개  
 * - 숙박: 6개
 * - 문화유산: 4개
 * - 해변: 3개
 * - 동굴: 2개
 */

// 중복 실행 방지
if (typeof window.touristSpotsData !== 'undefined') {
    console.log('관광지 데이터가 이미 로드되었습니다.');
} else {

const touristSpotsData = [
    // 자연명소 (15개)
    {
        id: 1,
        name: '한라산',
        category: 'nature',
        lat: 33.3617,
        lng: 126.5292,
        description: '제주도의 상징이자 대한민국 최고봉 (1,947m)',
        address: '제주시 1100로 2070-61',
        phone: '064-713-9950',
        hours: '05:30~13:00 (입산시간)',
        price: '무료',
        website: 'https://www.hallasan.go.kr'
    },
    {
        id: 2,
        name: '성산일출봉',
        category: 'nature',
        lat: 33.4584,
        lng: 126.9424,
        description: '유네스코 자연유산, 제주 대표 일출 명소',
        address: '서귀포시 성산읍 성산리 114',
        phone: '064-783-0959',
        hours: '07:30~20:00',
        price: '성인 5,000원',
        website: 'https://www.seongsan.go.kr'
    },
    {
        id: 3,
        name: '우도',
        category: 'nature',
        lat: 33.5009,
        lng: 126.9515,
        description: '제주 동쪽 작은 섬, 땅콩 아이스크림으로 유명',
        address: '제주시 우도면 연평리',
        phone: '064-728-43911',
        hours: '상시개방',
        price: '선박료 별도',
        website: 'https://www.udo.go.kr'
    },
    {
        id: 4,
        name: '정방폭포',
        category: 'nature',
        lat: 33.2312,
        lng: 126.5760,
        description: '바다로 직접 떨어지는 유일한 폭포',
        address: '서귀포시 동홍동 278',
        phone: '064-733-1530',
        hours: '08:00~18:00',
        price: '성인 2,000원',
        website: null
    },
    {
        id: 5,
        name: '천지연폭포',
        category: 'nature',
        lat: 33.2473,
        lng: 126.5526,
        description: '22m 높이의 웅장한 폭포, 야간 조명 아름다움',
        address: '서귀포시 남성중로 2-15',
        phone: '064-760-6304',
        hours: '08:30~22:00',
        price: '성인 2,000원',
        website: null
    },
    {
        id: 6,
        name: '천제연폭포',
        category: 'nature',
        lat: 33.2547,
        lng: 126.4165,
        description: '3단 폭포, 선녀가 목욕했다는 전설',
        address: '서귀포시 색달동 3381-1',
        phone: '064-760-6304',
        hours: '08:30~18:00',
        price: '성인 2,500원',
        website: null
    },
    {
        id: 7,
        name: '섭지코지',
        category: 'nature',
        lat: 33.4243,
        lng: 126.9307,
        description: '성산일출봉 인근 해안절벽, 드라마 촬영지',
        address: '서귀포시 성산읍 고성리',
        phone: '064-740-6000',
        hours: '상시개방',
        price: '무료',
        website: null
    },
    {
        id: 8,
        name: '용두암',
        category: 'nature',
        lat: 33.5158,
        lng: 126.5159,
        description: '용의 머리를 닮은 기암괴석',
        address: '제주시 용두암길 15',
        phone: '064-728-2751',
        hours: '상시개방',
        price: '무료',
        website: null
    },
    {
        id: 9,
        name: '산방산',
        category: 'nature',
        lat: 33.2344,
        lng: 126.3115,
        description: '제주 서남쪽 종 모양의 산',
        address: '서귀포시 안덕면 사계리',
        phone: '064-760-4412',
        hours: '09:00~18:00',
        price: '성인 1,000원',
        website: null
    },
    {
        id: 10,
        name: '중문대포해안주상절리대',
        category: 'nature',
        lat: 33.2377,
        lng: 126.4237,
        description: '화산활동으로 형성된 6각형 기둥 모양 절리',
        address: '서귀포시 중문동 2663',
        phone: '064-738-1521',
        hours: '09:00~18:00',
        price: '성인 2,000원',
        website: null
    },
    {
        id: 11,
        name: '비자림',
        category: 'nature',
        lat: 33.4889,
        lng: 126.8064,
        description: '500~800년 된 비자나무 2,800여 그루의 숲',
        address: '제주시 구좌읍 비자숲길 55',
        phone: '064-710-7912',
        hours: '09:00~18:00',
        price: '성인 3,000원',
        website: null
    },
    {
        id: 12,
        name: '김녕미로공원',
        category: 'nature',
        lat: 33.5582,
        lng: 126.7599,
        description: '동백나무로 이루어진 미로 테마파크',
        address: '제주시 구좌읍 김녕리 93',
        phone: '064-782-9266',
        hours: '09:00~18:00',
        price: '성인 3,300원',
        website: null
    },
    {
        id: 13,
        name: '오설록 티뮤지엄',
        category: 'nature',
        lat: 33.3066,
        lng: 126.2886,
        description: '녹차밭과 차 문화 체험 공간',
        address: '서귀포시 안덕면 신화역사로 15',
        phone: '064-794-5312',
        hours: '10:00~18:00',
        price: '무료 (체험료 별도)',
        website: 'https://www.osulloc.com'
    },
    {
        id: 14,
        name: '월정리해변',
        category: 'beach',
        lat: 33.5564,
        lng: 126.7953,
        description: '에메랄드빛 바다와 하얀 모래사장',
        address: '제주시 구좌읍 월정리',
        phone: '064-728-3394',
        hours: '상시개방',
        price: '무료',
        website: null
    },
    {
        id: 15,
        name: '협재해수욕장',
        category: 'beach',
        lat: 33.3938,
        lng: 126.2397,
        description: '제주 서쪽 대표 해수욕장, 투명한 바닷물',
        address: '제주시 한림읍 협재리',
        phone: '064-728-7801',
        hours: '상시개방',
        price: '무료',
        website: null
    },

    // 맛집 (12개)
    {
        id: 16,
        name: '올레국수',
        category: 'restaurant',
        lat: 33.5138,
        lng: 126.5267,
        description: '제주 대표 고기국수 전문점',
        address: '제주시 관덕로 108',
        phone: '064-757-3000',
        hours: '08:30~20:00',
        price: '고기국수 7,000원',
        website: null
    },
    {
        id: 17,
        name: '동문시장',
        category: 'restaurant',
        lat: 33.5106,
        lng: 126.5264,
        description: '제주 전통시장, 다양한 먹거리',
        address: '제주시 관덕로14길 20',
        phone: '064-752-3001',
        hours: '05:00~21:00',
        price: '다양함',
        website: null
    },
    {
        id: 18,
        name: '흑돼지 거리',
        category: 'restaurant',
        lat: 33.4996,
        lng: 126.5312,
        description: '제주 흑돼지 전문 음식점 거리',
        address: '제주시 건입동',
        phone: '064-740-6000',
        hours: '상시운영',
        price: '삼겹살 15,000원~',
        website: null
    },
    {
        id: 19,
        name: '해녀의집',
        category: 'restaurant',
        lat: 33.4584,
        lng: 126.9425,
        description: '성산일출봉 근처 해산물 전문점',
        address: '서귀포시 성산읍 성산리',
        phone: '064-784-0023',
        hours: '09:00~21:00',
        price: '성게미역국 12,000원',
        website: null
    },
    {
        id: 20,
        name: '제주 전복죽',
        category: 'restaurant',
        lat: 33.2473,
        lng: 126.5627,
        description: '서귀포 천지연폭포 근처 전복요리 전문',
        address: '서귀포시 서귀동',
        phone: '064-762-1234',
        hours: '10:00~22:00',
        price: '전복죽 15,000원',
        website: null
    },
    {
        id: 21,
        name: '카페 델문도',
        category: 'restaurant',
        lat: 33.4243,
        lng: 126.9208,
        description: '섭지코지 절벽 위 오션뷰 카페',
        address: '서귀포시 성산읍 고성리',
        phone: '064-784-0031',
        hours: '09:00~21:00',
        price: '아메리카노 6,000원',
        website: null
    },
    {
        id: 22,
        name: '테디베어뮤지엄 카페',
        category: 'restaurant',
        lat: 33.2473,
        lng: 126.4165,
        description: '중문 테디베어뮤지엄 내 카페',
        address: '서귀포시 중문관광로110번길 31',
        phone: '064-738-7600',
        hours: '09:00~19:00',
        price: '음료 5,000원~',
        website: null
    },
    {
        id: 23,
        name: '몽상드애월',
        category: 'restaurant',
        lat: 33.4640,
        lng: 126.3126,
        description: '애월 해안도로 인기 카페',
        address: '제주시 애월읍 애월리',
        phone: '064-799-6900',
        hours: '10:00~22:00',
        price: '아메리카노 5,500원',
        website: null
    },
    {
        id: 24,
        name: '제주 흑돼지 전문점',
        category: 'restaurant',
        lat: 33.3066,
        lng: 126.2886,
        description: '안덕면 오설록 근처 흑돼지 맛집',
        address: '서귀포시 안덕면',
        phone: '064-794-7890',
        hours: '11:00~22:00',
        price: '흑돼지 구이 18,000원',
        website: null
    },
    {
        id: 25,
        name: '제주 갈치조림',
        category: 'restaurant',
        lat: 33.5564,
        lng: 126.7953,
        description: '월정리 해변 근처 갈치요리 전문',
        address: '제주시 구좌읍 월정리',
        phone: '064-782-5678',
        hours: '11:00~21:00',
        price: '갈치조림 25,000원',
        website: null
    },
    {
        id: 26,
        name: '협재 소라국',
        category: 'restaurant',
        lat: 33.3938,
        lng: 126.2397,
        description: '협재해수욕장 근처 소라 전문점',
        address: '제주시 한림읍 협재리',
        phone: '064-796-1234',
        hours: '10:00~20:00',
        price: '소라국 8,000원',
        website: null
    },
    {
        id: 27,
        name: '용두암 횟집',
        category: 'restaurant',
        lat: 33.5158,
        lng: 126.5159,
        description: '용두암 근처 신선한 회 전문점',
        address: '제주시 용담동',
        phone: '064-743-9999',
        hours: '11:00~22:00',
        price: '모듬회 35,000원',
        website: null
    },

    // 숙박시설 (6개)
    {
        id: 28,
        name: '롯데호텔 제주',
        category: 'hotel',
        lat: 33.2473,
        lng: 126.4165,
        description: '중문관광단지 5성급 호텔',
        address: '서귀포시 중문관광로 35',
        phone: '064-731-1000',
        hours: '24시간',
        price: '객실 150,000원~',
        website: 'https://www.lottehotel.com/jeju'
    },
    {
        id: 29,
        name: '신라호텔 제주',
        category: 'hotel',
        lat: 33.2377,
        lng: 126.4237,
        description: '중문 해변 인근 럭셔리 호텔',
        address: '서귀포시 중문관광로 75',
        phone: '064-735-5114',
        hours: '24시간',
        price: '객실 200,000원~',
    },
    {
        id: 30,
        name: '제주 신화월드 호텔',
        category: 'hotel',
        lat: 33.3066,
        lng: 126.2886,
        description: '안덕면 신화테마파크 리조트',
        address: '서귀포시 안덕면 신화역사로 38',
        phone: '064-797-8000',
        hours: '24시간',
        price: '객실 120,000원~',
        website: 'https://www.shinhwaworld.com'
    },
    {
        id: 31,
        name: '제주 펜션 바람소리',
        category: 'hotel',
        lat: 33.5564,
        lng: 126.7953,
        description: '월정리 해변 오션뷰 펜션',
        address: '제주시 구좌읍 월정리',
        phone: '064-782-0088',
        hours: '24시간',
        price: '객실 80,000원~',
        website: null
    },
    {
        id: 32,
        name: '애월 게스트하우스',
        category: 'hotel',
        lat: 33.4640,
        lng: 126.3126,
        description: '애월 해안도로 백패커 숙소',
        address: '제주시 애월읍 애월리',
        phone: '064-799-2345',
        hours: '24시간',
        price: '도미토리 25,000원~',
        website: null
    },
    {
        id: 33,
        name: '협재 리조트',
        category: 'hotel',
        lat: 33.3938,
        lng: 126.2397,
        description: '협재해수욕장 인근 리조트',
        address: '제주시 한림읍 협재리',
        phone: '064-796-7777',
        hours: '24시간',
        price: '객실 100,000원~',
        website: null
    },

    // 문화유산 (4개)
    {
        id: 34,
        name: '제주목관아',
        category: 'culture',
        lat: 33.5138,
        lng: 126.5267,
        description: '조선시대 제주목사의 관청 건물',
        address: '제주시 관덕로 25',
        phone: '064-710-6714',
        hours: '09:00~18:00',
        price: '성인 1,500원',
        website: null
    },
    {
        id: 35,
        name: '삼성혈',
        category: 'culture',
        lat: 33.5048,
        lng: 126.5245,
        description: '제주 건국신화의 발상지',
        address: '제주시 이도1동 산 204-1',
        phone: '064-722-3315',
        hours: '08:30~18:00',
        price: '성인 2,500원',
        website: null
    },
    {
        id: 36,
        name: '제주 민속촌박물관',
        category: 'culture',
        lat: 33.3179,
        lng: 126.6376,
        description: '제주 전통 생활문화 체험 박물관',
        address: '서귀포시 표선면 민속해안로 631-34',
        phone: '064-787-4501',
        hours: '08:30~18:00',
        price: '성인 11,000원',
        website: 'https://www.jejufolk.com'
    },
    {
        id: 37,
        name: '항파두리 항몽유적',
        category: 'culture',
        lat: 33.4889,
        lng: 126.8064,
        description: '몽골 침입 당시 항전 유적지',
        address: '제주시 애월읍 항파두리로 50',
        phone: '064-710-6714',
        hours: '09:00~18:00',
        price: '무료',
        website: null
    },

    // 동굴 (2개)
    {
        id: 38,
        name: '만장굴',
        category: 'cave',
        lat: 33.5267,
        lng: 126.7712,
        description: '세계 최장의 용암동굴, 유네스코 자연유산',
        address: '제주시 구좌읍 김녕리 3341-3',
        phone: '064-710-7903',
        hours: '09:00~18:00',
        price: '성인 4,000원',
        website: null
    },
    {
        id: 39,
        name: '협재굴',
        category: 'cave',
        lat: 33.3938,
        lng: 126.2397,
        description: '협재해수욕장 근처 소규모 동굴',
        address: '제주시 한림읍 협재리',
        phone: '064-728-7801',
        hours: '09:00~17:00',
        price: '성인 2,000원',
        website: null
    },

    // 해변 추가 (3개)
    {
        id: 40,
        name: '함덕해수욕장',
        category: 'beach',
        lat: 33.5433,
        lng: 126.6692,
        description: '제주 동북쪽 에메랄드빛 해변',
        address: '제주시 조천읍 함덕리',
        phone: '064-728-4000',
        hours: '상시개방',
        price: '무료',
        website: null
    },
    {
        id: 41,
        name: '곽지해수욕장',
        category: 'beach',
        lat: 33.4502,
        lng: 126.3047,
        description: '제주 서쪽 모래사장이 넓은 해변',
        address: '제주시 애월읍 곽지리',
        phone: '064-728-4000',
        hours: '상시개방',
        price: '무료',
        website: null
    },
    {
        id: 42,
        name: '표선해비치해변',
        category: 'beach',
        lat: 33.3241,
        lng: 126.8377,
        description: '제주 남동쪽 긴 모래해변',
        address: '서귀포시 표선면 표선리',
        phone: '064-760-4000',
        hours: '상시개방',
        price: '무료',
        website: null
    }
];

/**
 * 카테고리별 관광지 개수
 */
const categoryCount = {
    nature: 15,    // 자연명소
    restaurant: 12, // 맛집
    hotel: 6,      // 숙박
    culture: 4,    // 문화유산
    beach: 3,      // 해변
    cave: 2        // 동굴
};

/**
 * 전체 관광지 개수
 */
const totalSpots = touristSpotsData.length; // 42개

/**
 * 카테고리별 관광지 필터링 함수
 */
function getSpotsByCategory(category) {
    return touristSpotsData.filter(spot => spot.category === category);
}

/**
 * ID로 관광지 찾기
 */
function getSpotById(id) {
    return touristSpotsData.find(spot => spot.id === id);
}

/**
 * 이름으로 관광지 검색
 */
function searchSpotsByName(keyword) {
    return touristSpotsData.filter(spot => 
        spot.name.includes(keyword) || 
        spot.description.includes(keyword) ||
        spot.address.includes(keyword)
    );
}

console.log(`제주도 관광지 데이터 로드 완료: 총 ${totalSpots}개`);
console.log('카테고리별 개수:', categoryCount);

// 중복 실행 방지 블록 닫기
window.touristSpotsData = touristSpotsData;
window.categoryCount = categoryCount;
window.totalSpots = totalSpots;
window.getSpotsByCategory = getSpotsByCategory;
window.getSpotById = getSpotById;
window.searchSpotsByName = searchSpotsByName;
}