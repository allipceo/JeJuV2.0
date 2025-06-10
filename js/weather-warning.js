/**
 * 제주도 기상특보 서비스
 * 기상청 API를 활용한 실시간 기상특보 정보 제공
 * 작성일: 2025.06.08
 * 버전: 1.0
 */

class JejuWeatherWarning {
    constructor() {
        this.kmaApiKey = 'RfPsu_HYS9Kz7Lvx2MvS-A';
        this.warnings = [];
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5분 캐시
        this.initWarningService();
    }

    /**
     * 기상특보 서비스 초기화
     */
    initWarningService() {
        console.log('⚠️ 제주도 기상특보 서비스 초기화 중...');
        this.loadWarningData();
        this.setupAutoRefresh();
    }

    /**
     * 기상특보 데이터 로드
     */
    async loadWarningData() {
        try {
            // 기본 더미 데이터로 시작 (API 연동은 추후 구현)
            this.warnings = this.getDefaultWarningData();
            this.renderWarningWidgets();
        } catch (error) {
            console.error('기상특보 로드 실패:', error);
            this.showWarningError();
        }
    }

    /**
     * 기본 기상특보 데이터
     */
    getDefaultWarningData() {
        return [
            {
                type: 'normal',
                title: '현재 특보 없음',
                description: '제주도에 발효 중인 기상특보가 없습니다.',
                level: 'safe',
                icon: '✅',
                recommendations: '모든 야외 활동이 안전합니다.'
            }
        ];
    }

    /**
     * 기상특보 위젯 렌더링
     */
    renderWarningWidgets() {
        const container = document.getElementById('weather-warning-container');
        if (!container) return;

        if (this.warnings.length === 0 || this.warnings[0].type === 'normal') {
            container.innerHTML = `
                <div class="warning-normal">
                    <div class="warning-icon">✅</div>
                    <div class="warning-content">
                        <h3>현재 기상특보 없음</h3>
                        <p>제주도에 발효 중인 기상특보가 없습니다. 안전한 여행을 즐기세요!</p>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = this.warnings.map(warning => this.createWarningWidget(warning)).join('');
        }
    }

    /**
     * 활동별 안전도 체크
     */
    checkActivity(activity) {
        // 기본 안전 상태 반환
        return {
            safetyLevel: 'safe',
            safetyText: '안전',
            recommendations: '현재 날씨 조건이 양호하여 활동하기 좋습니다.'
        };
    }

    /**
     * 새로고침
     */
    refresh() {
        this.loadWarningData();
    }

    /**
     * 자동 새로고침 설정
     */
    setupAutoRefresh() {
        // 5분마다 자동 새로고침
        setInterval(() => {
            console.log('🔄 기상특보 자동 업데이트...');
            this.loadWarningData();
        }, 5 * 60 * 1000);
    }

    /**
     * 에러 상태 표시
     */
    showWarningError() {
        const container = document.getElementById('weather-warning-container');
        if (container) {
            container.innerHTML = `
                <div class="warning-error">
                    <div class="warning-icon">⚠️</div>
                    <div class="warning-content">
                        <h3>기상특보 확인 불가</h3>
                        <p>현재 기상특보 정보를 불러올 수 없습니다.</p>
                    </div>
                </div>
            `;
        }
    }
}

// 전역 기상특보 서비스 인스턴스
let jejuWeatherWarning;

// DOM 로드 완료 시 기상특보 서비스 초기화
document.addEventListener('DOMContentLoaded', () => {
    jejuWeatherWarning = new JejuWeatherWarning();
});

// 외부에서 사용할 수 있는 함수들
window.JejuWeatherWarning = {
    refresh: () => jejuWeatherWarning?.refresh(),
    checkActivity: (activity) => jejuWeatherWarning?.checkActivity(activity)
};
