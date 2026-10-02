# 🚀 AI Job Copilot — DRC

> A premium React + TypeScript frontend for an AI-powered job search assistant that helps professionals land high-paying jobs with the help of a dedicated human specialist team.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [App Screens & User Flow](#app-screens--user-flow)
- [Authentication](#authentication)
- [Pricing Plans](#pricing-plans)
- [Deployment (EC2 + Nginx)](#deployment-ec2--nginx)
- [Attributions](#attributions)

---

## Overview

**AI Job Copilot — DRC** is the frontend for a job search platform where users can:

- Have a **dedicated human specialist** apply to jobs on their behalf
- **Track their applications** in a visual Kanban-style Job Tracker
- **Auto-generate tailored resumes** with AI for each job listing
- **Manage a comprehensive career profile** (skills, experience, education, certifications, projects, and more)
- Access an **AI Engineer Accelerator** course for career transitions

The platform primarily targets professionals looking for high-paying roles and those transitioning into tech (e.g., QA-to-BA, AI Engineering).

**Figma Design Source:** [AI Job Copilot — DRC on Figma](https://www.figma.com/design/6YuPMYLb93dLwZxupU7Kkk/Ai-Job-Copilot---DRC)

---

## Features

### 🏠 Landing & Marketing
- Animated hero section with social proof ("1500+ Job Seekers Helped")
- Feature highlights, comparison tables, testimonials, and FAQ
- Instagram story-style proof section
- Ticker banners and top companies showcase

### 🔐 Authentication
- **Sign Up** — Registration with email/password
- **Sign In** — Session-based login with localStorage persistence
- Session restoration on page reload (authenticated screens remembered)

### 🧑‍💼 Onboarding Flow
1. **Job Detail Screen** — Capture job preferences (role, location, salary, etc.)
2. **Upload CV Screen** — Upload and parse resume via AI
3. **Skills Edit Screen** — Review and confirm parsed skills

### 📊 Job Dashboard *(Premium Only)*
- Browse AI-curated relevant job listings
- Filter by function, type, work model, experience, location, and skills
- View job match scores and match reasons
- Apply directly with a "Fix CV" dialog for resume optimization

### 📌 Job Tracker *(All users)*
- Kanban-style board with columns: **Saved → Applied → Interview → Offer → Rejected**
- Add jobs manually or from the job dashboard
- Upload application proof (screenshots + remarks)
- Attach resume to each job application
- **AI Resume Generation** — auto-generate a tailored resume per job listing
- Manage connections per job (name, title, LinkedIn/email)
- Full proof history log

### 👤 Profile Page
- Edit professional summary
- Manage work experience, education, certifications, projects, accomplishments
- IT skills and languages
- Job preferences
- Upload profile picture / avatar
- Career DNA section

### 💰 Pricing
- Three tiers: **Base (₹7,000)**, **Plus (₹14,999)**, **Premium (₹32,000)**
- Feature comparison table per tier
- "30% performance assured" guarantee on Plus plan

### 📚 AI Engineer Accelerator (Course Page)
- Course enquiry form (name, email, phone, current role, experience, Python level)
- Integrated lead capture with backend API

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build Tool | [Vite 6](https://vitejs.dev/) with SWC plugin |
| UI Components | [Radix UI](https://www.radix-ui.com/) (full suite) |
| Icon Library | [Lucide React](https://lucide.dev/) |
| Form Handling | [React Hook Form](https://react-hook-form.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Theme | [next-themes](https://github.com/pacocoursey/next-themes) (dark/light mode) |
| Notifications | [Sonner](https://sonner.emilkowal.ski/) |
| Carousel | [Embla Carousel](https://www.embla-carousel.com/) |
| Drag Panels | [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) |
| Styling | Tailwind CSS + CSS Variables |
| State Management | React Context API (`UserContext`) |
| Session Storage | `localStorage` + `sessionStorage` |

---

## Project Structure

```
AiJobAssistantFrontEnd-dev/
├── src/
│   ├── App.tsx                  # Root component — screen router & state orchestration
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Global styles & CSS custom properties
│   ├── types.ts                 # Shared TypeScript types
│   │
│   ├── config/
│   │   ├── api.ts               # Centralized API endpoint definitions
│   │   └── profileApi.ts        # Profile-specific API helpers
│   │
│   ├── contexts/
│   │   └── UserContext.tsx      # Auth state (user_id, isPremiumUser, token)
│   │
│   ├── constants/
│   │   └── skills.ts            # Master list of skills for dropdowns
│   │
│   ├── lib/
│   │   ├── generateResume.ts    # AI resume generation logic
│   │   └── resumeTypes.ts       # Resume/CoverLetter TypeScript types
│   │
│   ├── assets/                  # Static images & SVGs
│   ├── styles/                  # Additional style modules
│   ├── guidelines/              # Internal dev guidelines
│   │
│   └── components/
│       ├── home/                # Landing page sections
│       │   ├── Navbar.tsx
│       │   ├── Hero.tsx
│       │   ├── Features.tsx
│       │   ├── ComparisonTable.tsx
│       │   ├── Testimonials.tsx
│       │   ├── VideoTestimonials.tsx
│       │   ├── SuccessStoriesSection.tsx
│       │   ├── InstagramStories.tsx
│       │   ├── SmarterWay.tsx
│       │   ├── SiteIntegration.tsx
│       │   ├── TopCompanies.tsx
│       │   ├── IndustryLeaders.tsx
│       │   ├── ProofSection.tsx
│       │   ├── FAQ.tsx
│       │   ├── Ticker.tsx
│       │   ├── Footer.tsx
│       │   ├── FooterSearch.tsx
│       │   ├── Button.tsx
│       │   ├── AICoursePage.tsx # AI Engineer Accelerator enrollment
│       │   └── constants.ts
│       │
│       ├── ui/                  # shadcn/ui primitives (Radix-based)
│       ├── profile/             # Profile sub-section components
│       ├── qa-to-ba/            # QA-to-BA career transition page
│       ├── figma/               # Figma-to-code generated components
│       │
│       ├── AuthLayout.tsx
│       ├── SignIn.tsx
│       ├── SignUp.tsx
│       ├── Home.tsx
│       ├── HomeQAtoBA.tsx
│       ├── Sidebar.tsx
│       ├── JobDetailScreen.tsx
│       ├── UploadCVScreen.tsx
│       ├── CVProcessingScreen.tsx
│       ├── SkillsEditScreen.tsx
│       ├── JobDashboard.tsx
│       ├── JobTracker.tsx
│       ├── JobFilters.tsx
│       ├── JobFilterDrawer.tsx
│       ├── JobApplicationDialog.tsx
│       ├── FixCVDialog.tsx
│       ├── GeneratedResumeDialog.tsx
│       ├── ProfilePage.tsx
│       ├── Pricing.tsx
│       └── JobSearchSetup.tsx
│
├── public/                      # Static public assets
├── build/                       # Production build output (Vite → Nginx)
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite + proxy configuration
├── tsconfig.json                # TypeScript configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd AiJobAssistantFrontEnd-dev

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at **http://localhost:3000** and will automatically open in your browser.

> **Note:** In dev mode, Vite proxies all `/api` and `/files` requests to the production backend (`https://dheerajrathodconsult.com`), so you don't need to run a local backend.

### Build for Production

```bash
npm run build
```

Output is written to the `build/` directory.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Optional: override the API base URL for production builds
# Leave empty to use same-origin URLs (recommended for production)
VITE_API_BASE_URL=https://dheerajrathodconsult.com
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `""` (same-origin) | Backend API base URL. In `dev` mode this is used directly if set. |
| `VITE_LOCAL_API_BASE_URL` | `http://localhost:8090` | Local development backend address used when `VITE_API_BASE_URL` is not provided. |
| `VITE_DEV_API_BASE_URL` | `` | Optional alternate dev backend URL, e.g. a staging backend. |

> **CORS Note:** In dev mode, Vite proxies `/api` and `/files` to `localhost:8090` only when `VITE_API_BASE_URL` is not configured. If `VITE_API_BASE_URL` is set, the app talks to the remote backend directly.

---

## API Reference

All endpoints are defined in [`src/config/api.ts`](src/config/api.ts).

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/signup` | Register a new user |
| `POST` | `/api/users/login` | Authenticate and receive session token |
| `POST` | `/api/users/save` | Save/update user skills and preferences |

### Resume

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/resumes/parse` | Parse an uploaded CV |
| `POST` | `/api/resumes/generate` | AI-generate a tailored resume `{ user_id, job_id }` |
| `POST` | `/api/resumes/regenerate` | Apply a free-text instruction to a generated resume |

### Jobs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | Fetch all jobs |
| `GET` | `/api/jobs/relevant?user_id=...` | Fetch AI-curated relevant jobs for a user |
| `POST` | `/api/apply` | Submit a job application |

### User Jobs (Tracker)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user-jobs/user/:userId` | Fetch all tracked jobs for a user |
| `POST` | `/api/user-jobs/:userId` | Add a job to tracker |
| `PUT` | `/api/user-jobs/:userId/:jobId` | Update a tracked job |
| `PATCH` | `/api/user-jobs/:userId/:jobId/status` | Update job status |
| `DELETE` | `/api/user-jobs/:userJobId` | Remove a job from tracker |

### Files

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/files/upload` | Upload a resume file |
| `GET` | `/files/:userId/:fileName` | Fetch a file |
| `POST` | `/files/upload/userprofile` | Upload a profile picture |
| `GET` | `/files/profile_picture/:userId` | Fetch profile picture |

### Profile

Endpoints for managing individual profile sections (all scoped to `userId`):

| Section | Base Path |
|---|---|
| Professional Summary | `/api/users/professional-summary` |
| Career DNA | `/api/users/career-dna` |
| Education | `/api/users/education` |
| Work Experience | `/api/work-experience` |
| Certifications | `/api/users/certification` |
| IT Skills | `/api/users/it-skills` |
| Languages | `/api/users/languages` |
| Projects | `/api/users/projects` |
| Accomplishments | `/api/users/accomplishments` |
| Preferences | `/api/users/preferences` |

### Enquiries

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/enquiries/discovery-call` | Book a discovery call |
| `POST` | `/api/enquiries/ai-engineer-accelerator` | Enrol in AI Engineer Accelerator course |

---

## App Screens & User Flow

```
                    ┌─────────────────────────────┐
                    │         Landing (Home)        │
                    │  Hero · Features · Pricing    │
                    └────────────┬────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
           Sign In           Sign Up            QA-to-BA / AI Course
              │                  │
              ▼                  ▼
     ┌────────────────┐   ┌──────────────┐
     │  New User Flow │   │ Existing User│
     └───────┬────────┘   └──────┬───────┘
             │                   │
             ▼                   ▼
   ┌──────────────────┐   ┌───────────────────────┐
   │ 1. Job Preferences│  │     Job Dashboard      │
   │ 2. Upload CV      │  │  ┌──────────────────┐ │
   │ 3. Skills Edit    │  │  │  Sidebar Nav      │ │
   └────────┬──────────┘  │  ├──────────────────┤ │
            │             │  │  Job Tracker      │ │
            └────────────►│  │  Job Browse (★)   │ │
                          │  │  Profile Page     │ │
                          │  └──────────────────┘ │
                          └───────────────────────┘
```

> ★ Job Browse is visible to **Premium users only**.

### Screen State Machine (AppState)

| State | Description | Auth Required |
|---|---|---|
| `home` | Landing page | No |
| `qa-to-ba` | QA → BA career path page | No |
| `ai-course` | AI Engineer Accelerator page | No |
| `pricing` | Pricing tiers | No |
| `signup` | Registration screen | No |
| `signin` | Login screen | No |
| `job-detail-screen` | Onboarding: job preferences | ✅ Yes |
| `upload-cv` | Onboarding: CV upload | ✅ Yes |
| `skills-edit` | Onboarding: skills review | ✅ Yes |
| `job-dashboard` | Main app dashboard | ✅ Yes |
| `job-tracker` | Sub-view of dashboard | ✅ Yes |

---

## Authentication

Authentication is **session-token based**, stored in `localStorage` / `sessionStorage`.

### Keys stored in localStorage

| Key | Value |
|---|---|
| `user_id` | Authenticated user's ID |
| `is_premium_user` | `"true"` / `"false"` |
| `token` | Session token |
| `user_session_screen` | Last authenticated screen (for session restore on reload) |
| `user_dashboard_view` | Last dashboard tab: `jobs`, `job-tracker`, or `profile` |

### Session Token Header

All authenticated API calls include:
```
X-SESSION-TOKEN: <token>
```

### UserContext

Provided by [`src/contexts/UserContext.tsx`](src/contexts/UserContext.tsx):

```typescript
const { user_id, isPremiumUser, isAuthenticated, isLoading, setUser, clearUser } = useUser();
```

---

## Pricing Plans

| Plan | Price (INR) | Tier | Target Audience |
|---|---|---|---|
| **Base** | ₹7,000 | Accelerator | Starting professionals, smaller target market |
| **Plus** ⭐ | ₹14,999 | Accelerator | Professionals needing high interview call rate. *30% performance assured.* |
| **Premium** | ₹32,000 | Advanced | Leadership roles, career transitions, maximum call volume |

---

## Deployment (EC2 + Nginx)

The frontend is served from an **AWS EC2 (Ubuntu)** instance via **Nginx**. Two frontends are hosted:

- **Main UI** → `/var/www/dheerajrathodconsult/`
- **Admin UI** → `/var/www/dheerajrathodconsult/admin/`

### Prerequisites on EC2

- Ubuntu OS
- Node.js & npm
- Git
- Nginx (running)
- Access to `/var/www/` directory

### Deploy Main UI

```bash
# 1. SSH into EC2
ssh ubuntu@<EC2_PUBLIC_IP>

# 2. Navigate to the project
cd ~/app/frontend

# 3. Pull latest code
git pull origin main      # replace 'main' with your branch if needed

# 4. Install dependencies (if needed)
npm install

# 5. Build
npm run build

# 6. Copy build files to Nginx root
sudo cp -r ~/app/frontend/build/* /var/www/dheerajrathodconsult/

# 7. Restart Nginx
sudo systemctl restart nginx
```

### Deploy Admin UI

Same steps as above — only the copy destination changes:

```bash
sudo cp -r ~/app/frontend/build/* /var/www/dheerajrathodconsult/admin/
```

### Directory Structure on Server

```
/home/ubuntu/app/frontend/          → React source code
/var/www/dheerajrathodconsult/      → Main UI (Nginx root)
/var/www/dheerajrathodconsult/admin → Admin UI (Nginx root)
```

---

## Attributions

- UI components from [shadcn/ui](https://ui.shadcn.com/) — used under [MIT License](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md)
- Photos from [Unsplash](https://unsplash.com) — used under [Unsplash License](https://unsplash.com/license)
- Icons from [Lucide React](https://lucide.dev/) — MIT License
- Headless UI primitives from [Radix UI](https://www.radix-ui.com/) — MIT License

---

> **Figma Design:** [View on Figma](https://www.figma.com/design/6YuPMYLb93dLwZxupU7Kkk/Ai-Job-Copilot---DRC)
