# Health Habit Tracker

A personal health habit tracking web application built with React and deployed as a static site on GitHub Pages. All data is stored in the browser's `localStorage` — no backend or external services required.

**Live app:** https://gnana-tech-page.github.io/health-habit-tracker/

---

## Features

### Habit Tracking
Log 13 daily habits across four categories every day:

| Category | Habits |
|---|---|
| Morning | Drink Lemon Water, Eat Methi, Morning Walk |
| Fitness | Push Ups (reps), Squats (reps), Plank (seconds) |
| Nutrition | Eating Nuts, Drink 3L Water |
| Mind | Writing, Meditation, Read 10 Pages, Learning |
| Evening | Wake-up time, Sleep time (tracked against a 22:30 target) |

Each day is scored as a percentage of completed habits. A day scoring ≥ 80% counts toward a streak.

### Dashboard
- Today's entry form with toggles, number steppers, and a sleep time picker
- Completion ring showing the week's average
- Current and best streaks (counted on ≥ 80% days)
- Sleep on-time rate
- Average push-ups, squats, and plank time for the week
- Weekly heatmap and bar chart
- Sleep times chart for the week

### History & Reports
- Month navigator with a calendar heatmap (click any day for full details)
- Daily completion % line chart
- Sleep times bar chart with on-time/late colour coding
- Monthly summary table per habit (Done / Missed / % / vs 85% target)
- Download **Weekly** or **Monthly** Excel reports (.xlsx)

### Profile
- Update display name
- Change password (requires current password verification)
- Shows member since date and last login time

---

## Authentication

### Login
- Username + password (no email)
- Usernames are lowercase alphanumeric with underscores (`a–z`, `0–9`, `_`)
- Passwords are hashed with **SHA-256** via the browser's built-in Web Crypto API before being stored — no plaintext passwords are ever written to `localStorage`
- **Account lockout**: 5 consecutive failed attempts locks the account for 15 minutes

### No public registration
There is no `/register` route. New accounts can only be created by an admin from the Admin → Users panel.

### Force password change
When an admin creates a user or resets a password, a `mustChangePassword` flag is set. The user is redirected to a change-password screen on next login.

### Default seed accounts
On first load (empty `localStorage`) the app seeds these accounts automatically:

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | admin |
| `alex_j` | `demo123` | user |
| `priya_s` | `demo123` | user |
| `jordan_l` | `demo123` | user |

Demo users come pre-loaded with 30 days of randomised habit data.

### Legacy migration
If the browser holds data from the older email-based version of the app, it is automatically migrated on startup: email addresses become usernames, known demo passwords are re-hashed, and users with unknown passwords get `mustChangePassword: true`.

---

## Admin Panel

Accessible at `/admin` for users with the `admin` role. Two tabs:

### Overview tab (`/admin`)
- KPI cards: Total Users, Active Today, Avg Weekly Completion, Total Entries
- Leaderboard: all users ranked by this week's completion %, with streak badges
- All-user calendar heatmap for the current month
- Today's habit completion rate bar chart across all users

### Users tab (`/admin/users`)
- Stats row: Total Users, Active Today, New This Week, Admins
- Search by username or display name
- Filter by role (admin / user) and status (active / inactive, based on last login ≤ 7 days)
- Sort by username, creation date, or last login
- Inline edit: display name and role directly in the table
- Action buttons: View detail panel, Edit, Reset Password, Delete
- **Create User** modal: pick username, display name, password, and role
- **Reset Password** modal: sets a new password and forces change on next login
- **User Detail** slide-over: avatar, badges, creation date, last login, login count, habit entries, weekly completion bar, current streak; Reset Password and Delete actions
- Guards: cannot delete your own account; cannot delete the last remaining admin

### Individual User Detail (`/admin/user/:id`)
- Full history view for any user: calendar heatmap, day detail, stats, trend chart
- Download Weekly / Monthly Excel reports for that user

---

## Data Storage

All data lives in `localStorage` under these keys:

| Key | Contents |
|---|---|
| `hht_users` | JSON array of all user accounts |
| `hht_session` | Currently logged-in user ID |
| `hht_habits_<userId>` | JSON array of daily habit entries for that user |
| `hht_lockout_<username>` | Failed login attempt count and timestamp |
| `hht_migrated` | Set to `"true"` after a legacy migration runs |

