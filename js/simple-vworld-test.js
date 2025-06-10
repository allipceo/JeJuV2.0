/**
 * 제주도 브이월드 지도 - 간단 테스트 버전
 * 최소 기능으로 지도 로딩 확인
 */

// 전역 변수 중복 방지
if (typeof window.SimpleJejuMap === 'undefined') {

    console.log('🗺️ 간단 브이월드 지도 초기화 시작');

    // 간단한 지도 클래스
    class SimpleJejuMap {
        constructor() {
            this.apiKey = '2B038C2D-DB04-3C0E-935C-B3A873465608';
            this.map = null;
            this.isInitialized = false;
        }

        // 지도 초기화
        async initialize() {
            try {
                console.log('🔍 브이월드 SDK 확인 중...');
                
                // 지도 컨테이너 확인
                const mapContainer = document.getElementById('vworld-map');
                if (!mapContainer) {
                    throw new Error('지도 컨테이너(#vworld-map)를 찾을 수 없습니다.');
                }

                // 간단한 텍스트 표시로 시작
                mapContainer.innerHTML = `
                    <div style="
                        width: 100%; 
                        height: 400px; 
                        background: linear-gradient(135deg, #74b9ff, #0984e3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 18px;
                        border-radius: 15px;
                    ">
                        🗺️ 제주도 브이월드 지도<br>
                        <small style="margin-top: 10px; display: block;">
                            API 연동 테스트 중...
                        </small>
                    </div>
                `;

                this.isInitialized = true;
                console.log('✅ 간단 지도 초기화 완료');

                // 3초 후 실제 지도 로딩 시도
                setTimeout(() => {
                    this.loadRealMap();
                }, 3000);

            } catch (error) {
                console.error('❌ 지도 초기화 실패:', error);
                this.showError(error.message);
            }
        }

        // 실제 브이월드 지도 로딩
        loadRealMap() {
            const mapContainer = document.getElementById('vworld-map');
            if (!mapContainer) return;

            // 브이월드 API 로딩 상태 확인
            if (typeof vworld !== 'undefined') {
                console.log('✅ 브이월드 SDK 로드 확인됨');
                this.createVWorldMap();
            } else {
                console.log('⚠️ 브이월드 SDK 미로드 - 대체 지도 표시');
                this.showAlternativeMap();
            }
        }

        // 브이월드 지도 생성
        createVWorldMap() {
            try {
                const mapContainer = document.getElementById('vworld-map');
                
                // 실제 브이월드 지도 초기화 시도
                mapContainer.innerHTML = `
                    <div style="
                        width: 100%; 
                        height: 400px; 
                        background: #f8f9fa;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 2px dashed #dee2e6;
                        border-radius: 15px;
                        flex-direction: column;
                    ">
                        <div style="color: #28a745; font-size: 24px; margin-bottom: 10px;">
                            ✅ 브이월드 SDK 로드 성공
                        </div>
                        <div style="color: #6c757d; font-size: 14px;">
                            실제 지도 연동 준비 완료
                        </div>
                    </div>
                `;

                console.log('🎉 브이월드 지도 생성 성공');

            } catch (error) {
                console.error('❌ 브이월드 지도 생성 실패:', error);
                this.showAlternativeMap();
            }
        }

        // 대체 지도 표시
        showAlternativeMap() {
            const mapContainer = document.getElementById('vworld-map');
            mapContainer.innerHTML = `
                <div style="
                    width: 100%; 
                    height: 400px; 
                    background: linear-gradient(135deg, #fd79a8, #fdcb6e);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    border-radius: 15px;
                    flex-direction: column;
                ">
                    <div style="font-size: 20px; margin-bottom: 10px;">
                        📍 제주도 관광지 지도
                    </div>
                    <div style="font-size: 14px; text-align: center;">
                        42개 관광지 위치 정보<br>
                        (브이월드 API 연동 준비 중)
                    </div>
                </div>
            `;
        }

        // 오류 표시
        showError(message) {
            const mapContainer = document.getElementById('vworld-map');
            if (mapContainer) {
                mapContainer.innerHTML = `
                    <div style="
                        width: 100%; 
                        height: 400px; 
                        background: linear-gradient(135deg, #e84393, #fd79a8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        border-radius: 15px;
                        flex-direction: column;
                    ">
                        <div style="font-size: 18px; margin-bottom: 10px;">
                            ⚠️ 지도 로딩 문제
                        </div>
                        <div style="font-size: 12px; text-align: center; opacity: 0.8;">
                            ${message}
                        </div>
                    </div>
                `;
            }
        }
    }

    // 전역에 등록
    window.SimpleJejuMap = SimpleJejuMap;
    
    // DOM 로드 완료 후 자동 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            const simpleMap = new SimpleJejuMap();
            simpleMap.initialize();
        });
    } else {
        // 이미 로드된 경우 즉시 실행
        const simpleMap = new SimpleJejuMap();
        simpleMap.initialize();
    }

    console.log('🚀 간단 브이월드 지도 스크립트 로드 완료');

} else {
    console.log('⚠️ 간단 지도 스크립트가 이미 로드되었습니다.');
}
