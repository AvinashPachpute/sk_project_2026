# 🎓 Apex SIMS - Student Information Management System

A production-ready, full-stack **Student Information Management System (SIMS)** built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase PostgreSQL. Designed for colleges and educational institutions to manage students, attendance, examinations, grades, classes, subjects, reports, and staff roles with enterprise-grade security and a modern responsive user experience.

---

## 🌟 Key Highlights & Architecture

- **Dual-Mode Data Architecture**:
  - **Local Demo Mode (Out of the Box)**: Works instantly with simulated persistent storage (`localStorage`) and seed data. Zero configuration required to test and evaluate the complete system.
  - **Supabase Cloud Mode**: Seamlessly switches to Supabase PostgreSQL and Supabase Auth when credentials are provided in `.env.local` or Vercel Environment Variables.
- **Role-Based Access Control (RBAC)**: Supports `Administrator` and `Teacher` roles with route protection, granular permissions, and Row Level Security (RLS).
- **Print & CSV Export**: 1-click CSV exports with formula injection sanitization, plus tailored CSS print media stylesheets for student transcripts and summary cards.
- **Academic Grading Engine**: Automatic grade calculations, GPA scores, percentage metrics, and validation preventing invalid marks.
- **Automated Test Suite**: Built-in test suite (`npm test`) covering grading math, input validation, and CSV formatting.

---

## 📂 Project Folder Tree

