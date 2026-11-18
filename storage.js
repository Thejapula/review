/**
 * PeerLearn - Storage Management & Mock Database
 * Uses localStorage for full client-side persistence.
 */

const STORAGE_KEYS = {
  USERS: 'PeerLearn_users',
  COURSES: 'PeerLearn_courses',
  LESSONS: 'PeerLearn_lessons',
  ENROLLMENTS: 'PeerLearn_enrollments',
  ASSIGNMENTS: 'PeerLearn_assignments',
  SUBMISSIONS: 'PeerLearn_submissions',
  REVIEWS: 'PeerLearn_reviews',
  COMMENTS: 'PeerLearn_comments',
  NOTIFICATIONS: 'PeerLearn_notifications',
  CURRENT_USER: 'PeerLearn_currentUser'
};

// Generic storage accessors
function getData(key, defaultValue = []) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
    return false;
  }
}

function updateData(key, id, updateObj) {
  const items = getData(key, []);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updateObj, updatedAt: new Date().toISOString() };
    saveData(key, items);
    return items[index];
  }
  return null;
}

function deleteData(key, id) {
  const items = getData(key, []);
  const filtered = items.filter(item => item.id !== id);
  saveData(key, filtered);
  return filtered;
}

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// Global Toast System
function showToast(message, type = 'info') {
  let container = document.getElementById('peerlearn-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'peerlearn-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type} animate-slide-in`;

  const icons = {
    success: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
    error: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
    warning: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
    info: `<svg class="toast-icon" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`
  };

  toast.innerHTML = `
    <div class="toast-content">
      ${icons[type] || icons.info}
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Notification Helper
function createNotification({ userId, title, message, type = 'general', link = '#' }) {
  const notifs = getData(STORAGE_KEYS.NOTIFICATIONS, []);
  const newNotif = {
    id: generateId('notif'),
    userId,
    title,
    message,
    type, // 'enrollment', 'submission', 'review_assigned', 'review_completed', 'comment', 'deadline'
    link,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifs.unshift(newNotif);
  saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
  return newNotif;
}

// Auto Assign Peer Reviewer
function autoAssignPeerReviewer(submissionId) {
  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
  const subIndex = submissions.findIndex(s => s.id === submissionId);
  if (subIndex === -1) return null;

  const submission = submissions[subIndex];
  const users = getData(STORAGE_KEYS.USERS, []);
  const reviews = getData(STORAGE_KEYS.REVIEWS, []);

  // Eligible reviewers: any student (other than the submitter) or reviewer role
  const eligibleReviewers = users.filter(u => 
    u.id !== submission.studentId && 
    (u.role === 'student' || u.role === 'reviewer')
  );

  if (eligibleReviewers.length === 0) return null;

  // Find candidate with lowest pending review workload
  const assignedCounts = {};
  eligibleReviewers.forEach(r => {
    assignedCounts[r.id] = submissions.filter(s => s.assignedReviewerId === r.id && s.status === 'under_review').length;
  });

  eligibleReviewers.sort((a, b) => assignedCounts[a.id] - assignedCounts[b.id]);
  const chosenReviewer = eligibleReviewers[0];

  submission.assignedReviewerId = chosenReviewer.id;
  submission.assignedReviewerName = chosenReviewer.name;
  submission.status = 'under_review';
  submissions[subIndex] = submission;
  saveData(STORAGE_KEYS.SUBMISSIONS, submissions);

  // Notify the assigned reviewer
  createNotification({
    userId: chosenReviewer.id,
    title: 'New Peer Review Assigned',
    message: `You have been assigned to review ${submission.studentName}'s work for "${submission.title}".`,
    type: 'review_assigned',
    link: `review-details.html?submissionId=${submission.id}`
  });

  return chosenReviewer;
}

// Calculate User Progress for a Course
function calculateCourseProgress(userId, courseId) {
  const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []);
  const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);
  if (!enrollment) return 0;

  const lessons = getData(STORAGE_KEYS.LESSONS, []).filter(l => l.courseId === courseId);
  if (lessons.length === 0) return 0;

  const completed = (enrollment.completedLessons || []).length;
  const percentage = Math.round((completed / lessons.length) * 100);
  return Math.min(100, Math.max(0, percentage));
}

