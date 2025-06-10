/**
 * 제주도 여행 가이드 JavaScript V2.0
 * @author 서대리
 * @version 2.0.0
 */

// 유틸리티 함수
const utils = {
    /**
     * 디바운스 함수
     * @param {Function} func - 실행할 함수
     * @param {number} wait - 대기 시간
     * @returns {Function} 디바운스된 함수
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 요소 생성 헬퍼
     * @param {string} tag - HTML 태그
     * @param {Object} attributes - 속성 객체
     * @param {string|Node} content - 내용
     * @returns {HTMLElement} 생성된 요소
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        if (content) {
            element.textContent = content;
        }
        return element;
    }
};

// 알림 시스템
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = utils.createElement('div', {
            className: 'notification-container',
            style: 'position: fixed; top: 20px; right: 20px; z-index: 10000;'
        });
        document.body.appendChild(this.container);
    }

    /**
     * 알림 표시
     * @param {string} message - 알림 메시지
     * @param {string} type - 알림 타입 (info|success|error)
     */
    show(message, type = 'info') {
        const notification = utils.createElement('div', {
            className: `notification ${type}`,
            style: `
                padding: 15px 20px;
                background: ${this.getBackgroundColor(type)};
                color: white;
                border-radius: 5px;
                margin-bottom: 10px;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            `
        }, message);

        this.container.appendChild(notification);

        // 애니메이션
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // 자동 제거
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getBackgroundColor(type) {
        const colors = {
            error: '#e74c3c',
            success: '#27ae60',
            info: '#3498db'
        };
        return colors[type] || colors.info;
    }
}

// 네비게이션 관리
class NavigationManager {
    constructor() {
        this.header = document.querySelector('.header');
        this.hamburger = document.querySelector('.hamburger');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.lastScrollTop = 0;
        
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollHandler();
        this.setupSmoothScroll();
    }

    setupMobileMenu() {
        if (this.hamburger && this.navMenu) {
            this.hamburger.addEventListener('click', () => {
                this.hamburger.classList.toggle('active');
                this.navMenu.classList.toggle('active');
            });

            this.navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (this.navMenu.classList.contains('active')) {
                        this.hamburger.classList.remove('active');
                        this.navMenu.classList.remove('active');
                    }
                });
            });
        }
    }

    setupScrollHandler() {
        const handleScroll = utils.debounce(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
                this.header.style.background = 'rgba(255, 255, 255, 0.98)';
                this.header.style.backdropFilter = 'blur(15px)';
        } else {
                this.header.style.background = 'rgba(255, 255, 255, 0.95)';
                this.header.style.backdropFilter = 'blur(10px)';
            }
            
            this.lastScrollTop = scrollTop;
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    setupSmoothScroll() {
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    smoothScrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                    const headerHeight = this.header.offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    }
}

// 애니메이션 관리
class AnimationManager {
    constructor() {
        this.observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupLazyLoading();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
        }, this.observerOptions);
    
    const animatedElements = document.querySelectorAll('.category-card, .place-card, .tip-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    }
    
    setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }
}

// 폼 관리
class FormManager {
    constructor() {
        this.notification = new NotificationSystem();
        this.init();
    }

    init() {
        this.setupFormValidation();
    }

    setupFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                try {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                        this.notification.show('필수 항목을 모두 입력해주세요.', 'error');
                    }
                } catch (error) {
                    console.error('폼 유효성 검사 중 오류 발생:', error);
                    this.notification.show('폼 처리 중 오류가 발생했습니다.', 'error');
            }
        });
    });
    }
}

// 앱 초기화
class App {
    constructor() {
        this.notification = new NotificationSystem();
        this.navigation = new NavigationManager();
        this.animation = new AnimationManager();
        this.form = new FormManager();
        
        this.init();
    }

    init() {
        try {
            // 페이지 로드 완료 처리
            window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
});

            // 전역 에러 핸들링
            window.addEventListener('error', (e) => {
    console.error('JavaScript 오류:', e.error);
                this.notification.show('오류가 발생했습니다. 페이지를 새로고침해주세요.', 'error');
});

// 리사이즈 이벤트 최적화
            window.addEventListener('resize', utils.debounce(() => {
        console.log('화면 크기 변경 완료');
            }, 250));

            // 환영 메시지
            console.log('🏝️ 제주도 여행 가이드에 오신 것을 환영합니다!');
            console.log('✨ 아름다운 제주도의 모든 것을 만나보세요.');

        } catch (error) {
            console.error('앱 초기화 중 오류 발생:', error);
            this.notification.show('앱 초기화 중 오류가 발생했습니다.', 'error');
        }
    }
}

// DOM 로드 완료 후 앱 실행
document.addEventListener('DOMContentLoaded', () => {
    new App();
});