```text
SK PROJECT/
├── app/
│   ├── api/
│   │   └── auth/callback/route.ts        # Supabase OAuth/auth exchange route
│   ├── attendance/
│   │   ├── history/page.tsx              # Class-wise attendance records & filters
│   │   └── page.tsx                      # Quick daily attendance marking matrix
│   ├── classes/
│   │   └── page.tsx                      # Class & section management with capacity tracker
│   ├── dashboard/
│   │   └── page.tsx                      # Executive dashboard with analytics & metrics
│   ├── examinations/
│   │   └── page.tsx                      # Exam scheduling, date ranges & status
│   ├── login/
│   │   └── page.tsx                      # Login portal with 1-click Demo credentials
│   ├── marks/
│   │   └── page.tsx                      # Mark entry grid with live grade calculation
│   ├── reports/
│   │   ├── academic-performance/page.tsx # Pass rates & GPA distribution
│   │   ├── class-enrollment/page.tsx     # Student count vs capacity utilization
│   │   ├── daily-attendance/page.tsx     # Date-based attendance rate breakdown
│   │   ├── exam-marks/page.tsx           # Subject exam results breakdown
│   │   ├── student-list/page.tsx         # Comprehensive student registry with filters
│   │   └── page.tsx                      # Reports index & quick links
│   ├── reset-password/
│   │   └── page.tsx                      # Password recovery workflow
│   ├── settings/
│   │   └── page.tsx                      # College profile, semester, academic year
│   ├── students/
│   │   ├── [id]/page.tsx                 # Detailed student profile & academic history
│   │   └── page.tsx                      # Student CRUD with roll number validation
│   ├── subjects/
│   │   └── page.tsx                      # Subject catalog with course codes & credits
│   ├── users/
│   │   └── page.tsx                      # Staff & user administration (Admin only)
│   ├── globals.css                       # Design tokens, print styles, and utilities
│   ├── layout.tsx                        # Global root layout with metadata
│   └── page.tsx                          # Root redirection to /dashboard
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx                   # Collapsible responsive sidebar navigation
│   │   └── topbar.tsx                    # Header with live mode badge & user profile
│   └── ui/
│       ├── badge.tsx                     # Status badge component
│       ├── button.tsx                    # Accessible button with loading state
│       ├── card.tsx                      # Container cards for stats and forms
│       ├── dialog.tsx                    # Modal dialogs for creation and edits
│       ├── input.tsx                     # Styled input fields with validation
│       ├── select.tsx                    # Dropdown select menus
│       ├── table.tsx                     # Structured responsive data table
│       └── tabs.tsx                      # Tab switcher for navigation
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Supabase browser client & mode detector
│   │   ├── middleware.ts                 # Session verification & route guarding
│   │   └── server.ts                     # Supabase server client
│   ├── csv-export.ts                     # Secure CSV generation & sanitization
│   ├── data-provider.ts                  # Unified data layer (Supabase + LocalStorage)
│   ├── grading.ts                        # Grade boundaries, GPA points, calculations
│   ├── mock-storage.ts                   # Initial seed data for demo mode
│   └── utils.ts                          # Formatting & CSS class merging helpers
├── supabase/
│   └── migrations/
│       ├── 0001_initial_schema.sql       # Full PostgreSQL schema with RLS & indexes
│       └── 0002_seed_demo_helper.sql     # Realistic demo seed data (classes, students)
├── tests/
│   ├── csv-export.test.mjs               # Unit tests for CSV safety and quoting
│   ├── grading.test.mjs                  # Unit tests for grade boundaries & calculations
│   └── validation.test.mjs               # Unit tests for roll numbers & form payloads
├── .env.example                          # Sample environment configuration
├── .env.local                            # Local development environment overrides
├── middleware.ts                         # Edge route guard & session updater
├── next.config.ts                        # Next.js configuration
├── package.json                          # Dependencies & build scripts
├── tsconfig.json                         # Strict TypeScript configuration
└── README.md                             # Comprehensive project documentation
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.18 or higher (v20+ recommended)
- `npm` (comes with Node.js) or `pnpm`

### 2. Installation
Open your terminal in the project directory:
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser. The app will immediately load into the Dashboard.

### 4. Run the Test Suite
```bash
npm test
```
All 10 unit tests will run and report status in milliseconds:
```text
✔ convertToCSV generates compliant CSV header and data rows
✔ convertToCSV escapes double quotes properly
✔ convertToCSV sanitizes formula injection characters
✔ calculatePercentage correctly computes standard percentages
✔ calculatePercentage handles edge cases gracefully
✔ isValidMark prevents marks exceeding maximum and negative marks
✔ calculateGrade assigns correct letter grade and GPA points
✔ validateStudentPayload accepts complete valid student
✔ validateStudentPayload catches missing required fields
✔ checkDuplicateRollNumber correctly detects conflicts within same class
```

### 5. Production Build Verification
```bash
npm run build
```
Generates an optimized, statically prerendered and dynamically bundled production build.

---

## 🔑 Login & Demo Credentials

When running in **Demo Mode** or after running the database seed script:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@apexcollege.edu` | `Admin@Apex2024` | Full access to all modules, users, and settings |
| **Teacher** | `sarah.miller@apexcollege.edu` | `Teacher@Apex2024` | Student view, Attendance marking, Marks entry |

> **Tip**: The `/login` page includes **1-Click Demo Buttons** that auto-fill these credentials for instant testing.

---

## 🗄️ Supabase Cloud Setup (PostgreSQL Database)

To connect this application to a real live PostgreSQL database hosted on [Supabase](https://supabase.com):

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in / sign up.
2. Click **New project**.
3. Choose an organization, enter a name (e.g., `apex-sims`), set a strong database password, and select your preferred region.
4. Click **Create new project** and wait 1–2 minutes for the database to provision.

### Step 2: Run Database Schema Migrations
1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql) in this repository, copy its entire contents, paste it into the SQL editor, and click **Run**.
   - This creates all required tables (`profiles`, `college_settings`, `classes`, `subjects`, `students`, `attendance`, `examinations`, `marks`, `grading_rules`), enables Row Level Security (RLS), configures audit triggers, and creates performance indexes.
4. *(Optional Demo Seed)*: Open [`supabase/migrations/0002_seed_demo_helper.sql`](supabase/migrations/0002_seed_demo_helper.sql), copy its contents, paste into the SQL editor, and click **Run** to populate initial demo classes, subjects, students, and examinations.

