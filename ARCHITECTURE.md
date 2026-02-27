# COSINT Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                   COSINT PLATFORM                                   │
│                         Civic Open Source Intelligence Tool                          │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                        FRONTEND  (Next.js 16 / React 19)                    │    │
│   │                          TypeScript + Tailwind CSS 4                         │    │
│   │                                                                             │    │
│   │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐   │    │
│   │  │  Dashboard   │  │   Member     │  │     Bill      │  │    Login     │   │    │
│   │  │   Client     │  │  Dashboard   │  │   Dashboard   │  │    Page      │   │    │
│   │  │  (Home)      │  │ /member/[id] │  │ /bill/[...]   │  │   (OAuth)    │   │    │
│   │  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  └──────┬───────┘   │    │
│   │         │                 │                   │                  │           │    │
│   │  ┌──────┴─────────────────┴───────────────────┴──────────────────┘          │    │
│   │  │                                                                          │    │
│   │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │    │
│   │  │  │     Chat     │  │   Sidebar    │  │    Header    │                   │    │
│   │  │  │  (Streaming) │  │  (Drag/Drop) │  │  (Auth/Nav)  │                   │    │
│   │  │  │              │  │              │  │              │                   │    │
│   │  │  │ • SSE Stream │  │ • Sessions   │  │ • User Info  │                   │    │
│   │  │  │ • Intel Pkts │  │ • Bills      │  │ • Logout     │                   │    │
│   │  │  │ • Actions    │  │ • Reorder    │  │              │                   │    │
│   │  │  └──────────────┘  └──────────────┘  └──────────────┘                   │    │
│   │  │                                                                          │    │
│   │  └──────────────────────────────────────────────────────────────────────────┘    │
│   │                                                                             │    │
│   │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│   │  │                    Supabase Client SDK                              │    │    │
│   │  │          @supabase/supabase-js  +  @supabase/ssr                   │    │    │
│   │  │    (Client-side auth, Server-side auth, Session management)         │    │    │
│   │  └─────────────────────────────────────────────────────────────────────┘    │    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
│          │  SSE (Server-Sent Events)          │  REST API            │  OAuth        │
│          │  POST /chat/stream                 │  GET/POST/PATCH/DEL  │  Redirect     │
│          ▼                                    ▼                      ▼               │
│                                                                                      │
│   ┌─────────────────────────────────────────────────────────────────────────────┐    │
│   │                        BACKEND  (FastAPI + Uvicorn)                         │    │
│   │                              Python 3.x                                     │    │
│   │                                                                             │    │
│   │  ┌─────────────────────────────────────────────────────────────────────┐    │    │
│   │  │                        API ROUTERS                                  │    │    │
│   │  │                                                                     │    │    │
│   │  │  ┌──────────────────┐ ┌──────────────────┐ ┌────────────────────┐  │    │    │
│   │  │  │   Chat Router    │ │ Intelligence Rtr  │ │  Notebook Router   │  │    │    │
│   │  │  │                  │ │                    │ │                    │  │    │    │
│   │  │  │ POST /chat/stream│ │ GET /member/{id}   │ │ CRUD Conversations│  │    │    │
│   │  │  │ • Stream resp.   │ │ GET /bill/{...}    │ │ CRUD Tracked Bills│  │    │    │
│   │  │  │ • Save messages  │ │ • Member details   │ │ CRUD Research Note│  │    │    │
│   │  │  │ • Intel extract  │ │ • Bill analysis    │ │ PUT /order        │  │    │    │
│   │  │  │ • Auto-track     │ │ • Vote records     │ │                    │  │    │    │
│   │  │  └────────┬─────────┘ └────────┬───────────┘ └────────┬───────────┘  │    │    │
│   │  └───────────┼────────────────────┼────────────────────────┼─────────────┘    │    │
│   │              │                    │                        │                   │    │
│   │  ┌───────────┴────────────────────┴────────────────────────┘                  │    │
│   │  │                                                                            │    │
│   │  │  ┌─────────────────────────────────────────────────────────────────────┐   │    │
│   │  │  │                    AUTH MIDDLEWARE                                   │   │    │
│   │  │  │            JWT Verification (ES256 / HS256)                         │   │    │
│   │  │  │          Supabase JWKS  →  get_current_user()                       │   │    │
│   │  │  └─────────────────────────────────────────────────────────────────────┘   │    │
│   │  │                                                                            │    │
│   │  │  ┌─────────────────────────────────────────────────────────────────────┐   │    │
│   │  │  │                     SERVICES LAYER                                  │   │    │
│   │  │  │                                                                     │   │    │
│   │  │  │  ┌───────────────────────────────────────────────────────────────┐  │   │    │
│   │  │  │  │              COSINT AGENT SYSTEM (LangChain)                  │  │   │    │
│   │  │  │  │                                                               │  │   │    │
│   │  │  │  │  ┌─────────────────────────────────────────────────────────┐  │  │   │    │
│   │  │  │  │  │              Main Research Agent (GPT-4o-mini)          │  │  │   │    │
│   │  │  │  │  │           LangChain OpenAI Tools Agent Framework       │  │  │   │    │
│   │  │  │  │  │                                                         │  │  │   │    │
│   │  │  │  │  │  TOOLS:                                                 │  │  │   │    │
│   │  │  │  │  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │  │  │   │    │
│   │  │  │  │  │  │ MemberSearch │ │ MemberState  │ │ MemberDetails  │  │  │  │   │    │
│   │  │  │  │  │  │    Tool      │ │  SearchTool  │ │    Tool        │  │  │  │   │    │
│   │  │  │  │  │  └──────────────┘ └──────────────┘ └────────────────┘  │  │  │   │    │
│   │  │  │  │  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │  │  │   │    │
│   │  │  │  │  │  │  Member      │ │ Member       │ │ MemberVotes    │  │  │  │   │    │
│   │  │  │  │  │  │ Legislation  │ │ Committees   │ │    Tool        │  │  │  │   │    │
│   │  │  │  │  │  └──────────────┘ └──────────────┘ └────────────────┘  │  │  │   │    │
│   │  │  │  │  │  ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │  │  │   │    │
│   │  │  │  │  │  │ GoogleCivic  │ │ BraveSearch  │ │ SummarizeBill  │  │  │  │   │    │
│   │  │  │  │  │  │    Tool      │ │    Tool      │ │    Tool        │  │  │  │   │    │
│   │  │  │  │  │  └──────────────┘ └──────────────┘ └────────────────┘  │  │  │   │    │
│   │  │  │  │  └─────────────────────────────────────────────────────────┘  │  │   │    │
│   │  │  │  │                                                               │  │   │    │
│   │  │  │  │  ┌──────────────────────────┐  ┌──────────────────────────┐  │  │   │    │
│   │  │  │  │  │ Intel Extraction Agent   │  │  Bill Analysis Agent     │  │  │   │    │
│   │  │  │  │  │     (GPT-4o-mini)        │  │      (GPT-4o)           │  │  │   │    │
│   │  │  │  │  │ Extracts key facts for   │  │ Plain English bill      │  │  │   │    │
│   │  │  │  │  │ research notebook        │  │ summaries               │  │  │   │    │
│   │  │  │  │  └──────────────────────────┘  └──────────────────────────┘  │  │   │    │
│   │  │  │  └───────────────────────────────────────────────────────────────┘  │   │    │
│   │  │  │                                                                     │   │    │
│   │  │  │  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐  │   │    │
│   │  │  │  │ Congress API   │  │ Google Civic   │  │  Brave Search       │  │   │    │
│   │  │  │  │   Client       │  │   Client       │  │    Client           │  │   │    │
│   │  │  │  │                │  │                │  │                      │  │   │    │
│   │  │  │  │ • Members      │  │ • District     │  │  • Web search       │  │   │    │
│   │  │  │  │ • Bills        │  │   lookup       │  │  • 5 results/query  │  │   │    │
│   │  │  │  │ • Votes        │  │ • State/dist   │  │                      │  │   │    │
│   │  │  │  │ • Committees   │  │   extraction   │  │                      │  │   │    │
│   │  │  │  │ • Bill Text    │  │                │  │                      │  │   │    │
│   │  │  │  └────────┬───────┘  └───────┬────────┘  └──────────┬───────────┘  │   │    │
│   │  │  │           │                  │                       │              │   │    │
│   │  │  │  ┌────────┴──────────────────┴───────────────────────┘              │   │    │
│   │  │  │  │                                                                  │   │    │
│   │  │  │  │  ┌──────────────────────────────────────────────────────────┐    │   │    │
│   │  │  │  │  │                  CACHE SERVICE (DiskCache)               │    │   │    │
│   │  │  │  │  │         @api_cache(expire=86400)  ─  24hr TTL           │    │   │    │
│   │  │  │  │  │              MD5 hash keys  ─  .cache/ dir              │    │   │    │
│   │  │  │  │  └──────────────────────────────────────────────────────────┘    │   │    │
│   │  │  │  │                                                                  │   │    │
│   │  │  └──┼──────────────────────────────────────────────────────────────────┘   │    │
│   │  │     │                                                                      │    │
│   │  │  ┌──┴──────────────────────────────────────────────────────────────────┐   │    │
│   │  │  │                   DATABASE LAYER (SQLAlchemy + Alembic)             │   │    │
│   │  │  │                                                                     │   │    │
│   │  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐  │   │    │
│   │  │  │  │conversations │ │   messages   │ │ tracked  │ │  research    │  │   │    │
│   │  │  │  │              │ │              │ │  _bills   │ │   _notes     │  │   │    │
│   │  │  │  │ • id (UUID)  │ │ • id (UUID)  │ │ • id     │ │ • id (UUID)  │  │   │    │
│   │  │  │  │ • user_id    │ │ • conv_id FK │ │ • user_id│ │ • user_id    │  │   │    │
│   │  │  │  │ • title      │─┤ • role       │ │ • bill_id│ │ • bioguide_id│  │   │    │
│   │  │  │  │ • bioguide_id│ │ • content    │ │ • title  │ │ • title      │  │   │    │
│   │  │  │  │ • position   │ │ • created_at │ │ • pos.   │ │ • content    │  │   │    │
│   │  │  │  └──────────────┘ └──────────────┘ └──────────┘ └──────────────┘  │   │    │
│   │  │  └─────────────────────────────────────────────────────────────────────┘   │    │
│   │  └────────────────────────────────────────────────────────────────────────────┘    │
│   └─────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘


                              EXTERNAL SERVICES
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                   │
│  │   Congress.gov   │  │  Google Civic    │  │   Brave Search   │                   │
│  │      API v3      │  │   Info API v2    │  │       API        │                   │
│  │                  │  │                  │  │                  │                   │
│  │ api.congress.gov │  │ googleapis.com/  │  │ api.search.brave │                   │
│  │                  │  │ civicinfo/v2     │  │ .com/res/v1      │                   │
│  │ • Members        │  │                  │  │                  │                   │
│  │ • Bills          │  │ • Divisions by   │  │ • Web search     │                   │
│  │ • Votes          │  │   address        │  │ • News results   │                   │
│  │ • Committees     │  │ • OCD-ID parsing │  │                  │                   │
│  │ • Bill text      │  │                  │  │                  │                   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘                   │
│                                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                   │
│  │     OpenAI       │  │     Supabase     │  │    LangChain     │                   │
│  │      API         │  │   (BaaS Layer)   │  │       Hub        │                   │
│  │                  │  │                  │  │                  │                   │
│  │ api.openai.com   │  │ *.supabase.co    │  │ smith.langchain  │                   │
│  │                  │  │                  │  │ .com             │                   │
│  │ • GPT-4o-mini    │  │ • OAuth (Google, │  │                  │                   │
│  │   (main agent)   │  │   GitHub)        │  │ • Prompt         │                   │
│  │ • GPT-4o         │  │ • JWT tokens     │  │   management     │                   │
│  │   (bill analysis)│  │ • PostgreSQL DB  │  │ • Agent tracing  │                   │
│  │                  │  │ • Row-level sec. │  │                  │                   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘                   │
│                                                                                      │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────┐
│  User   │
│ Browser │
└────┬────┘
     │
     │  HTTPS
     ▼
