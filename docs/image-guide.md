# 제주도 관광 웹사이트 - 무료 이미지 URL 목록

## 📸 추천 무료 이미지 사이트

### 1. Pixabay (https://pixabay.com)
- 로열티 프리, 출처 표기 불필요
- 고화질 이미지 제공
- 상업적 이용 가능

### 2. Pexels (https://pexels.com)
- 100% 무료 사용
- 출처 표기 불필요
- 고품질 사진

### 3. Unsplash (https://unsplash.com)
- 무료 고화질 사진
- 상업적 이용 가능
- 크리에이터 지원 가능

## 🏔️ 제주도 관광지별 추천 검색 키워드

### 한라산 관련
- "hallasan mountain"
- "jeju mountain"
- "korea mountain sunrise"
- "volcanic mountain"

### 성산일출봉 관련
- "seongsan ilchulbong"
- "jeju sunrise peak"
- "volcanic crater sunrise"
- "korea unesco site"

### 만장굴 관련
- "lava cave"
- "underground cave"
- "volcanic cave korea"
- "jeju cave"

### 해변 관련
- "jeju beach"
- "korea beach"
- "emerald ocean"
- "tropical beach"

## 🔗 직접 사용 가능한 무료 이미지 URL 예시

아래 URL들은 실제 무료 이미지들로, 바로 사용 가능합니다:

```html
<!-- 한라산 대체 이미지 -->
<img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" alt="한라산">

<!-- 성산일출봉 대체 이미지 -->
<img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800" alt="성산일출봉">

<!-- 제주 바다 대체 이미지 -->
<img src="https://images.unsplash.com/photo-1566400286842-ee5f70748cd9?w=800" alt="제주 바다">

<!-- 제주 자연 대체 이미지 -->
<img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800" alt="제주 자연">
```

## 📝 이미지 교체 방법

### 방법 1: HTML 파일 직접 수정
1. index.html 열기
2. 104번째 줄: `<img src="images/hallasan.jpg"` 찾기
3. URL을 위의 무료 이미지 URL로 교체

### 방법 2: 로컬 이미지 다운로드
1. 위 사이트에서 이미지 다운로드
2. Z:\html\images\ 폴더에 저장
3. 파일명을 기존과 동일하게 저장 (hallasan.jpg, seongsan.jpg 등)

### 방법 3: CSS 배경 이미지 활용
```css
.place-image {
    background-image: url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800');
    background-size: cover;
    background-position: center;
}
```

## ⚠️ 주의사항

1. **이미지 최적화**: 웹용으로 800px 정도가 적당
2. **로딩 속도**: 너무 큰 이미지는 피하기
3. **저작권**: 제공된 무료 이미지만 사용
4. **alt 태그**: 접근성을 위해 반드시 포함

## 🎯 추천 작업 순서

1. 위의 무료 이미지 URL들을 먼저 테스트
2. 마음에 드는 이미지는 로컬에 다운로드
3. 모든 페이지의 이미지를 일관되게 교체
4. 반응형 이미지 최적화 적용