### Step 3: Retrieve Project API Keys
1. In the Supabase dashboard, navigate to **Project Settings** (gear icon) -> **API**.
2. Copy the **Project URL** (e.g., `https://xyzcompany.supabase.co`).
3. Copy the **anon public** key.

### Step 4: Configure Local `.env.local`
Update `.env.local` in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```
Restart your dev server (`npm run dev`). The application header will now display a green **"Supabase Connected"** badge!

---

## 🌐 Deploy to Vercel (Step-by-Step)

Deploy the application live to the web in under 5 minutes without any server administration:

### Step 1: Push Code to GitHub
1. Create a new repository on [GitHub](https://github.com/new) (e.g., `student-information-management-system`).
2. Run the following commands in your local project root:
   ```bash
   git add .
   git commit -m "Initial release of Student Information Management System"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```

### Step 2: Deploy on Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository `student-information-management-system`.
4. Under **Framework Preset**, Next.js will be automatically detected.
5. Expand **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase Anon Public Key
   *(Note: If you haven't set up Supabase yet, you can leave these with placeholder values and the app will run in Demo Mode on Vercel!)*
6. Click **Deploy**.
7. Vercel will build and assign you a live HTTPS URL (e.g., `https://apex-sims.vercel.app`).

---

## 📋 Environment Variables Checklist

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Your Supabase project API endpoint URL | `https://abcdefghijkl.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Your Supabase project public anonymous API key | `eyJhbGciOiJIUzI1NiIsInR5cCI6...` |

*(If omitted or containing "placeholder", the system automatically falls back to client-side storage mode)*.

---

## 🧪 Testing & Verification Checklist

- [x] **Homepage Redirection**: Visiting `/` automatically redirects to `/dashboard` or `/login`.
- [x] **Authentication Flow**: Login with credentials, demo fill, logout, and password recovery.
- [x] **Dashboard Metrics**: Summary cards displaying total students, active count, faculty, classes, and today's attendance rate.
- [x] **Student Management**: Add new student, view student list, search by name/roll number, filter by class/gender/status, and view detailed student profile (`/students/[id]`).
- [x] **Class & Subject Management**: Create classes with capacities, allocate subjects with course codes and credit hours.
- [x] **Attendance Marking**: Single-click Present/Absent/Late toggle matrix for entire classes with date selection and historical attendance viewing.
- [x] **Examinations & Marks**: Schedule exams (Midterm, Final, Quiz), enter marks with bounds checking (0 to Max), and view automated letter grades & GPA.
- [x] **Reports & Exports**: Filtered reports for Enrollment, Academic Performance, Exam Results, and Daily Attendance with clean print stylesheets and CSV downloads.
- [x] **Role-Based Access**: Restrict Users and Settings modules to `admin` role.

---

## 🛠️ Troubleshooting Guide

### 1. `curl` or browser cannot connect to `localhost:3000`
- Make sure `npm run dev` is actively running in a terminal.
- Check if port 3000 is used by another application. Next.js will automatically try port 3001 if 3000 is occupied.

### 2. Changes to students or marks reset when clearing browser data
- This occurs when running in **Demo Mode** (using `localStorage`).
- Connect your Supabase project as described in the [Supabase Cloud Setup](#-supabase-cloud-setup-postgresql-database) section for permanent cloud persistence.

### 3. "Failed to fetch" or Supabase connection errors
- Verify that `NEXT_PUBLIC_SUPABASE_URL` starts with `https://` and has no trailing slash.
- Ensure your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **anon** public key, not the service role key.
- Verify that you executed `supabase/migrations/0001_initial_schema.sql` in your Supabase SQL Editor.

### 4. Build warning: "The 'middleware' file convention is deprecated"
- Next.js 16 introduces an experimental `proxy` convention alias. The existing `middleware.ts` is fully supported and functional across Next.js 15 and 16.

---

## 📄 License

This project is created for educational and academic management purposes. Open source under the MIT License.