┌─────────────────────────────────────────────────────────┐
│              NEXT.JS FRONTEND (:3000)                   │
│                                                         │
│  1. User types question in Chat                         │
│  2. Supabase JWT attached to request                    │
│  3. POST /chat/stream sent to backend                   │
│  4. SSE connection opened for streaming                 │
└────────────────────────┬────────────────────────────────┘
                         │
                         │  SSE Stream + REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND (:8000)                    │
│                                                         │
│  1. JWT verified via Supabase JWKS                      │
│  2. Conversation loaded/created in DB                   │
│  3. Message history retrieved (last 10 msgs)            │
│  4. COSINT Agent invoked with context                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              COSINT AGENT (LangChain)                   │
│                                                         │
│  Agent receives query + system prompt + history         │
│                    │                                    │
│         ┌──────────┼──────────┐                         │
│         ▼          ▼          ▼                          │
│    ┌─────────┐ ┌────────┐ ┌────────┐                    │
│    │Congress │ │ Google │ │ Brave  │   ◄── Tool calls   │
│    │  API    │ │ Civic  │ │Search  │       decided by    │
│    └────┬────┘ └───┬────┘ └───┬────┘       the LLM      │
│         │          │          │                          │
│         └──────────┼──────────┘                          │
│                    ▼                                     │
│         ┌──────────────────┐                             │
│         │   Cache Layer    │  24hr TTL                   │
│         │   (DiskCache)    │  on API responses           │
│         └──────────────────┘                             │
│                    │                                     │
│                    ▼                                     │
│         ┌──────────────────┐                             │
│         │  GPT-4o-mini     │  Generates response         │
│         │  (via OpenAI)    │  with embedded tags          │
│         └────────┬─────────┘                             │
│                  │                                       │
│         ┌────────┴─────────┐                             │
│         ▼                  ▼                              │
│  ┌─────────────┐  ┌──────────────┐                      │
│  │ Intel Agent │  │ Bill Agent   │                      │
│  │ (GPT-4o-m.) │  │  (GPT-4o)   │  Secondary agents    │
│  │ Extract key │  │ Summarize    │  run when needed      │
│  │ facts       │  │ legislation  │                      │
│  └─────────────┘  └──────────────┘                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         │  Streamed tokens
                         ▼