### User object schema
```json
{
  "id": "uuid",
  "username": "alex_j",
  "displayName": "Alex Johnson",
  "passwordHash": "<sha256-hex>",
  "mustChangePassword": false,
  "role": "user",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastLogin": "2025-06-01T10:30:00.000Z",
  "loginCount": 14,
  "avatarColor": "#0ea5e9"
}
```

### Habit entry schema
```json
{
  "id": "uuid",
  "userId": "uuid",
  "date": "2025-06-01",
  "wakeUpTime": "06:15",
  "drinkLemonWater": true,
  "eatMethi": false,
  "morningWalk": true,
  "pushUps": 30,
  "squats": 40,
  "plank": 60,
  "eatingNuts": true,
  "drink3LWater": true,
  "writing": false,
  "meditation": true,
  "read10Pages": true,
  "learning": true,
  "sleepTime": "22:45",
  "sleepOnTime": false,
  "minsLate": 15
}
```

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| UI framework | React 18 |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 (dark slate theme) |
| Charts | Recharts |
| Excel export | SheetJS (xlsx) + file-saver |
| Icons | Lucide React |
| Date utilities | date-fns |
| Password hashing | Web Crypto API (`crypto.subtle.digest`) |
| Build tool | Vite 5 |
| Deployment | gh-pages → GitHub Pages |

---

## Project Structure

```
src/
├── App.jsx                     # Routes and layout wrappers
├── main.jsx                    # Bootstrap: migration → seed → render
├── index.css                   # Global dark theme + utility classes
│
├── context/
│   ├── AuthContext.jsx          # Login, logout, user CRUD, session
│   └── HabitContext.jsx         # Habit entry read/write for current user
│
├── pages/
│   ├── Login.jsx
│   ├── ChangePassword.jsx
│   ├── Dashboard.jsx
│   ├── History.jsx
│   ├── Profile.jsx
│   └── admin/
│       ├── AdminDashboard.jsx   # Overview + Users tabs
│       └── UserDetail.jsx       # Per-user history view
│
├── components/
│   ├── admin/
│   │   ├── UsersPanel.jsx
│   │   ├── UserDetailPanel.jsx  # Slide-over
│   │   ├── CreateUserModal.jsx
│   │   └── ResetPasswordModal.jsx
│   ├── charts/
│   │   ├── CalendarHeatmap.jsx
│   │   ├── CompletionRing.jsx
│   │   ├── HabitBreakdownChart.jsx
│   │   ├── SleepChart.jsx
│   │   └── WeeklyBarChart.jsx
│   ├── habits/
│   │   ├── HabitEntryForm.jsx
│   │   ├── HabitToggle.jsx
│   │   ├── NumberStepper.jsx
│   │   └── SleepInput.jsx
│   ├── layout/
│   │   ├── Header.jsx           # User dropdown
│   │   ├── Sidebar.jsx
│   │   └── BottomNav.jsx        # Mobile nav
│   └── ui/
│       ├── Avatar.jsx
│       ├── Badge.jsx
│       ├── Card.jsx
│       ├── Modal.jsx
│       ├── Skeleton.jsx
│       └── Toast.jsx
│
└── utils/
    ├── crypto.js               # SHA-256 hash and verify
    ├── init.js                 # Migration and seed on first load
    ├── storage.js              # localStorage read/write helpers
    ├── habitHelpers.js         # Completion scoring, streaks, averages
    └── excelExport.js          # Weekly and monthly .xlsx generation
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173/health-habit-tracker/)
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The `basename` in React Router is set to `/health-habit-tracker` to match the GitHub Pages sub-path. GitHub Pages SPA routing is handled by a `public/404.html` redirect script so that deep links and refreshes work correctly.

---

## Security Notes

- Password hashing uses `crypto.subtle.digest('SHA-256')` — a one-way hash built into every modern browser, requiring no npm dependencies.
- This is **client-side hashing only**. Because all data is in `localStorage`, anyone with physical access to the browser can read the stored hashes. This app is intended for personal use on a trusted device. Do not use it to store sensitive health data on a shared machine.
- For a production app handling sensitive data, use a server-side authentication system with bcrypt or Argon2.
