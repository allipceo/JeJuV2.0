# 신규 프로젝트 개발환경 설정 가이드

**작성일**: 2025년 6월 7일  
**작성자**: 조대표 & 노팀장(Claude)  
**용도**: 업무자동화 및 신규 프로젝트 개발환경 구축  

---

## 📋 목차
1. [개발환경 개요](#개발환경-개요)
2. [사전 준비사항](#사전-준비사항)
3. [단계별 설정 가이드](#단계별-설정-가이드)
4. [프로젝트 시작 템플릿](#프로젝트-시작-템플릿)
5. [문제해결 가이드](#문제해결-가이드)
6. [환경 검증 체크리스트](#환경-검증-체크리스트)

---

## 📊 개발환경 개요

### 🎯 환경의 핵심 가치
- **실시간 개발**: 코드 편집 즉시 호스팅 반영
- **자동 형상관리**: 프로젝트 문서 자동 업데이트
- **통합 개발**: Claude Desktop + MCP를 통한 AI 협업
- **효율적 배포**: 별도 배포 과정 없이 실시간 반영

### 🏗️ 아키텍처 구조
```
Claude Desktop (AI 개발 파트너)
    ↓ MCP 통신
text-editor + terminal MCP
    ↓ 파일 I/O
Z 드라이브 (RAID/Network Drive)
    ↓ FTP 자동 동기화
웹 호스팅 서버 (dothome.co.kr)
    ↓ HTTP 서빙
브라우저 실시간 확인
```

---

## 🔧 사전 준비사항

### 1. 하드웨어/소프트웨어 요구사항
- **운영체제**: Windows 10/11
- **네트워크 드라이브**: Z 드라이브 (RAID/FTP 연결)
- **브라우저**: Chrome, Edge, Firefox 등 모던 브라우저
- **인터넷 연결**: 안정적인 broadband 연결

### 2. 필수 설치 프로그램
- **Node.js** (LTS 버전): https://nodejs.org
- **Python** (3.8+): https://www.python.org/downloads/
- **Git for Windows**: https://git-scm.com/download/win
- **Claude Desktop**: https://claude.ai/download

### 3. 웹 호스팅 계정
- **호스팅 업체**: 닷홈 (dothome.co.kr) 또는 유사 서비스
- **PHP 지원**: 버전 8.0 이상
- **MySQL 데이터베이스**: 사용 가능
- **FTP 접속**: 계정 정보 준비 필요

---

## 🚀 단계별 설정 가이드

### **1단계: 기본 프로그램 설치 (15분)**

#### 1-1. Node.js 설치
```bash
# 설치 확인
node --version
npm --version
```

#### 1-2. Python 설치
```bash
# 설치 확인
python --version
pip --version
```

#### 1-3. Git 설치
```bash
# 설치 확인
git --version
```

### **2단계: MCP 서버 설치 (10분)**

#### 2-1. 필수 MCP 패키지 설치
```bash
# 텍스트 에디터 MCP
npm install -g mcp-server-text-editor

# Playwright Stealth MCP
npm install -g @pvinis/playwright-stealth-mcp-server

# Playwright 브라우저
npm install -g playwright
npx playwright install

# Yarn 패키지 매니저
npm install -g yarn
```

#### 2-2. OpenAI 이미지 생성 MCP (선택사항)
```bash
git clone https://github.com/SureScaleAI/openai-gpt-image-mcp.git
cd openai-gpt-image-mcp
yarn install
yarn build
```

### **3단계: Claude Desktop 설정 (5분)**

#### 3-1. 설정 파일 위치
- **경로**: `%APPDATA%\Claude\claude_desktop_config.json`
- **접근**: Claude Desktop → 설정 → 개발자 → 설정편집

#### 3-2. 설정 파일 내용 (템플릿)
```json
{
  "mcpServers": {
    "playwright-stealth": {
      "command": "npx",
      "args": ["-y", "@pvinis/playwright-stealth-mcp-server"]
    },
    "terminal": {
      "command": "npx",
      "args": [
        "-y",
        "@dillip285/mcp-terminal"
      ],
      "config": {
        "allowedCommands": [
          "npm", "npx", "node", "git", "python", "pip",
          "curl", "http", "ls", "dir", "mysql"
        ],
        "defaultTimeout": 30000
      }
    },
    "googleSearch": {
      "command": "npx",
      "args": [
        "-y",
        "g-search-mcp"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "Z:\\\\[프로젝트폴더명]"
      ]
    },
    "text-editor": {
     "command": "npx",
     "args": ["mcp-server-text-editor"]
    },
    "openai-gpt-image-mcp": {
      "command": "node",
      "args": ["C:\\Users\\[사용자명]\\openai-gpt-image-mcp\\dist\\index.js"],
      "env": { "OPENAI_API_KEY": "[OpenAI_API_키]" }
    }
  },
  "mcpClient": {
    "enabled": true,
    "triggerKeywords": {
      "edit":   ["text-editor"],
      "write":  ["text-editor"],
      "append": ["text-editor"],
      "replace":["text-editor"],
      "read":   ["filesystem"],
      "list":   ["filesystem"],
      "search": ["filesystem"]
    }
  }
}
```

#### 3-3. 설정 변경 사항
1. **[프로젝트폴더명]**: 신규 프로젝트 폴더명으로 변경
2. **[사용자명]**: Windows 사용자 계정명으로 변경
3. **[OpenAI_API_키]**: OpenAI API 키로 변경 (선택사항)

### **4단계: 네트워크 드라이브 설정 (10분)**

#### 4-1. FTP 드라이브 연결
1. **내 컴퓨터** → **네트워크 드라이브 연결**
2. **드라이브 문자**: Z 선택
3. **폴더**: ftp://[호스팅_FTP_주소]
4. **인증 정보**: 호스팅 계정 정보 입력

#### 4-2. RAID 드라이브 설정 (대안)
- 기존 RAID 드라이브가 있는 경우 Z 드라이브로 매핑
- FTP 클라이언트를 통한 실시간 동기화 설정

---

## 📁 프로젝트 시작 템플릿

### **5단계: 새 프로젝트 폴더 구조 생성**

#### 5-1. 기본 폴더 구조
```
Z:\[프로젝트명]\
├── index.html          # 메인 페이지
├── README.md            # 프로젝트 설명서
├── css/
│   └── style.css        # 스타일시트
├── js/
│   └── script.js        # JavaScript
├── images/              # 이미지 폴더
├── pages/               # 서브페이지 폴더
├── docs/
│   ├── project_plan.md  # 프로젝트 계획서
│   └── api_guide.md     # API 가이드
└── config/
    └── database.php     # DB 연결 설정 (PHP 프로젝트시)
```

#### 5-2. 기본 파일 템플릿

**docs/project_plan.md** (필수)
```markdown
# [프로젝트명] 개발 프로젝트

## 📋 프로젝트 정보
- **프로젝트명**: [프로젝트명]
- **사이트 주소**: http://[도메인명]
- **시작일**: [시작일]
- **담당자**: 조대표
- **기술 지원**: Claude (노팀장)

## 🎯 프로젝트 목표
[프로젝트 목표 및 설명]

## 📊 진행 상황
### ✅ 완료된 작업
- 프로젝트 환경 설정 완료
- 기본 폴더 구조 생성

### 🔄 진행 중인 작업
- [진행 중인 작업 내용]

### 📋 예정된 작업
- [예정된 작업 내용]

---
**최종 업데이트**: [날짜]
**상태**: 개발 진행 중
```

**index.html** (기본 템플릿)
```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[프로젝트명]</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header>
        <h1>[프로젝트명]</h1>
    </header>
    
    <main>
        <section>
            <h2>프로젝트 개요</h2>
            <p>[프로젝트 설명]</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2025 조대표. All rights reserved.</p>
    </footer>
    
    <script src="js/script.js"></script>
</body>
</html>
```

---

## 🔍 환경 검증 체크리스트

### **6단계: 개발환경 테스트 (5분)**

#### 6-1. Claude Desktop MCP 확인
- [ ] Claude Desktop에서 MCP 도구들이 정상 표시되는가?
- [ ] text-editor, terminal, googleSearch 도구가 활성화되었는가?

#### 6-2. 파일 편집 테스트
```
Claude에게 요청: "Z 드라이브 [프로젝트폴더]의 파일 목록을 보여줘"
```
- [ ] terminal MCP로 폴더 목록 조회가 되는가?

```
Claude에게 요청: "index.html 파일을 열어서 제목을 '테스트 프로젝트'로 변경해줘"
```
- [ ] text-editor로 파일 편집이 되는가?

#### 6-3. 웹 호스팅 연동 확인
- [ ] 브라우저에서 http://[도메인] 접속이 되는가?
- [ ] 파일 수정 후 브라우저 새로고침시 변경사항이 반영되는가?

#### 6-4. 프로젝트 문서 업데이트 테스트
```
Claude에게 요청: "docs/project_plan.md 파일에 '환경설정 완료' 기록을 추가해줘"
```
- [ ] 프로젝트 문서가 실시간으로 업데이트 되는가?

---

## ⚠️ 문제해결 가이드

### 🔧 자주 발생하는 문제들

#### 문제 1: filesystem MCP 접근 불가
**증상**: "Access denied - path outside allowed directories" 에러
**해결책**: 
1. text-editor와 terminal MCP 위주로 작업 (추천)
2. 또는 Junction Point 생성:
```powershell
mkdir "C:\AllowedMCPPaths"
New-Item -ItemType Junction -Path "C:\AllowedMCPPaths\[프로젝트명]" -Target "Z:\[프로젝트명]"
```

#### 문제 2: Z 드라이브 연결 실패
**증상**: 네트워크 드라이브가 인식되지 않음
**해결책**:
1. FTP 연결 정보 재확인
2. 네트워크 연결 상태 점검
3. 호스팅 업체 서버 상태 확인

#### 문제 3: Claude Desktop MCP 미인식
**증상**: 설정한 MCP 도구들이 표시되지 않음
**해결책**:
1. Claude Desktop 완전 재시작 (시스템 트레이에서도 종료)
2. JSON 설정 파일 문법 검증
3. 관리자 권한으로 Claude Desktop 실행

#### 문제 4: OpenAI API 키 오류
**증상**: 이미지 생성 MCP 작동 안함
**해결책**:
1. OpenAI 플랫폼에서 API 키 재확인
2. 조직 인증 완료 여부 확인
3. 크레딧 잔액 확인

---

## 🎯 신규 프로젝트 시작 순서

### **Ready-to-Start 체크리스트**

#### Phase 1: 환경 준비 (15분)
1. [ ] 호스팅 계정 생성 및 FTP 정보 확보
2. [ ] Z 드라이브 네트워크 연결 설정
3. [ ] Claude Desktop 설정 파일 업데이트
4. [ ] Claude Desktop 재시작

#### Phase 2: 프로젝트 초기화 (10분)
1. [ ] Z 드라이브에 새 프로젝트 폴더 생성
2. [ ] 기본 폴더 구조 생성
3. [ ] 템플릿 파일들 복사/생성
4. [ ] 프로젝트 계획서 작성

#### Phase 3: 환경 검증 (5분)
1. [ ] Claude와 파일 편집 테스트
2. [ ] 웹 브라우저 접속 확인
3. [ ] 실시간 반영 테스트
4. [ ] 개발환경 완료!

---

## 🚀 개발 시작!

환경설정이 완료되면 Claude에게 다음과 같이 요청하세요:

```
"새 프로젝트 '[프로젝트명]' 개발을 시작합니다. 
프로젝트 계획서를 업데이트하고 기본 구조를 잡아주세요."
```

이제 **실시간 AI 협업 개발환경**에서 효율적이고 강력한 프로젝트 개발을 시작할 수 있습니다!

---

**문서 버전**: v1.0  
**최종 검증일**: 2025년 6월 7일  
**검증자**: 조대표 & Claude (노팀장)  
**다음 업데이트**: 업무자동화 프로젝트 시작시