┌─────────────────────────────────────────────────────────┐
│              RESPONSE PIPELINE                          │
│                                                         │
│  Stream includes:                                       │
│  ├── Markdown-formatted answer text                     │
│  ├── [INTEL_PACKET: Title | Content |END_PACKET]        │
│  ├── [CREATE_PAGE_ACTION: Name | BioguideID]            │
│  └── [RESEARCH_BILL: Congress | Type | Num | Title]     │
│                                                         │
│  Backend:                                               │
│  ├── Saves user message to DB                           │
│  ├── Saves assistant response to DB                     │
│  └── Auto-creates TrackedBill if bill tag detected      │
│                                                         │
│  Frontend parses tags:                                  │
│  ├── Intel packets → Research notebook entries           │
│  ├── Page actions  → "Create member page" buttons        │
│  └── Bill tags     → "Track this bill" buttons           │
└─────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│  User    │────▶│  Next.js     │────▶│   Supabase   │────▶│  Google  │
│  clicks  │     │  /login      │     │   Auth       │     │  or      │
│  Login   │     │              │     │              │     │  GitHub  │
└──────────┘     └──────────────┘     └──────────────┘     └──────────┘
                                             │                    │
                                             │◄───────────────────┘
                                             │   OAuth callback
                                             ▼
                                      ┌──────────────┐
                                      │  JWT Token   │
                                      │  (ES256)     │
                                      │  issued      │
                                      └──────┬───────┘
                                             │
                              ┌──────────────┼──────────────┐
                              ▼              ▼              ▼
                       ┌────────────┐ ┌────────────┐ ┌────────────┐
                       │  Frontend  │ │  API calls │ │  Backend   │
                       │  stores in │ │  include   │ │  verifies  │
                       │  cookies   │ │  Bearer    │ │  via JWKS  │
                       └────────────┘ │  token     │ └────────────┘
                                      └────────────┘
