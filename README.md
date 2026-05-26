# Health Habit Tracker

A personal health habit tracking web app built with React, Firebase, and deployed to GitHub Pages.
Authentication is handled by Google Sign-In. All data is stored in Cloud Firestore — real-time sync across devices.

**Live app:** https://gnana-tech-page.github.io/health-habit-tracker/

---

## Features

### Habit Tracking
Log 13 daily habits across five categories every day:

| Category  | Habits |
|-----------|--------|
| Morning   | Drink Lemon Water, Eat Methi |
| Fitness   | Morning Walk / Workout, Push Ups (reps), Squats (reps), Plank (seconds) |
| Nutrition | Eating Nuts, Drink 3L Water |
| Mind      | Writing, Meditation, Read 10 Pages, Learning |
| Evening   | Wake-up time, Sleep time (tracked against a 22:30 target) |

Each day is scored as a percentage of completed habits. A day scoring ≥ 80% counts toward a streak.

### Dashboard
- Today's entry form with toggles, number steppers, and a sleep time picker
- Debounced auto-save (500 ms) with a "Saving / Saved" indicator
- Completion ring showing the week's average
- Current and best streaks (counted on ≥ 80% days)
- Sleep on-time rate
- Average push-ups, squats, and plank time for the week
- Weekly heatmap and bar chart

### History & Reports
- Month-by-month calendar heatmap
- Daily completion trend chart
- Sleep time bar chart (on-time vs. late)
- Monthly habit summary table
- Download weekly or monthly Excel reports (powered by SheetJS)

### Profile
- Google profile photo and display name
- Account metadata (member since, last login, login count)
- Habit stats: current streak and sleep on-time rate

### Admin Panel _(admin role only)_
- **Overview tab:** Total users, active users, new this week, admins; top users by login count
- **Users tab:** Live table with photo, name, email, role, last login, and status
  - Toggle admin / user role per account
  - Disable / re-enable accounts
  - Click any user to view their full habit history

---

## Authentication

Authentication is 100% handled by **Google Sign-In** (Firebase Authentication).
There are no passwords. Users sign in with their Google account.

### Becoming an admin

On first sign-in, the app checks a Firestore document `adminConfig/roles.adminEmails`.
If the signed-in user's email is listed there, they receive `role: 'admin'` automatically.

**One-time setup in the Firebase Console:**

```
Collection: adminConfig
Document:   roles
Fields:     adminEmails: ["your-email@gmail.com"]
```

---

## Data Architecture

### Firestore structure

```
users/
  {uid}/               ← one doc per Google user
    displayName, email, photoURL
    role: "user" | "admin"
    disabled: false
    createdAt, lastLogin, loginCount

habits/
  {uid}/
    entries/
      {yyyy-MM-dd}/    ← one doc per day per user
        date, drinkLemonWater, eatMethi, morningWalk,
        pushUps, squats, plank, eatingNuts, drink3LWater,
        writing, meditation, read10Pages, learning,
        wakeUpTime, sleepTime, sleepOnTime, minsLate, uid
```

### Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /adminConfig/{doc} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    match /users/{uid} {
      allow read:  if request.auth != null;
      allow write: if request.auth.uid == uid || isAdmin();
    }
    match /habits/{uid}/entries/{date} {
      allow read, write: if request.auth.uid == uid || isAdmin();
    }
  }
}
```

---

## Tech Stack

| Layer       | Technology |
|-------------|-----------|
| Framework   | React 18 + Vite 5 |
| Styling     | Tailwind CSS v3 (dark slate theme) |
| Auth        | Firebase Authentication (Google Sign-In) |
| Database    | Cloud Firestore |
| Charts      | Recharts |
| Excel export| SheetJS (xlsx) |
| Routing     | React Router v6 |
| Deployment  | GitHub Pages via GitHub Actions |

---

## Project Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── UsersPanel.jsx       # Real-time Firestore user table
│   │   └── UserDetailPanel.jsx  # Slide-in user info panel
│   ├── charts/
│   │   ├── CalendarHeatmap.jsx
│   │   ├── CompletionRing.jsx
│   │   ├── HabitBreakdownChart.jsx
│   │   ├── SleepChart.jsx
│   │   └── WeeklyBarChart.jsx
│   ├── habits/
│   │   ├── HabitEntryForm.jsx   # Today's form with auto-save
│   │   ├── HabitToggle.jsx
│   │   ├── NumberStepper.jsx
│   │   └── SleepInput.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── BottomNav.jsx
│   └── ui/
│       ├── Avatar.jsx           # Google photo or initials fallback
│       ├── Badge.jsx
│       ├── Card.jsx
│       └── Toast.jsx
├── context/
│   ├── AuthContext.jsx          # Firebase Auth + Firestore user profiles
│   └── HabitContext.jsx         # Firestore habit entries (real-time + batch)
├── pages/
│   ├── Login.jsx                # Google Sign-In splash
│   ├── Dashboard.jsx
│   ├── History.jsx
│   ├── Profile.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       └── UserDetail.jsx
├── utils/
│   ├── habitHelpers.js          # computeStreak, computeCompletion, etc.
│   └── excelExport.js           # downloadWeeklyReport, downloadMonthlyReport
├── firebase.js                  # Firebase app init (reads VITE_FIREBASE_* env vars)
├── App.jsx
└── main.jsx
```

---

## Local Development

### Prerequisites
- Node.js 18+
- A Firebase project with Authentication (Google provider) and Firestore enabled

### Setup

```bash
git clone https://github.com/gnana-tech-page/health-habit-tracker.git
cd health-habit-tracker
npm install
```

Copy `.env.example` to `.env` and fill in your Firebase project values:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

```bash
npm run dev        # starts at http://localhost:5173/health-habit-tracker/
npm run build      # production build → dist/
npm run preview    # preview the production build locally
```

---

## Deployment (GitHub Actions)

Pushes to `main` automatically trigger a build and deploy to GitHub Pages.
Firebase config is injected at build time from GitHub repository secrets:

| Secret name                       | Value |
|-----------------------------------|-------|
| `VITE_FIREBASE_API_KEY`           | From Firebase Console → Project Settings |
| `VITE_FIREBASE_AUTH_DOMAIN`       | |
| `VITE_FIREBASE_PROJECT_ID`        | |
| `VITE_FIREBASE_STORAGE_BUCKET`    | |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | |
| `VITE_FIREBASE_APP_ID`            | |

Add these in: **GitHub repo → Settings → Secrets and variables → Actions**.
