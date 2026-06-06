# JuriSim ⚖️

[🇯🇵 日本語版 README はこちら](README.ja.md)

**RAG 기반 신뢰도 시각화 법률 시뮬레이션 웹 애플리케이션**

법률 전문가 없이도 일반 시민이 자신의 상황과 유사한 판례를 검색하고, AI 기반 법률 분석을 **신뢰도 점수와 함께** 제공받을 수 있는 웹 서비스입니다.

🔗 **데모: [jurisim.site](https://jurisim.site)**

> 팀 4-Step | 선문대학교 컴퓨터공학과 종합프로젝트 (2026)

<!-- TODO: 메인 스크린샷 1~2장 추가 (채팅 화면 + 신뢰도 게이지). 예: docs/screenshot-main.png -->

---

## 주요 기능

- **유사 판례·법령 검색** — 입력한 법률 상황을 파인튜닝 Ko-SBERT 임베딩 + ChromaDB 벡터 검색으로 관련 판례·법령과 의미 기반 매칭
- **구어체→법률 용어 정규화** — "알바비 못 받았어" 같은 구어체 입력을 Gemini가 "임금을 지급받지 못한 사안"으로 정규화해 검색 품질 향상
- **AI 법률 분석** — 검색된 판례·법령을 근거로 Gemini가 7개 섹션의 구조화된 분석 답변 생성
- **신뢰도 점수 시각화** — 유사도·카테고리 일치·커버리지·최신성 4개 지표를 가중합한 신뢰도 점수를 게이지로 표시하고, 점수가 낮으면 전문가 상담을 권고
- **상담 기록 관리** — 회원별 상담 이력과 그때 사용된 근거 판례·법령을 순위와 함께 보존
- **다국어 지원(i18n)** — 한국어/영어 인터페이스 전환

---

## 대상 분야

근로 · 임대차 · 소비자 — 일반 시민이 가장 많이 겪는 3대 법률 분야

---

## 기술 스택

| 파트 | 기술 |
| --- | --- |
| **Frontend** | React 19, Vite, React Router, Axios, react-i18next, styled-components, lucide-react |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2.0, SQLite, JWT(python-jose), bcrypt, Uvicorn |
| **AI / ML** | Ko-SBERT 파인튜닝(sentence-transformers), ChromaDB, Google Gemini 2.5 Flash |
| **배포** | AWS EC2, Nginx, 도메인(jurisim.site) |

---

## 시스템 아키텍처

```
[ 사용자 ]
    │  카테고리 선택 + 법률 상황 입력
    ▼
[ Frontend (React + Vite) ]
    │  REST API 호출 (JWT 인증)
    ▼
[ Backend (FastAPI) ]
    │  인증 · 요청 검증 · 기록 저장
    │  run_pipeline() 호출
    ▼
[ AI Pipeline (ml/pipeline.py) ]
    │  입력 검증 → 캐시 조회 → 구어체 정규화(Gemini) →
    │  판례·법령 벡터 검색 → 신뢰도 산출 → 답변 생성(Gemini)
    ├──▶ [ ChromaDB ]  판례·법령 벡터 검색
    └──▶ [ Gemini ]    구어체 정규화 + 법률 답변 생성
    ▼
[ SQLite ]  회원 · 상담 기록 · 근거 스냅샷 저장
```

요청 흐름: 사용자가 분야를 고르고 상황을 입력하면, 프론트엔드가 백엔드 API를 호출한다. 백엔드는 인증·검증 후 AI 파이프라인을 실행해 유사 판례·법령을 검색하고, Gemini가 분석 답변을 생성하여 신뢰도 점수와 함께 반환한다. 결과는 SQLite에 상담 기록으로 저장된다.

---

## 프로젝트 구조

```
legal_project/
├── backend/                # FastAPI 백엔드
│   ├── main.py             # 앱 진입점 (CORS, 예외 처리, 라우터 등록)
│   ├── database.py         # DB 엔진·세션 (get_db)
│   ├── models.py           # SQLAlchemy ORM 테이블
│   ├── schemas.py          # Pydantic 입출력 스키마
│   ├── core/security.py    # JWT 발급·검증, 인증
│   ├── routers/            # 도메인별 엔드포인트 (auth, users, legal, chat, history)
│   ├── ml/pipeline.py      # RAG 파이프라인 (AI/ML 파트)
│   └── requirements.txt
├── src/                    # React 프론트엔드
│   ├── components/         # ChatSection, DashboardSection, MyPage, LoginPage 등
│   ├── api.js              # API 통신 (Axios)
│   └── i18n.js             # 다국어 리소스
└── README.md
```

---

## 시작하기

### 사전 요구사항
- Python 3.11+
- Node.js 18+
- Google Gemini API 키

### 1. 저장소 클론
```bash
git clone https://github.com/harrypotterplan/legal_project.git
cd legal_project
```

### 2. 백엔드 실행
```bash
cd backend

# (권장) 가상환경
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정 (.env 작성 — 아래 '환경변수' 참고)

# 서버 실행
uvicorn main:app --reload
```
실행 후 `http://127.0.0.1:8000/docs` 에서 API 문서를 확인할 수 있다.

> ⚠️ 판례·법령 검색에는 파인튜닝 임베딩 모델(`jurisim-sbert-v4`)과 ChromaDB 인덱스가 필요하다. 용량 문제로 저장소에 포함되지 않으므로 별도 배치해야 하며, 없을 경우 기본 Ko-SBERT 모델로 폴백된다. (AI/ML 파트 산출물)

### 3. 프론트엔드 실행
```bash
# 프로젝트 루트에서
npm install
npm run dev
```

---

## 환경변수 (`backend/.env`)

```env
# AI (필수)
GEMINI_API_KEY=발급받은_Gemini_API_키

# JWT 인증
SECRET_KEY=충분히_긴_무작위_문자열
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# 데이터베이스
DATABASE_URL=sqlite:///./legal.db
```

| 변수 | 설명 |
| --- | --- |
| `GEMINI_API_KEY` | **필수.** 답변 생성·정규화용 Gemini 키. 미설정 시 파이프라인이 중단된다. |
| `SECRET_KEY` | JWT 서명 키. 운영 환경에서는 반드시 직접 설정. |
| `ALGORITHM` | JWT 알고리즘 (기본 `HS256`). |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access 토큰 만료(분, 기본 30). |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh 토큰 만료(일, 기본 7). |
| `DATABASE_URL` | DB 접속 주소 (기본 로컬 SQLite). |

> `.env`는 `.gitignore`에 포함되어 있으며, 실제 키 값은 커밋하지 않는다.

---

## AI 모델 · 데이터

의미 기반 검색은 한국어 법률 텍스트에 맞게 파인튜닝한 임베딩 모델을 사용한다.

**임베딩 모델 — `jurisim-sbert-v4`**
- 기반 모델: `snunlp/KR-SBERT-V40K-klueNLI-augSTS`
- 학습 방식: Triplet Loss (동일 사건 청크는 가깝게, 다른 분야 청크는 멀게)
- 파인튜닝 정확도: 4.8% (베이스라인) → **76.2%** (accuracy_cosine)

**벡터 데이터베이스 (ChromaDB)**

| 구분 | 컬렉션 | 저장량 |
| --- | --- | --- |
| 판례 | `jurisim_cases` | 약 28,625개 청크 (11,373건 판례) |
| 법령 | `jurisim_laws` | 857개 조문 |

판례·법령은 국가법령정보 API, HuggingFace, AI Hub 등에서 수집·병합·전처리한 데이터를 임베딩해 구축했다. 근로·임대차·소비자 3개 분야를 포괄한다.

> 위 수치는 최종 보고서·논문 기준이며, AI/ML 파트의 최신 산출물과 다를 경우 갱신이 필요하다.

---

## 팀 구성

| 이름 | 파트 | 역할 |
| --- | --- | --- |
| 정의준 | AI/ML (팀장) | 데이터 파이프라인, Ko-SBERT 파인튜닝, RAG 파이프라인, 서버 배포 |
| 박은우 | AI/ML | 데이터 수집·전처리, ChromaDB 구축, 신뢰도 공식 설계 |
| 이승범 | Backend | FastAPI 서버, SQLite DB 설계, JWT 인증, AI 엔진 연동 |
| 오원우 | Frontend | React SPA, 챗봇 UI, 대시보드, i18n |