```

## Database Schema

```
┌─────────────────────┐       ┌─────────────────────┐
│    conversations    │       │      messages       │
├─────────────────────┤       ├─────────────────────┤
│ id          UUID PK │──┐    │ id          UUID PK │
│ user_id     TEXT    │  │    │ conversation_id  FK │──┐
│ title       TEXT    │  │    │ role         TEXT   │  │
│ bioguide_id TEXT    │  └────│ content      TEXT   │  │
│ position    INT     │       │ created_at   TS    │  │
│ created_at  TS      │       └─────────────────────┘  │
└─────────────────────┘              CASCADE DELETE ◄───┘

┌─────────────────────┐       ┌─────────────────────┐
│   tracked_bills     │       │   research_notes    │
├─────────────────────┤       ├─────────────────────┤
│ id          UUID PK │       │ id          UUID PK │
│ user_id     TEXT    │       │ user_id     TEXT    │
│ bill_id     TEXT    │       │ bioguide_id TEXT    │
│ bill_type   TEXT    │       │ title       TEXT    │
│ bill_number TEXT    │       │ content     TEXT    │
│ congress    INT     │       │ created_at  TS      │
│ title       TEXT    │       │ updated_at  TS      │
│ position    INT     │       └─────────────────────┘
│ created_at  TS      │
└─────────────────────┘

