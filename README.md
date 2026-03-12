# 🌍 TripCraft AI — Smart AI Travel Planner

> An AI-powered, full-stack travel planning application that builds personalized multi-day itineraries, real budget estimates, curated hotel recommendations, and smart packing lists in seconds.

**Live Demo:** `[Add your Vercel URL here]`  
**Backend API:** `[Add your Render URL here]`  
**Repository:** `[Add your GitHub URL here]`

---

## 🎬 Demo Video

> **Add your walkthrough video link here:**  
> `[Google Drive / YouTube link]`

---

## 📋 Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Tech Stack](#2-tech-stack)
- [3. High-Level Architecture](#3-high-level-architecture)
- [4. Project Structure](#4-project-structure)
- [5. Features in Detail](#5-features-in-detail)
- [6. Backend Details](#6-backend-details-nodejs--express)
- [7. Frontend Details](#7-frontend-details-nextjs)
- [8. AI Integration](#8-ai-integration-google-gemini)
- [9. Environment Configuration](#9-environment-configuration)
- [10. Local Development](#10-local-development)
- [11. Deployment](#11-deployment)
- [12. Screenshots](#12-screenshots)
- [13. How This Meets the Assessment Requirements](#13-how-this-meets-the-assessment-requirements)
- [14. Credits](#14-credits)

---

## 1. Project Overview

**TripCraft AI** is a full-stack AI travel planning application where users can:

- **Register and log in** securely with JWT-based authentication.
- **Plan trips** using a beautiful multi-step wizard (Destination → Duration → Budget → Interests).
- **Generate complete AI itineraries** powered by Google Gemini — day-by-day plans, hotels, packing lists, and budget breakdowns.
- **Manage trips** — view, regenerate specific days, add/remove activities, manage hotel lists, and track packing items.
- **Delete trips** with a confirmation modal.
- Use a **100% responsive UI** across mobile, tablet, and desktop.

The project is built like a production-grade startup product — not a quick demo:

- Clean separation of frontend, backend, and database layers.
- Robust error handling with user-friendly toast notifications.
- AI fallback logic for rate-limited or unavailable models.
- A premium dark-theme design system with glassmorphism, Framer Motion animations, and micro-interactions.

---

## 2. Tech Stack

### Frontend
| Library / Tool | Purpose |
|---|---|
| **Next.js 15** (App Router) | React framework with server/client routing |
| **React 19** | Component model, hooks, state management |
| **Framer Motion** | Page transitions, micro-animations, AnimatePresence |
| **Lucide React** | Icon system |
| **Vanilla CSS** (Custom Design System) | Full custom design tokens, glassmorphism, gradients |
| **react-hot-toast** | Toast notification system |

### Backend
| Library / Tool | Purpose |
|---|---|
| **Node.js** | Server runtime |
| **Express.js** | HTTP routing and middleware |
| **MongoDB Atlas** | Cloud database (NoSQL) |
| **Mongoose** | ODM — schemas, models, and queries |
| **JSON Web Tokens (JWT)** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **@google/generative-ai** | Google Gemini AI SDK — primary: `gemini-2.5-flash` / `gemini-3-flash`, fallback: `gemini-3.1-flash-lite` |

### External APIs
| API | Purpose |
|---|---|
| **Google Gemini** (`gemini-2.0-flash-lite`) | AI itinerary generation, day regeneration, packing lists |

---

## 3. High-Level Architecture

```text
Browser (Next.js, Vercel)
  │
  │  HTTPS/JSON via NEXT_PUBLIC_API_URL
  ▼
Backend API (Express, Render)
  │
  │  Mongoose ODM
  ▼
MongoDB Atlas (Cloud)
  │
  │  @google/generative-ai SDK
  ▼
Google Gemini API
```

- All HTTP calls from the frontend go through `frontend/lib/api.js` — a centralized fetch wrapper that automatically attaches the JWT Bearer token.
- The backend exposes REST endpoints under `/api/auth` and `/api/trips`.
- All trip documents are scoped to the authenticated user via JWT middleware.
- The AI service (`backend/services/aiService.js`) calls Gemini with a structured prompt and falls back to a lighter model (`gemini-2.0-flash-lite`) on rate-limit errors (429).

---

## 4. Project Structure

```text
Trao Technologoes - Assignment 2/
├── backend/                        # Node.js / Express REST API
│   ├── config/
│   │   └── db.js                   # MongoDB Atlas connection via Mongoose
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication guard
│   ├── models/
│   │   ├── Trip.js                 # Trip Mongoose schema (itinerary, hotels, packing)
│   │   └── User.js                 # User Mongoose schema (bcrypt password)
│   ├── routes/
│   │   ├── auth.js                 # POST /auth/register, POST /auth/login
│   │   └── trips.js                # Full CRUD + AI generation endpoints
│   ├── services/
│   │   └── aiService.js            # Google Gemini integration with fallback
│   ├── server.js                   # Express app entry point + CORS config
│   ├── .env                        # Local env vars (not committed)
│   └── package.json
│
├── frontend/                       # Next.js 15 App Router UI
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.js             # Trip dashboard — cards, stats, delete modal
│   │   ├── login/
│   │   │   └── page.js             # Login page — split-screen glassy auth
│   │   ├── plan/
│   │   │   └── page.js             # Plan Wizard — 4-step form with AI generation
│   │   ├── register/
│   │   │   └── page.js             # Register page — password strength meter
│   │   ├── trip/[id]/
│   │   │   └── page.js             # Trip detail — tabs for itinerary/budget/hotels/packing
│   │   ├── globals.css             # Full design system: tokens, cards, buttons, animations
│   │   ├── layout.js               # App shell — Navbar, Toaster, AuthProvider
│   │   └── page.js                 # Landing page — hero, features, CTA
│   ├── components/
│   │   ├── LoadingSpinner.js       # Animated loading screen with cycling messages
│   │   ├── Logo.js                 # Custom inline SVG gradient logo
│   │   └── Navbar.js               # Scroll-aware navbar with mobile drawer + logout modal
│   ├── context/
│   │   └── AuthContext.js          # Global auth state — JWT stored in localStorage
│   ├── lib/
│   │   └── api.js                  # Centralized fetch client — auto auth headers
│   ├── public/images/              # Static assets — hero-bg.png, auth-illustration.png
│   ├── .env.local                  # Local env vars (not committed)
│   └── package.json
│
├── README.md                       # This file
└── Trao FS-Assessment_trip_planner.docx  # Original assignment specification
```

---

## 5. Features in Detail

### 🔐 Authentication
- **Register** — Name, email, password (min 6 chars) with live strength meter.
- **Login** — Email + password; JWT stored in `localStorage`.
- **Auth Guard** — All protected pages redirect to `/login` if unauthenticated.
- **Logout** — Confirmation modal; clears localStorage.

### 🗺️ Plan Wizard (4-Step Form)
1. **Destination** — City/country text input with cycling example placeholders.
2. **Duration** — Day count (1–30) with `+`/`–` stepper.
3. **Budget** — Choose from Budget / Mid-Range / Luxury presets, **or** enter a custom dollar amount. If the budget is too low for the destination, the AI warns and provides the cheapest possible plan.
4. **Interests** — Multi-select tag grid (Culture, Food, Adventure, Nature, History, Nightlife, Shopping, etc.)

### 🤖 AI Trip Generation
- Sends all wizard data to the backend, which builds a structured Gemini prompt.
- Returns a full trip document with:
  - **Day-by-day itinerary** (time, activity name, description, duration, cost)
  - **Budget breakdown** by category (accommodation, food, transport, activities)
  - **Hotel recommendations** (name, category, rating, price range, amenities)
  - **Smart packing list** (organized by category — Clothing, Electronics, Documents, etc.)
- **Model fallback:** If the primary model (`gemini-2.0-flash`) hits a 429 rate limit, the service automatically retries with `gemini-2.0-flash-lite`.
- **Empty plan guard:** If generation fails, the trip is not saved — retrying starts fresh.

### 📅 Trip Detail — 4 Tabs
| Tab | Content |
|---|---|
| **Itinerary** | Expandable day-by-day accordion with activity cards. Re-generate any day with an optional preference note. Add or remove individual activities. |
| **Budget** | Animated category bars showing proportional spending breakdown. Total cost clearly displayed. Handles both legacy and new schema shapes. |
| **Hotels** | AI-curated hotel cards with ratings, price range, and amenity tags. Add custom hotels manually. Remove hotels. |
| **Packing** | Packing items grouped by AI-generated category. Check off items as you pack. Add items to categories. Remove items or entire categories. |

### 🏠 Dashboard
- **Quick Stats** — Total trips, total days planned, unique destinations.
- **Trip Cards** — Destination, duration, budget type badge, date created, "View Trip" CTA.
- **Delete Modal** — Confirm before permanent deletion.
- **Dynamic Greating** — Time-aware: Morning / Afternoon / Evening / Night with unique funky phrases.

### 🧭 Navigation
- **Scroll-aware Navbar** — Transparent at top → glassy on scroll (backdrop blur + border).
- **Home button** — Logged-in users can return to the landing page without being logged out.
- **Mobile Drawer** — Full-screen overlay hamburger menu with route links.
- **Landing page** — Shows "Go to Dashboard" and "Plan New Trip" instead of login/register CTAs when already logged in.

---

## 6. Backend Details (Node.js + Express)

### Auth Endpoints (`/api/auth`)

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account. Body: `{ name, email, password }`. Hashes password, returns `{ token, user }`. |
| `POST` | `/api/auth/login` | Login. Body: `{ email, password }`. Returns `{ token, user }`. |

### Trip Endpoints (`/api/trips`) — All require `Authorization: Bearer <token>`

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/trips` | Returns all trips for the authenticated user. |
| `POST` | `/api/trips` | Triggers AI generation. Body: `{ destination, days, budgetType, interests }`. |
| `GET` | `/api/trips/:id` | Returns a single trip by ID (ownership enforced). |
| `PUT` | `/api/trips/:id` | Updates trip fields (hotels, packing list, etc.). |
| `DELETE` | `/api/trips/:id` | Permanently deletes a trip. |
| `POST` | `/api/trips/:id/regenerate-day` | Regenerates a single day's plan via AI. Body: `{ dayNumber, preference }`. |
| `POST` | `/api/trips/:id/add-activity` | Adds a manual activity to a specific day. |
| `POST` | `/api/trips/:id/remove-activity` | Removes an activity by day + index. |
| `POST` | `/api/trips/:id/generate-packing-list` | Triggers AI to generate a fresh packing list. |

### Data Models

#### `User`
```js
{ name, email, password (bcrypt hash), createdAt }
```

#### `Trip`
```js
{
  user,           // ObjectId (ref: User)
  destination,    // String
  days,           // Number
  budgetType,     // String (e.g. "mid-range" or "$50")
  interests,      // [String]
  itinerary,      // [{ dayNumber, activities: [{ time, name, description, duration, cost }] }]
  budgetEstimate, // { accommodation, food, transport, activities, total, currency }
  hotels,         // [{ name, category, rating, priceRange, description, amenities }]
  packingList,    // [{ category, item, packed }]
  createdAt
}
```

---

## 7. Frontend Details (Next.js)

### Pages & Routes

| Route | File | Description |
|---|---|---|
| `/` | `app/page.js` | Landing page — hero section, feature highlights, social proof |
| `/login` | `app/login/page.js` | Split-screen login with animated inputs |
| `/register` | `app/register/page.js` | Registration with password strength meter |
| `/dashboard` | `app/dashboard/page.js` | Trip overview with stats and card grid |
| `/plan` | `app/plan/page.js` | 4-step AI trip planner wizard |
| `/trip/[id]` | `app/trip/[id]/page.js` | Full trip detail with 4 tabbed sections |

### Design System (`globals.css`)

- **CSS Custom Properties** — Full token set for colors, spacing, radius, shadows, gradients.
- **Deep Ocean Dark Theme** — `#050a18` base, `#00d4aa` primary accent, `#7c5cfc` secondary.
- **Glassmorphism Cards** — `backdrop-filter: blur`, semi-transparent backgrounds.
- **Animated Mesh Background** — CSS keyframe orbs that drift behind all pages.
- **Responsive** — Mobile-first breakpoints, `flex-wrap`, media query adjustments for the plan wizard and trip detail.

---

## 8. AI Integration (Google Gemini)

### How it works (`backend/services/aiService.js`)

1. Receives trip parameters from the `/api/trips` POST handler.
2. Builds a detailed structured prompt instructing Gemini to return a strict JSON object conforming to the Trip schema.
3. Calls **`gemini-2.5-flash`** (or `gemini-3-flash`) as the **primary model** via the `@google/generative-ai` SDK.
4. **On 429 rate limit** — automatically falls back to **`gemini-3.1-flash-lite`** (lighter, faster, within free-tier quota).
5. Parses and validates the JSON response; strips Markdown code fences if present.
6. **If the custom budget is too low** — the prompt instructs Gemini to include a `budgetWarning` field and still generate the cheapest possible plan.

### Model Strategy

| Role | Model | Reason |
|---|---|---|
| **Primary** | `gemini-2.5-flash` / `gemini-3-flash` | Most capable, fast structured JSON output |
| **Fallback** | `gemini-3.1-flash-lite` | Lightweight — used automatically when the primary hits a 429 rate limit |

- Native JSON output mode via `responseMimeType: 'application/json'` ensures clean parsing.
- Flash models generate full itineraries in under 10 seconds.
- Fallback logic means the app keeps working even when free-tier quotas are exhausted.

---

## 9. Environment Configuration

### Backend `.env` (not committed)

```env
# Server
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/tripcraft?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# Google Gemini AI
GEMINI_API_KEY=your-google-gemini-api-key
```

> **Note for deployment:** Replace all placeholder values with real credentials in your Render dashboard environment variables.

### Frontend `.env.local` (not committed)

```env
# Points to the Express backend — change to your Render URL in production
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

> **On Vercel:** Set `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api` in Project Settings → Environment Variables.

---

## 10. Local Development

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free tier works)
- A Google AI Studio API key ([Get one here](https://aistudio.google.com/))

### 1. Clone the Repository

```bash
git clone [ADD YOUR GITHUB REPO URL HERE]
cd "Trao Technologoes - Assignment 2"
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file with the variables from section 9
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:5001/api
npm run dev
# App runs on http://localhost:3000
```

### 4. Verify

- Backend health: `http://localhost:5000/` (should return a welcome message)
- Frontend: `http://localhost:3000` — landing page with hero section
- Register a new account and start planning a trip

---

## 11. Deployment

### Backend — Render

1. Push your code to GitHub.
2. On [render.com](https://render.com), create a new **Web Service**.
3. Connect your GitHub repository, set **Root Directory** to `backend`.
4. **Build command:** `npm install`
5. **Start command:** `node server.js`
6. Add Environment Variables in Render's dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `PORT=5000`
7. **MongoDB Atlas:** Add `0.0.0.0/0` to the IP allowlist (Network Access) so Render can connect.

> **Live backend URL:** `[Add your Render URL here]`

### Frontend — Vercel

1. On [vercel.com](https://vercel.com), import your GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework: **Next.js** (auto-detected).
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
5. Deploy — Vercel auto-rebuilds on every push to `main`.

> **Live frontend URL:** `[Add your Vercel URL here]`

---

## 12. Screenshots

> Add screenshots to a `screenshots/` folder in the project root and update the paths below.

| Screen | Description |
|---|---|
| **Landing Page** | `![Landing](./screenshots/landing.png)` — Hero section with animated mesh background and CTA buttons |
| **Register** | `![Register](./screenshots/register.png)` — Split-screen auth with password strength meter |
| **Login** | `![Login](./screenshots/login.png)` — Glassy split-screen login form |
| **Dashboard** | `![Dashboard](./screenshots/dashboard.png)` — Trip card grid with quick stats |
| **Plan Wizard** | `![Plan](./screenshots/plan.png)` — Multi-step trip planner |
| **Trip Itinerary** | `![Itinerary](./screenshots/trip-itinerary.png)` — Day-by-day accordion with activity cards |
| **Trip Budget** | `![Budget](./screenshots/trip-budget.png)` — Animated proportional budget bars |
| **Trip Hotels** | `![Hotels](./screenshots/trip-hotels.png)` — AI-curated hotel cards with amenity tags |
| **Trip Packing** | `![Packing](./screenshots/trip-packing.png)` — Smart packing checklist grouped by AI |

---

## 13. How This Meets the Assessment Requirements

Referencing **`Trao FS-Assessment_trip_planner.docx`**:

### Required Stack ✅
| Requirement | Implementation |
|---|---|
| **Frontend:** Next.js | `frontend/` — Next.js 15 App Router |
| **Backend:** Node.js + Express | `backend/server.js` — Express REST API |
| **Database:** MongoDB | MongoDB Atlas via Mongoose (`backend/models/`) |
| **External AI API** | Google Gemini via `@google/generative-ai` (`backend/services/aiService.js`) |
| **Authentication** | JWT (`jsonwebtoken`) + bcrypt password hashing |

### Core Feature Requirements ✅
| Feature | Implementation |
|---|---|
| **AI Trip Generation** | Full itinerary, budget, hotels, and packing list generated in one Gemini call |
| **Multi-step Planning Form** | 4-step wizard: Destination → Duration → Budget → Interests |
| **Budget Awareness** | Custom budget input; Gemini warns if budget is too low and still generates the cheapest possible plan |
| **Day Regeneration** | `POST /trips/:id/regenerate-day` with optional user preference |
| **Activity Management** | Add/remove activities per day |
| **Hotel Management** | View AI hotels + add/remove custom ones |
| **Packing List** | AI-generated + user editable (check off, add, remove per category) |
| **Trip CRUD** | Full create, read, update (partial), delete with ownership enforcement |
| **Auth Guard** | All trip routes protected; dashboard redirects unauthenticated users |

### System Design & Architecture ✅
- **Layered backend:** Routes → Services → Models (clear responsibility separation)
- **Centralized API client:** All frontend HTTP calls go through `lib/api.js` (JWT auto-injection, 401 handling)
- **Error handling:** Toast notifications on every failure; specific messages for AI failures, empty results, and validation errors
- **Data isolation:** Every trip query filters by `user` ID — no cross-user data leakage
- **AI Fallback:** Automatic model fallback on rate limits; prevents empty trip creation on generation failure

### Polish & Creativity ✅
- **Premium Dark Theme** — Deep ocean palette, glassmorphism, gradient accents
- **60fps Animations** — Framer Motion page transitions, staggered card reveals, AnimatePresence
- **Dynamic Greeetings** — Time-based funky greetings (Morning / Afternoon / Evening / Night Owl)
- **Responsive Design** — Mobile-first CSS with media queries for the plan wizard and trip detail
- **Scroll-aware Navbar** — Transparent → glassy backdrop on scroll
- **"Developed by Arpit Singh"** — Credited in every file header

---

## 14. Credits

- **Developed by:** Arpit Singh  
- **GitHub:** [TSM-ArpitSG](https://github.com/TSM-ArpitSG)  
- **Project:** TripCraft AI — AI-Powered Travel Planner (Trao Technologies Assignment 2)
- **Previous Work:** [Trao Weather AI](https://github.com/TSM-ArpitSG/trao-weather-ai) — Assignment 1

---

*Built with ❤️ by Arpit Singh · Trao Technologies Full-Stack Assessment*
