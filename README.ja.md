# JuriSim ⚖️

[🇰🇷 韓国語版 README はこちら](README.md)

**RAG ベースの信頼度可視化・法律シミュレーション Web アプリケーション**

法律の専門家がいなくても、一般市民が自分の状況に類似した判例を検索し、AI による法律分析を**信頼度スコアとともに**受け取ることができる Web サービスです。

🔗 **デモ: [jurisim.site](https://jurisim.site)**

> チーム 4-Step | 鮮文大学校 コンピュータ工学科 総合プロジェクト (2026)

<!-- TODO: メイン画面のスクリーンショットを1〜2枚追加 (チャット画面 + 信頼度ゲージ)。例: docs/screenshot-main.png -->

---

## 主な機能

- **類似判例・法令の検索** — 入力された法律状況を、ファインチューニング済み Ko-SBERT の埋め込み + ChromaDB のベクトル検索によって関連する判例・法令と意味ベースでマッチングします
- **口語 → 法律用語の正規化** — 「バイト代をもらえてない」のような口語入力を、Gemini が「賃金を支払われていない事案」へ正規化し検索品質を向上させます
- **AI 法律分析** — 検索された判例・法令を根拠に、Gemini が7つのセクションで構成された構造化された分析回答を生成します
- **信頼度スコアの可視化** — 類似度・カテゴリ一致・カバレッジ・最新性の4指標を加重合算した信頼度スコアをゲージで表示し、スコアが低い場合は専門家への相談を推奨します
- **相談履歴の管理** — 会員ごとの相談履歴と、その際に使用された根拠判例・法令を順位とともに保存します
- **多言語対応 (i18n)** — 韓国語／英語のインターフェース切り替え

---

## 対象分野

労働 · 賃貸借 · 消費者 — 一般市民が最も多く直面する3大法律分野

---

## 技術スタック

| パート | 技術 |
| --- | --- |
| **フロントエンド** | React 19, Vite, React Router, Axios, react-i18next, styled-components, lucide-react |
| **バックエンド** | Python 3.11, FastAPI, SQLAlchemy 2.0, SQLite, JWT(python-jose), bcrypt, Uvicorn |
| **AI / ML** | Ko-SBERT ファインチューニング(sentence-transformers), ChromaDB, Google Gemini 2.5 Flash |
| **デプロイ** | AWS EC2, Nginx, ドメイン(jurisim.site) |

---

## システムアーキテクチャ

```
[ ユーザー ]
    │  カテゴリ選択 + 法律状況の入力
    ▼
[ フロントエンド (React + Vite) ]
    │  REST API 呼び出し (JWT 認証)
    ▼
[ バックエンド (FastAPI) ]
    │  認証 · リクエスト検証 · 履歴保存
    │  run_pipeline() の呼び出し
    ▼
[ AI パイプライン (ml/pipeline.py) ]
    │  入力検証 → キャッシュ参照 → 口語正規化(Gemini) →
    │  判例・法令のベクトル検索 → 信頼度算出 → 回答生成(Gemini)
    ├──▶ [ ChromaDB ]  判例・法令のベクトル検索
    └──▶ [ Gemini ]    口語の正規化 + 法律回答の生成
    ▼
[ SQLite ]  会員 · 相談履歴 · 根拠スナップショットの保存
```

処理フロー: ユーザーが分野を選び状況を入力すると、フロントエンドがバックエンド API を呼び出します。バックエンドは認証・検証の後に AI パイプラインを実行して類似判例・法令を検索し、Gemini が分析回答を生成して信頼度スコアとともに返します。結果は SQLite に相談履歴として保存されます。

---

## プロジェクト構成

```
legal_project/
├── backend/                # FastAPI バックエンド
│   ├── main.py             # アプリのエントリーポイント (CORS, 例外処理, ルーター登録)
│   ├── database.py         # DB エンジン・セッション (get_db)
│   ├── models.py           # SQLAlchemy ORM テーブル
│   ├── schemas.py          # Pydantic 入出力スキーマ
│   ├── core/security.py    # JWT 発行・検証, 認証
│   ├── routers/            # ドメイン別エンドポイント (auth, users, legal, chat, history)
│   ├── ml/pipeline.py      # RAG パイプライン (AI/ML パート)
│   └── requirements.txt
├── src/                    # React フロントエンド
│   ├── components/         # ChatSection, DashboardSection, MyPage, LoginPage など
│   ├── api.js              # API 通信 (Axios)
│   └── i18n.js             # 多言語リソース
└── README.md
```

---

## はじめに

### 前提条件
- Python 3.11+
- Node.js 18+
- Google Gemini API キー

### 1. リポジトリのクローン
```bash
git clone https://github.com/harrypotterplan/legal_project.git
cd legal_project
```

### 2. バックエンドの起動
```bash
cd backend

# (推奨) 仮想環境
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 環境変数の設定 (.env を作成 — 下記「環境変数」を参照)

# サーバー起動
uvicorn main:app --reload
```
起動後、`http://127.0.0.1:8000/docs` で API ドキュメントを確認できます。

> ⚠️ 判例・法令の検索には、ファインチューニング済みの埋め込みモデル(`jurisim-sbert-v4`)と ChromaDB インデックスが必要です。容量の都合でリポジトリには含まれていないため別途配置する必要があり、ない場合はベースの Ko-SBERT モデルにフォールバックします。(AI/ML パートの成果物)

### 3. フロントエンドの起動
```bash
# プロジェクトのルートで
npm install
npm run dev
```

---

## 環境変数 (`backend/.env`)

```env
# AI (必須)
GEMINI_API_KEY=取得した_Gemini_API_キー

# JWT 認証
SECRET_KEY=十分に長いランダムな文字列
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# データベース
DATABASE_URL=sqlite:///./legal.db
```

| 変数 | 説明 |
| --- | --- |
| `GEMINI_API_KEY` | **必須。** 回答生成・正規化用の Gemini キー。未設定の場合パイプラインが停止します。 |
| `SECRET_KEY` | JWT 署名キー。本番環境では必ず明示的に設定します。 |
| `ALGORITHM` | JWT アルゴリズム (デフォルト `HS256`)。 |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | アクセストークンの有効期限(分, デフォルト 30)。 |
| `REFRESH_TOKEN_EXPIRE_DAYS` | リフレッシュトークンの有効期限(日, デフォルト 7)。 |
| `DATABASE_URL` | DB 接続先 (デフォルトはローカル SQLite)。 |

> `.env` は `.gitignore` に含まれており、実際のキー値はコミットしません。

---

## AI モデル · データ

意味ベース検索には、韓国語の法律テキストに合わせてファインチューニングした埋め込みモデルを使用しています。

**埋め込みモデル — `jurisim-sbert-v4`**
- ベースモデル: `snunlp/KR-SBERT-V40K-klueNLI-augSTS`
- 学習方式: Triplet Loss (同一事件のチャンクは近く、異なる分野のチャンクは遠くなるように学習)
- ファインチューニング精度: 4.8% (ベースライン) → **76.2%** (accuracy_cosine)

**ベクトルデータベース (ChromaDB)**

| 区分 | コレクション | 保存量 |
| --- | --- | --- |
| 判例 | `jurisim_cases` | 約 28,625 チャンク (判例 11,373 件) |
| 法令 | `jurisim_laws` | 857 条文 |

判例・法令は、韓国の国家法令情報 API、HuggingFace、AI Hub などから収集・統合・前処理したデータを埋め込んで構築しました。労働・賃貸借・消費者の3分野を網羅しています。

> 上記の数値は最終報告書・論文時点のものであり、AI/ML パートの最新の成果物と異なる場合は更新が必要です。

---

## チーム構成

| 氏名 | パート | 役割 |
| --- | --- | --- |
| 정의준 | AI/ML (リーダー) | データパイプライン, Ko-SBERT ファインチューニング, RAG パイプライン, サーバーデプロイ |
| 박은우 | AI/ML | データ収集・前処理, ChromaDB 構築, 信頼度式の設計 |
| 이승범 | バックエンド | FastAPI サーバー, SQLite DB 設計, JWT 認証, AI エンジン連携 |
| 오원우 | フロントエンド | React SPA, チャット UI, ダッシュボード, i18n |