UNIQUE(user_id, bill_id)
```

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16, React 19, TypeScript | App shell, routing, SSR |
| **Styling** | Tailwind CSS 4 | UI design system |
| **Auth** | Supabase Auth (Google, GitHub OAuth) | User authentication |
| **Backend** | FastAPI, Uvicorn | REST API + SSE streaming |
| **AI Orchestration** | LangChain (OpenAI Tools Agent) | Multi-tool agent framework |
| **LLM (Primary)** | GPT-4o-mini | Chat agent, intel extraction |
| **LLM (Analysis)** | GPT-4o | Bill text analysis |
| **Database** | PostgreSQL (Supabase) / SQLite fallback | Persistent storage |
| **ORM** | SQLAlchemy + Alembic | DB access + migrations |
| **Caching** | DiskCache (24hr TTL) | API response caching |
| **Legislative Data** | Congress.gov API v3 | Members, bills, votes |
| **Geolocation** | Google Civic Info API v2 | District/rep lookup |
| **Web Search** | Brave Search API | Current news/events |
| **Deployment** | Heroku (Procfile) | Cloud hosting |

## Agent Tool Map

```
                    ┌────────────────────────────┐
                    │     COSINT Main Agent      │
                    │       (GPT-4o-mini)        │
                    └─────────────┬──────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
   ┌────────┴────────┐  ┌────────┴────────┐  ┌────────┴────────┐
   │  CONGRESS TOOLS  │  │ LOCATION TOOLS  │  │   SEARCH TOOLS  │
   ├─────────────────┤  ├─────────────────┤  ├─────────────────┤
   │ MemberSearch    │  │ GoogleCivic     │  │ BraveSearch     │
   │ MemberState     │  │  └─ address →   │  │  └─ query →     │
   │  Search         │  │     state +     │  │     web results │
   │ MemberDetails   │  │     district    │  │                 │
   │ MemberLegis.    │  └─────────────────┘  │ SummarizeBill   │
   │ MemberCommittees│                       │  └─ bill text → │
   │ MemberVotes     │                       │     plain       │
   └─────────────────┘                       │     English     │
                                             └─────────────────┘
```