// Calculate Overall User Progress across all enrolled courses
function calculateOverallProgress(userId) {
  const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []).filter(e => e.userId === userId);
  if (enrollments.length === 0) return 0;

  let totalPercent = 0;
  enrollments.forEach(e => {
    totalPercent += calculateCourseProgress(userId, e.courseId);
  });

  return Math.round(totalPercent / enrollments.length);
}

// ==========================================
// SEED INITIALIZATION DATA
// ==========================================
function initSeedData() {
  // If users already exist, don't overwrite unless explicitly forced
  if (localStorage.getItem(STORAGE_KEYS.USERS)) {
    return;
  }

  // 1. Initial Users
  const users = [
    {
      id: 'usr_student_1',
      name: 'Alex Morgan',
      email: 'student@example.com',
      password: 'student123',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      bio: 'Undergraduate Computer Science student passionate about full-stack web architectures and UI design.',
      title: 'Full Stack Student',
      createdAt: '2026-10-01T08:00:00Z'
    },
    {
      id: 'usr_student_2',
      name: 'Emily Watson',
      email: 'emily@example.com',
      password: 'emily123',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      bio: 'Frontend enthusiast exploring responsive micro-interactions, CSS 3D visuals, and human-computer interaction.',
      title: 'UI Engineering Learner',
      createdAt: '2026-10-05T09:30:00Z'
    },
    {
      id: 'usr_student_3',
      name: 'Marcus Johnson',
      email: 'marcus@example.com',
      password: 'marcus123',
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      bio: 'Aspiring AI engineer learning machine learning pipelines and mathematical data modeling.',
      title: 'Data Science Apprentice',
      createdAt: '2026-10-10T11:00:00Z'
    },
    {
      id: 'usr_reviewer_1',
      name: 'Dr. Sarah Chen',
      email: 'reviewer@example.com',
      password: 'reviewer123',
      role: 'reviewer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      bio: 'Senior Technical Evaluator & CS Mentor. Reviewing code quality, architectural clarity, and web standards.',
      title: 'Senior Peer Reviewer & Mentor',
      createdAt: '2026-09-01T08:00:00Z'
    },
    {
      id: 'usr_admin_1',
      name: 'Prof. David Miller',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      bio: 'Lead Platform Administrator for PeerLearn. Managing university curricula, faculty evaluations, and system integrity.',
      title: 'Lead Academic Director & Admin',
      createdAt: '2026-08-15T08:00:00Z'
    }
  ];

  // 2. Initial Courses
  const courses = [
    {
      id: 'crs_web_dev',
      title: 'Modern Full-Stack Web Development',
      description: 'Master HTML5 semantic standards, pure CSS 3D cards, modern ES6+ JavaScript, responsive layouts, and state management.',
      instructor: 'Dr. Sarah Chen',
      category: 'Web Development',
      difficulty: 'Intermediate',
      duration: '8 Weeks',
      studentsCount: 156,
      rating: 4.9,
      badge: 'Popular',
      color: 'blue',
      icon: 'code',
      image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=600&q=80',
      createdAt: '2026-09-10T00:00:00Z'
    },
    {
      id: 'crs_python_ai',
      title: 'Python for Data Science & AI',
      description: 'Explore Python foundations, NumPy arrays, Pandas analytics, data visualization, and real-world machine learning models.',
      instructor: 'Prof. David Miller',
      category: 'Artificial Intelligence',
      difficulty: 'Beginner',
      duration: '6 Weeks',
      studentsCount: 224,
      rating: 4.8,
      badge: 'Bestseller',
      color: 'purple',
      icon: 'cpu',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      createdAt: '2026-09-12T00:00:00Z'
    },
    {
      id: 'crs_dsa',
      title: 'Data Structures & Algorithmic Thinking',
      description: 'Deep dive into arrays, linked lists, trees, graphs, sorting heuristics, dynamic programming, and Big-O efficiency analysis.',
      instructor: 'Dr. Alan Turing',
      category: 'Data Structures',
      difficulty: 'Advanced',
      duration: '10 Weeks',
      studentsCount: 112,
      rating: 4.7,
      badge: 'Essential',
      color: 'indigo',
      icon: 'database',
      image: 'https://images.unsplash.com/photo-1516116211227-bbc13c7293b6?auto=format&fit=crop&w=600&q=80',
      createdAt: '2026-09-15T00:00:00Z'
    },
    {
      id: 'crs_ui_ux',
      title: 'UI/UX & 3D Interactive Design Thinking',
      description: 'Create intuitive user experiences, accessibility standards, glassmorphism aesthetics, soft 3D visual hierarchy, and SaaS design.',
      instructor: 'Elena Rostova',
      category: 'Design Thinking',
      difficulty: 'Beginner',
      duration: '5 Weeks',
      studentsCount: 138,
      rating: 4.9,
      badge: 'Hot',
      color: 'pink',
      icon: 'layers',
      image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80',
      createdAt: '2026-09-18T00:00:00Z'
    },
    {
      id: 'crs_js_deep',
      title: 'JavaScript Deep Dive: Async & Architecture',
      description: 'Master the event loop, Promises, Async/Await patterns, closures, prototypes, event delegation, and scalable client modules.',
      instructor: 'Dr. Sarah Chen',
      category: 'JavaScript',
      difficulty: 'Intermediate',
      duration: '6 Weeks',
      studentsCount: 95,
      rating: 4.8,
      badge: 'Advanced',
      color: 'cyan',
      icon: 'zap',
      image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80',
      createdAt: '2026-09-22T00:00:00Z'
    },
    {
      id: 'crs_python_core',
      title: 'Python Programming Masterclass',
      description: 'From syntax to object-oriented programming, file I/O, error handling, generator expressions, and automated testing suites.',
      instructor: 'Marcus Vance',
      category: 'Python',
      difficulty: 'Beginner',
      duration: '7 Weeks',
      studentsCount: 180,
      rating: 4.6,
      badge: 'Foundations',
      color: 'emerald',
      icon: 'terminal',
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
      createdAt: '2026-09-25T00:00:00Z'
    }
  ];

  // 3. Lessons for Courses
  const lessons = [
    // Web Dev Lessons
    {
      id: 'lsn_wd_1',
      courseId: 'crs_web_dev',
      title: 'Semantic HTML5 Architecture & Document Outlines',
      duration: '20 min',
      type: 'text',
      order: 1,
      summary: 'Learn how to construct accessible, semantic web layouts using header, nav, main, article, section, and aside tags.',
      content: `### Why Semantic HTML Matters
Semantic HTML tags provide precise meaning to both web browsers and assistive technologies. Instead of generic \`<div>\` containers, standard elements communicate document structure:

- **\`<header>\`**: Defines mastheads, banners, and primary branding.
- **\`<nav>\`**: Encapsulates primary navigation menus and breadcrumb trails.
- **\`<main>\`**: Holds the central, unique content of the page (strictly once per document).
- **\`<article>\`**: Encapsulates self-contained compositions (blog posts, review cards, products).
- **\`<section>\`**: Represents a thematic grouping of content with a heading.
- **\`<aside>\`**: Complementary information like sidebars and callouts.

\`\`\`html
<main>
  <article class="review-card">
    <header>
      <h3>Peer Review: Project Alpha</h3>
      <span class="badge">Reviewed</span>
    </header>
    <p>Clean implementation of semantic layouts.</p>
  </article>
</main>
\`\`\`

#### Key Takeaway
Clean semantic markup significantly enhances SEO rankings, screen reader usability, and readability for peer reviewers.`,
      resources: [
        { title: 'HTML5 Semantic Tag Cheat Sheet.pdf', size: '1.4 MB' },
        { title: 'Semantic Boilerplate.zip', size: '320 KB' }
      ]
    },
    {
      id: 'lsn_wd_2',
      courseId: 'crs_web_dev',
      title: 'Modern CSS3: Flexbox, Grid, & Soft 3D Elevation',
      duration: '28 min',
      type: 'video',
      order: 2,
      summary: 'Build clean SaaS card grids with layered drop shadows, subtle perspective transforms, and responsive auto-fit columns.',
      content: `### Mastering 3D Elevation & Soft Shadows
Modern SaaS interfaces make use of layered multi-stop box shadows to convey depth and physical hierarchy without heavy gradients.

#### The 3D Card Formula:
1. **Light Border & Ambient Lighting**: \`border: 1px solid rgba(226, 232, 240, 0.8);\`.
2. **Layered Shadows**: Combining a close contact shadow with a wider ambient diffusion:
\`\`\`css
.card-3d {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 
    0 10px 25px -5px rgba(37, 99, 235, 0.08),
    0 8px 10px -6px rgba(0, 0, 0, 0.04);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
}

.card-3d:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 35px -10px rgba(37, 99, 235, 0.16),
    0 12px 16px -6px rgba(124, 58, 237, 0.1);
}
\`\`\`

Explore this in your browser inspector and test differing ambient light colors.`,
      resources: [
        { title: 'CSS 3D Shadows & Layering Guide.pdf', size: '2.1 MB' }
      ]
    },
    {
      id: 'lsn_wd_3',
      courseId: 'crs_web_dev',
      title: 'Vanilla JavaScript ES6+: DOM, Events & Modals',
      duration: '35 min',
      type: 'text',
      order: 3,
      summary: 'Handle user interactions, event delegation, dynamic template rendering, and keyboard-accessible modal dialogs.',
      content: `### DOM Manipulation Without Frameworks
Writing vanilla JavaScript gives deep control over execution flow and performance.

#### Event Delegation Example:
\`\`\`javascript
document.querySelector('.card-container').addEventListener('click', (event) => {
  const btn = event.target.closest('.btn-review');
  if (btn) {
    const submissionId = btn.dataset.id;
    openReviewModal(submissionId);
  }
});
\`\`\`

#### Key Practices:
- Always use \`addEventListener\` instead of inline HTML handlers.
- Cache DOM selector lookups when looping.
- Leverage \`dataset\` attributes to transport IDs and metadata cleanly.`,
      resources: [
        { title: 'Vanilla JS DOM Masterclass.pdf', size: '1.8 MB' }
      ]
    },
    {
      id: 'lsn_wd_4',
      courseId: 'crs_web_dev',
      title: 'Client-Side Persistence with localStorage',
      duration: '22 min',
      type: 'text',
      order: 4,
      summary: 'Structure complex relational records (users, courses, reviews) using JSON serialization and safe error handling.',
      content: `### Local Storage Design Principles
localStorage provides synchronous key-value storage up to 5MB. By standardizing keys and serializing with JSON, we can build fully offline-capable educational applications.

\`\`\`javascript
function saveSubmissions(list) {
  try {
    localStorage.setItem('PeerLearn_submissions', JSON.stringify(list));
  } catch (e) {
    console.error('Storage quota exceeded or private mode error', e);
  }
}
\`\`\`

All operations must be wrapped in safe parser fallbacks to avoid unhandled runtime exceptions.`,
      resources: [
        { title: 'Offline Storage Architecture.pdf', size: '950 KB' }
      ]
    },
    {
      id: 'lsn_wd_5',
      courseId: 'crs_web_dev',
      title: 'Designing The Peer Review Workflow',
      duration: '30 min',
      type: 'video',
      order: 5,
      summary: 'Step-by-step design of rubric evaluation, 5-star scoring algorithms, and automated reviewer assignment pipelines.',
      content: `### The Peer Evaluation Cycle
A peer evaluation system succeeds when students engage in balanced, multi-dimensional feedback:
1. **Rubric Criteria**: Evaluate Content Quality, Clarity, Creativity, and Completeness separately.
2. **Formative Feedback**: Identifying Strengths builds confidence; pinpointing concrete Improvements fosters rapid growth.
3. **Double Blind / Fair Distribution**: Workload balancing ensures every student receives timely evaluation.`,
      resources: [
        { title: 'Peer Review Rubric Specification.pdf', size: '1.1 MB' }
      ]
    },

    // Python AI Lessons
    {
      id: 'lsn_py_1',
      courseId: 'crs_python_ai',
      title: 'Python Core Syntax, List Comprehensions & Dictionaries',
      duration: '25 min',
      type: 'text',
      order: 1,
      summary: 'Data structures, generators, list comprehensions, and clean functional programming patterns in Python 3.12.',
      content: `### Modern Python Essentials
Python combines rapid expressiveness with high-performance C bindings.

\`\`\`python
# Vectorized score normalization
raw_scores = [78, 92, 85, 96, 64]
normalized = [round((score - min(raw_scores)) / (max(raw_scores) - min(raw_scores)), 2) for score in raw_scores]
print(normalized)
\`\`\`

Learn how dictionaries and sets provide $O(1)$ constant time membership checking.`,
      resources: [
        { title: 'Python 3 Modern Reference.pdf', size: '3.2 MB' }
      ]
    },
    {
      id: 'lsn_py_2',
      courseId: 'crs_python_ai',
      title: 'NumPy Vectorization & Multi-Dimensional Arrays',
      duration: '30 min',
      type: 'video',
      order: 2,
      summary: 'Master N-dimensional arrays, matrix operations, broadcasting rules, and numerical computing efficiency.',
      content: `### High-Performance Arrays
NumPy arrays eliminate Python loop overhead by keeping homogenous data in contiguous blocks of memory with SIMD vectorization.`,
      resources: [
        { title: 'NumPy Cheat Sheet.pdf', size: '890 KB' }
      ]
    },
    {
      id: 'lsn_py_3',
      courseId: 'crs_python_ai',
      title: 'Pandas DataFrames & Exploratory Data Analysis',
      duration: '40 min',
      type: 'text',
      order: 3,
      summary: 'Ingesting datasets, handling missing values, grouped aggregations, and exploratory data reporting.',
      content: `### Exploratory Analysis
Use Pandas \`groupby\` and \`agg\` to compute statistical peer review percentiles across cohorts.`,
      resources: [
        { title: 'Pandas Data Analysis Guide.pdf', size: '2.4 MB' }
      ]
    },

    // UI/UX Lessons
    {
      id: 'lsn_ui_1',
      courseId: 'crs_ui_ux',
      title: 'Design Systems & 3D Visual Hierarchy in Modern SaaS',
      duration: '24 min',
      type: 'text',
      order: 1,
      summary: 'Typography scale, 8px spacing systems, harmonious color theory (Blue/Purple SaaS themes), and soft 3D elevation.',
      content: `### SaaS Aesthetics in 2026
Clean educational platforms balance clarity with tactile delight:
- **Primary Blue (\`#2563eb\`)**: Signifies trust, intellect, and technical authority.
- **Secondary Purple (\`#7c3aed\`)**: Inspires creativity, achievement, and premium quality.
- **Glassmorphism**: Soft background blur with high contrast text.`,
      resources: [
        { title: 'PeerLearn Design Tokens.pdf', size: '1.5 MB' }
      ]
    }
  ];

  // 4. Enrollments (Alex is enrolled in crs_web_dev and crs_python_ai)
  const enrollments = [
    {
      id: 'enr_alex_wd',
      userId: 'usr_student_1',
      courseId: 'crs_web_dev',
      enrolledAt: '2026-10-18T10:00:00Z',
      completedLessons: ['lsn_wd_1', 'lsn_wd_2', 'lsn_wd_3'], // 3 of 5 completed = 60%
      completed: false
    },
    {
      id: 'enr_alex_py',
      userId: 'usr_student_1',
      courseId: 'crs_python_ai',
      enrolledAt: '2026-10-20T14:00:00Z',
      completedLessons: ['lsn_py_1'], // 1 of 3 = 33%
      completed: false
    },
    {
      id: 'enr_emily_wd',
      userId: 'usr_student_2',
      courseId: 'crs_web_dev',
      enrolledAt: '2026-10-19T11:00:00Z',
      completedLessons: ['lsn_wd_1', 'lsn_wd_2', 'lsn_wd_3', 'lsn_wd_4'],
      completed: false
    },
    {
      id: 'enr_marcus_py',
      userId: 'usr_student_3',
      courseId: 'crs_python_ai',
      enrolledAt: '2026-10-21T09:00:00Z',
      completedLessons: ['lsn_py_1', 'lsn_py_2'],
      completed: false
    }
  ];

  // 5. Assignments
  const assignments = [
    {
      id: 'asg_wd_portfolio',
      courseId: 'crs_web_dev',
      courseTitle: 'Modern Full-Stack Web Development',
      title: 'Responsive 3D Education SaaS Landing Page',
      description: 'Design and build a responsive educational SaaS landing page featuring clean semantic HTML5, pure CSS3 soft 3D cards, responsive navigation, and interactive modal previews.',
      instructions: `1. Structure with semantic tags (<header>, <nav>, <main>, <section>, <footer>).\n2. Implement a 3D soft card grid with hover elevation.\n3. Add an interactive modal preview or drawer.\n4. Ensure 100% responsiveness on mobile, tablet, and desktop.\n5. Host code on GitHub/CodePen and submit link.`,
      deadline: '2026-12-15T23:59:59Z',
      maxScore: 100,
      rubric: [
        { criterion: 'Content Quality', weight: '25%', desc: 'Semantic tags, clean indentation, well-structured DOM' },
        { criterion: 'Clarity & Documentation', weight: '25%', desc: 'Clear README, commented CSS, readable variables' },
        { criterion: 'Creativity & Aesthetics', weight: '25%', desc: 'Subtle 3D effects, color harmonies, micro-interactions' },
        { criterion: 'Completeness & Functionality', weight: '25%', desc: 'Responsive breakpoints, working buttons, no console bugs' }
      ],
      createdAt: '2026-10-20T00:00:00Z'
    },
    {
      id: 'asg_wd_dashboard',
      courseId: 'crs_web_dev',
      courseTitle: 'Modern Full-Stack Web Development',
      title: 'Interactive Client-Side Analytics Dashboard',
      description: 'Develop a persistent learning dashboard with local storage, dynamic charts, task checklists, and role-based views.',
      instructions: `1. Implement modular Vanilla JS structure.\n2. Store metrics in localStorage.\n3. Provide responsive data cards and filterable tables.`,
      deadline: '2026-12-28T23:59:59Z',
      maxScore: 100,
      rubric: [
        { criterion: 'Content Quality', weight: '25%', desc: 'Architecture modularity and separation of concerns' },
        { criterion: 'Clarity & Documentation', weight: '25%', desc: 'Readable code, clear state keys' },
        { criterion: 'Creativity & Aesthetics', weight: '25%', desc: 'Visual charts, clean layout' },
        { criterion: 'Completeness & Functionality', weight: '25%', desc: 'Error-free storage persistence' }
      ],
      createdAt: '2026-10-25T00:00:00Z'
    },
    {
      id: 'asg_py_eda',
      courseId: 'crs_python_ai',
      courseTitle: 'Python for Data Science & AI',
      title: 'Global Energy Consumption EDA & Predictions',
      description: 'Conduct exploratory data analysis on a global renewable energy dataset using Pandas, NumPy, and Matplotlib. Calculate correlation matrices and trend summaries.',
      instructions: `1. Clean missing records and normalize data.\n2. Visualize top 5 growth nations in renewable adoption.\n3. Write a 500-word analytical summary of key findings.`,
      deadline: '2026-12-20T23:59:59Z',
      maxScore: 100,
      rubric: [
        { criterion: 'Content Quality', weight: '25%', desc: 'Data cleaning rigor and numerical correctness' },
        { criterion: 'Clarity & Documentation', weight: '25%', desc: 'Notebook commentary and labeled charts' },
        { criterion: 'Creativity & Aesthetics', weight: '25%', desc: 'Novel visualizations and insight depth' },
        { criterion: 'Completeness & Functionality', weight: '25%', desc: 'Reproducible script execution' }
      ],
      createdAt: '2026-10-28T00:00:00Z'
    }
  ];

  // 6. Submissions
  // Note:
  // - sub_emily_1 is Emily's submission, ASSIGNED TO Alex Morgan (student) for peer review!
  // - sub_alex_1 is Alex's submission, already reviewed by Dr. Sarah Chen (reviewer)!
  // - sub_marcus_1 is Marcus's submission, assigned to Dr. Sarah Chen for review!
  const submissions = [
    {
      id: 'sub_emily_1',
      assignmentId: 'asg_wd_portfolio',
      assignmentTitle: 'Responsive 3D Education SaaS Landing Page',
      courseId: 'crs_web_dev',
      courseTitle: 'Modern Full-Stack Web Development',
      studentId: 'usr_student_2',
      studentName: 'Emily Watson',
      studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      title: 'EduSphere - Modern Learning Landing Platform',
      description: 'Built a sleek educational marketing showcase featuring pure CSS 3D cards, isometric course badges, a responsive mobile drawer, and keyboard accessible accordions.',
      submissionLink: 'https://github.com/emilywatson/edusphere-showcase',
      fileName: 'edusphere_complete_project.zip',
      fileSize: '2.8 MB',
      submittedAt: '2026-11-12T14:30:00Z',
      status: 'under_review',
      assignedReviewerId: 'usr_student_1', // Alex Morgan is assigned to review this!
      assignedReviewerName: 'Alex Morgan'
    },
    {
      id: 'sub_alex_1',
      assignmentId: 'asg_wd_dashboard',
      assignmentTitle: 'Interactive Client-Side Analytics Dashboard',
      courseId: 'crs_web_dev',
      courseTitle: 'Modern Full-Stack Web Development',
      studentId: 'usr_student_1',
      studentName: 'Alex Morgan',
      studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      title: 'LearnPulse - Dynamic Student Dashboard with LocalStorage',
      description: 'Created an offline-first learning progress portal with responsive 3D statistic cards, live task filters, localStorage sync, and SVG progress rings.',
      submissionLink: 'https://github.com/alexmorgan/learnpulse-dashboard',
      fileName: 'learnpulse_dashboard_v1.zip',
      fileSize: '3.6 MB',
      submittedAt: '2026-11-08T10:15:00Z',
      status: 'reviewed', // Already evaluated by reviewer!
      assignedReviewerId: 'usr_reviewer_1',
      assignedReviewerName: 'Dr. Sarah Chen'
    },
    {
      id: 'sub_marcus_1',
      assignmentId: 'asg_py_eda',
      assignmentTitle: 'Global Energy Consumption EDA & Predictions',
      courseId: 'crs_python_ai',
      courseTitle: 'Python for Data Science & AI',
      studentId: 'usr_student_3',
      studentName: 'Marcus Johnson',
      studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      title: 'Renewable Power Shift: 2010-2026 Transition Metrics',
      description: 'Comprehensive exploratory data analysis examining wind, solar, and hydro generation trends across 45 countries with normalized growth charts.',
      submissionLink: 'https://github.com/marcusj/renewable-eda-notebooks',
      fileName: 'renewable_energy_eda.ipynb',
      fileSize: '4.2 MB',
      submittedAt: '2026-11-14T09:00:00Z',
      status: 'under_review',
      assignedReviewerId: 'usr_reviewer_1',
      assignedReviewerName: 'Dr. Sarah Chen'
    }
  ];

  // 7. Reviews (Dr. Sarah Chen reviewed Alex's submission)
  const reviews = [
    {
      id: 'rev_alex_sub1',
      submissionId: 'sub_alex_1',
      assignmentId: 'asg_wd_dashboard',
      assignmentTitle: 'Interactive Client-Side Analytics Dashboard',
      studentId: 'usr_student_1',
      studentName: 'Alex Morgan',
      reviewerId: 'usr_reviewer_1',
      reviewerName: 'Dr. Sarah Chen',
      reviewerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      reviewerRole: 'reviewer',
      overallRating: 5,
      ratings: {
        quality: 5,
        clarity: 5,
        creativity: 4,
        completeness: 5
      },
      feedback: {
        strengths: 'Outstanding architecture! The separation of concerns between storage keys and UI rendering functions is exemplary. The 3D cards have just the right amount of subtle lift without causing layout shifts.',
        improvements: 'Consider adding keyboard shortcuts (e.g., ESC to close modal, Enter to submit forms) to reach WCAG AAA accessibility compliance.',
        general: 'Truly exceptional work, Alex. This implementation demonstrates production-ready code habits and great attention to visual SaaS polish.'
      },
      status: 'completed',
      reviewedAt: '2026-11-10T16:20:00Z'
    }
  ];

  // 8. Comments
  const comments = [
    {
      id: 'cmt_1',
      submissionId: 'sub_alex_1',
      userId: 'usr_reviewer_1',
      userName: 'Dr. Sarah Chen',
      userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
      userRole: 'reviewer',
      text: 'Great work on the localStorage exception handling! That ensures private browsing sessions don’t crash.',
      createdAt: '2026-11-10T16:25:00Z',
      parentId: null
    },
    {
      id: 'cmt_2',
      submissionId: 'sub_alex_1',
      userId: 'usr_student_1',
      userName: 'Alex Morgan',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      userRole: 'student',
      text: 'Thank you Dr. Chen! I will definitely incorporate keyboard shortcuts into the next iteration.',
      createdAt: '2026-11-10T17:00:00Z',
      parentId: 'cmt_1'
    },
    {
      id: 'cmt_3',
      submissionId: 'sub_emily_1',
      userId: 'usr_student_2',
      userName: 'Emily Watson',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      userRole: 'student',
      text: 'Looking forward to peer feedback! Please check out the 3D card hover states in the hero preview section.',
      createdAt: '2026-11-12T14:45:00Z',
      parentId: null
    }
  ];

  // 9. Initial Notifications
  const notifications = [
    {
      id: 'ntf_alex_1',
      userId: 'usr_student_1',
      title: 'New Peer Review Assigned!',
      message: 'You have been assigned to evaluate Emily Watson’s submission for "Responsive 3D Education SaaS Landing Page".',
      type: 'review_assigned',
      link: 'review-details.html?submissionId=sub_emily_1',
      read: false,
      createdAt: '2026-11-12T14:35:00Z'
    },
    {
      id: 'ntf_alex_2',
      userId: 'usr_student_1',
      title: 'Peer Review Completed! ★★★★★',
      message: 'Dr. Sarah Chen completed the evaluation of your assignment "Interactive Client-Side Analytics Dashboard".',
      type: 'review_completed',
      link: 'submission.html?assignmentId=asg_wd_dashboard',
      read: false,
      createdAt: '2026-11-10T16:22:00Z'
    },
    {
      id: 'ntf_alex_3',
      userId: 'usr_student_1',
      title: 'Course Enrolled Successfully',
      message: 'You successfully enrolled in "Modern Full-Stack Web Development". Happy learning!',
      type: 'enrollment',
      link: 'course-details.html?id=crs_web_dev',
      read: true,
      createdAt: '2026-10-18T10:01:00Z'
    },
    {
      id: 'ntf_reviewer_1',
      userId: 'usr_reviewer_1',
      title: 'New Submission for Evaluation',
      message: 'Marcus Johnson submitted "Global Energy Consumption EDA & Predictions" for review.',
      type: 'review_assigned',
      link: 'review-details.html?submissionId=sub_marcus_1',
      read: false,
      createdAt: '2026-11-14T09:05:00Z'
    }
  ];

  // Save all to localStorage
  saveData(STORAGE_KEYS.USERS, users);
  saveData(STORAGE_KEYS.COURSES, courses);
  saveData(STORAGE_KEYS.LESSONS, lessons);
  saveData(STORAGE_KEYS.ENROLLMENTS, enrollments);
  saveData(STORAGE_KEYS.ASSIGNMENTS, assignments);
  saveData(STORAGE_KEYS.SUBMISSIONS, submissions);
  saveData(STORAGE_KEYS.REVIEWS, reviews);
  saveData(STORAGE_KEYS.COMMENTS, comments);
  saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);

  // Set default logged-in user to Alex Morgan (Student) for immediate out-of-the-box readiness
  saveData(STORAGE_KEYS.CURRENT_USER, users[0]);
  console.log('PeerLearn: Seed database successfully initialized.');
}

// Reset data to seed state (useful for testing & demo reset)
function resetStorageToDefault() {
  localStorage.clear();
  initSeedData();
  showToast('Database reset to default demo seed data!', 'success');
  setTimeout(() => window.location.reload(), 800);
}

// Auto-run initialization on script load
initSeedData();
