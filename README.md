# PeerLearn — Online Learning Peer Review System

A full-fledged, modern educational SaaS platform built with pure **HTML5, CSS3, and Vanilla JavaScript**. Designed with a subtle 3D educational interface (Blue + Purple + White), soft layered elevations, glass-like elements, and 100% persistent client-side state using `localStorage`.

---

## 🌟 Key Highlights & Features

1. **Zero Framework Dependencies**: Pure Vanilla JavaScript with modular architecture (`storage.js`, `auth.js`, `app.js`, etc.).
2. **Offline-First & Persistent**: All users, course catalogs, syllabus lessons, enrollments, assignment submissions, peer reviews, comments, and notifications are stored in `localStorage`.
3. **Complete Peer Review Workflow**:
   - **Student A** submits assignment with live repo/link and attachment simulation.
   - System automatically evaluates reviewer workloads and assigns an eligible peer or reviewer.
   - **Peer Reviewer (Student B / Reviewer)** receives instant alert and notification.
   - Reviewer opens submission and evaluates it with an interactive 1–5 star rating widget, multi-criteria rubric sliders (Content Quality, Clarity, Creativity, Completeness), and detailed qualitative feedback (Strengths, Improvements, General Assessment).
   - Reviewer submits review.
   - **Student A** receives real-time notification, views rubric scorecard and detailed comments, and their course progress updates dynamically!
4. **Interactive Discussion Thread**: Submissions include live comment threads where students and reviewers can ask clarifying questions, reply, and delete comments.
5. **Role-Based Access Control**:
   - **Student**: Browse/search/filter courses, enroll, access learning content, mark lessons completed, submit assignments, evaluate peer submissions, view progress metrics.
   - **Reviewer**: View assigned peer submissions, score rubrics, provide feedback, track completed reviews.
   - **Admin**: System-wide dashboard with KPIs, User Management (search/filter/change role/delete), Course Management (create/edit/delete), Lesson Management (add/delete), and Review Moderation.
6. **Instant Demo Role Switcher**: A convenient quick-switch bar in the top navigation allows switching between Student, Reviewer, and Admin profiles in a single click for testing.
7. **Responsive & 3D SaaS UI**: Works on Mobile, Tablet, Laptop, and Desktop screens with an off-canvas navigation drawer, tactile button presses, and smooth animations.

---

## 📂 Project Structure

```
PeerLearn/
├── index.html              # Marketing Landing Page with 3D cards & workflow preview
├── login.html              # Authentication Login with 1-click Demo credentials
├── register.html           # Full user registration with role picker & validation
├── dashboard.html          # Student & Reviewer dashboard with 3D KPIs, active courses & tasks
├── courses.html            # Course catalog with instant search, category & difficulty filters
├── course-details.html     # Course syllabus, instructor profile, assignments & enrollment
├── content.html            # Interactive learning player with lesson completion tracking
├── assignments.html        # Assignment list with status badges & filter controls
├── submission.html         # Assignment submission form, project view & peer review feedback
├── reviews.html            # Peer evaluation center (Pending, Completed, Received tabs)
├── review-details.html     # Multi-criteria rubric review form with 5-star ratings
├── progress.html           # Dedicated analytics with circular SVG progress meter & milestones
├── notifications.html      # Notification center with mark-as-read and filter controls
├── profile.html            # User account settings, avatar picker, and password change
├── admin.html              # Admin Control Center (User, Course, Content & Review CRUD)
│
├── css/
│   ├── style.css           # Core design system, variables, 3D shadows, sidebar & layout
│   ├── components.css      # Reusable 3D cards, star ratings, rubric sliders, modals, toasts
│   └── responsive.css      # Breakpoints for mobile drawer, tablet & desktop grids
│
├── js/
│   ├── storage.js          # LocalStorage database, seed data, auto-assigner & toasts
│   ├── auth.js             # Session management, route protection guards & demo switcher
│   ├── app.js              # Shared app shell (Sidebar & Topbar injection, search, modals)
│   ├── courses.js          # Catalog filters, search, enrollment & syllabus rendering
│   ├── content.js          # Lesson viewer, markdown text formatter & progress toggling
│   ├── assignments.js      # Assignment submission, editing & discussion comments
│   ├── reviews.js          # Rubric evaluation form, star rating logic & review submission
│   ├── progress.js         # Circular SVG progress calculation & achievement badges
│   ├── notifications.js    # Notification manager with live badges & counters
│   ├── profile.js          # User profile editing, avatar presets & password updates
│   └── admin.js            # Admin management tables, course/lesson modals & moderation
│
└── assets/
    └── images/             # Vector icons and fallback SVG illustrations
```

---

## 🚀 How to Run the Application

Because this application uses standard HTML5, CSS3, and Vanilla JavaScript with `localStorage`, you can run it in any modern browser:

### Option A: Open directly in your browser
1. Open File Explorer and navigate to `PeerLearn/`.
2. Double-click `index.html` to open it in Chrome, Edge, Firefox, or Safari.

### Option B: Using a local web server (Recommended)
You can serve the directory using Python or VS Code Live Server:
```bash
# In PowerShell or Terminal:
cd PeerLearn
python -m http.server 8000
```
Then visit: `http://localhost:8000`

---

## 🔑 Pre-Seeded Demo Accounts

The application automatically initializes realistic demo data on first load. You can sign in using these accounts or click the **One-Click Demo buttons** on `login.html`:

| Role | Name | Email | Password |
|---|---|---|---|
| **Student** | Alex Morgan | `student@example.com` | `student123` |
| **Reviewer** | Dr. Sarah Chen | `reviewer@example.com` | `reviewer123` |
| **Admin** | Prof. David Miller | `admin@example.com` | `admin123` |
| **Peer Student** | Emily Watson | `emily@example.com` | `emily123` |
| **Peer Student** | Marcus Johnson | `marcus@example.com` | `marcus123` |

---

## 🧪 Testing the Complete Workflow

To experience the full peer evaluation cycle:

1. **Sign in as Student (Alex Morgan)**:
   - Go to `dashboard.html`. Notice you have 1 pending peer review assigned.
   - Click **Peer Reviews** in the sidebar.
   - Click **Start Peer Evaluation** on Emily Watson's submission for *"Responsive 3D Education SaaS Landing Page"*.
   - Rate the work using the 5-star selector and the rubric criteria (Quality, Clarity, Creativity, Completeness).
   - Type constructive feedback (Strengths, Improvements, General Assessment) and click **Submit Completed Review**.
   - Review moves to the **Completed Reviews** tab!

2. **Submit a New Assignment as a Student**:
   - Go to **Assignments** (`assignments.html`).
   - Click **Submit Assignment** on *"Global Energy Consumption EDA & Predictions"*.
   - Fill in your project link (e.g. `https://github.com/alexmorgan/energy-eda`) and description.
   - Click **Submit for Peer Review**.
   - Notice the system automatically assigns the submission to another reviewer/peer and creates a confirmation notification.

3. **Check Learning Content & Progress**:
   - Go to **Learning Content** (`content.html`).
   - Click **Mark as Complete** on Lesson 4.
   - Watch the progress bar advance from 60% to 80%!
   - Open **Progress** (`progress.html`) to see the circular SVG mastery ring and activity statistics dynamically update.

4. **Switch to Admin (`admin.html`)**:
   - Click **Admin** in the demo role switcher at the top right.
   - View system statistics (Users, Courses, Submissions, Reviews).
   - Use the **Course Management** tab to create or edit courses.
   - Use the **Content & Lessons** tab to add new syllabus lessons.
   - If you ever want to reset the database to original seeds, click **Reset Demo Database**!
