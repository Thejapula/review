/**
 * PeerLearn - Global Application Controller & Shared UI
 */

const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  myCourses: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
  browseCourses: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
  content: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  assignments: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  reviews: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  progress: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  notifications: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  admin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`
};

// Render consistent sidebar and topbar
function renderAppShell(activeKey = '') {
  const user = getCurrentUser();
  const sidebarContainer = document.getElementById('sidebar-container');
  const topbarContainer = document.getElementById('topbar-container');

  if (!sidebarContainer || !user) return;

  // Unread notification count for user
  const notifs = getData(STORAGE_KEYS.NOTIFICATIONS, []);
  const userUnread = notifs.filter(n => n.userId === user.id && !n.read).length;

  // Pending reviews count
  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
  const pendingReviewsCount = submissions.filter(s => s.assignedReviewerId === user.id && s.status === 'under_review').length;

  // Sidebar HTML
  sidebarContainer.innerHTML = `
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    <aside class="app-sidebar" id="appSidebar">
      <div class="sidebar-header">
        <a href="dashboard.html" class="brand-logo">
          <div class="logo-badge">P</div>
          <div>
            <span>PeerLearn</span>
            <div style="font-size: 0.65rem; color: var(--text-muted); font-weight: 500; margin-top: -2px;">Online Peer Review</div>
          </div>
        </a>
      </div>

      <div class="sidebar-role-indicator">
        <span class="role-badge role-${user.role}">
          <span style="font-size: 0.7rem;">●</span> ${user.role}
        </span>
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Active Mode</span>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Main Menu</div>
        <a href="dashboard.html" class="sidebar-link ${activeKey === 'dashboard' ? 'active' : ''}">
          ${ICONS.dashboard}
          <span>Dashboard</span>
        </a>
        <a href="courses.html?filter=enrolled" class="sidebar-link ${activeKey === 'my-courses' ? 'active' : ''}">
          ${ICONS.myCourses}
          <span>My Courses</span>
        </a>
        <a href="courses.html" class="sidebar-link ${activeKey === 'courses' ? 'active' : ''}">
          ${ICONS.browseCourses}
          <span>Browse Courses</span>
        </a>
        <a href="content.html" class="sidebar-link ${activeKey === 'content' ? 'active' : ''}">
          ${ICONS.content}
          <span>Learning Content</span>
        </a>

        <div class="nav-section-title">Evaluation & Review</div>
        <a href="assignments.html" class="sidebar-link ${activeKey === 'assignments' ? 'active' : ''}">
          ${ICONS.assignments}
          <span>Assignments</span>
        </a>
        <a href="reviews.html" class="sidebar-link ${activeKey === 'reviews' ? 'active' : ''}">
          ${ICONS.reviews}
          <span>Peer Reviews</span>
          ${pendingReviewsCount > 0 ? `<span class="nav-badge danger">${pendingReviewsCount}</span>` : ''}
        </a>
        <a href="progress.html" class="sidebar-link ${activeKey === 'progress' ? 'active' : ''}">
          ${ICONS.progress}
          <span>Progress</span>
        </a>
        <a href="notifications.html" class="sidebar-link ${activeKey === 'notifications' ? 'active' : ''}">
          ${ICONS.notifications}
          <span>Notifications</span>
          ${userUnread > 0 ? `<span class="nav-badge">${userUnread}</span>` : ''}
        </a>

        <div class="nav-section-title">Account</div>
        <a href="profile.html" class="sidebar-link ${activeKey === 'profile' ? 'active' : ''}">
          ${ICONS.profile}
          <span>Profile</span>
        </a>

        ${user.role === 'admin' ? `
          <div class="nav-section-title">Administration</div>
          <a href="admin.html" class="sidebar-link ${activeKey === 'admin' ? 'active' : ''}" style="color: #b45309;">
            ${ICONS.admin}
            <span>Admin Panel</span>
          </a>
        ` : ''}

        <a href="javascript:void(0)" onclick="logout()" class="sidebar-link" style="color: var(--accent-rose); margin-top: auto;">
          ${ICONS.logout}
          <span>Logout</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <a href="profile.html" class="user-mini-card">
          <img src="${user.avatar}" alt="${user.name}" class="user-avatar">
          <div class="user-mini-info">
            <div class="user-mini-name">${user.name}</div>
            <div class="user-mini-role">${user.email}</div>
          </div>
        </a>
      </div>
    </aside>
  `;

  // Topbar HTML
  if (topbarContainer) {
    topbarContainer.innerHTML = `
      <header class="app-topbar">
        <div class="topbar-left">
          <button class="menu-toggle-btn" id="menuToggleBtn" title="Toggle Navigation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          
          <div class="global-search-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="globalSearchInput" class="global-search-input" placeholder="Search courses, lessons, assignments..." autocomplete="off">
          </div>
        </div>

        <div class="topbar-right">
          <!-- Quick Role Switcher for Demo Ease -->
          <div class="quick-role-picker" title="Switch Demo Role Instantly">
            <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); margin-left: 0.35rem;">DEMO:</span>
            <button class="role-pill-btn ${user.role === 'student' ? 'active' : ''}" onclick="switchRoleQuick('student')">Student</button>
            <button class="role-pill-btn ${user.role === 'reviewer' ? 'active' : ''}" onclick="switchRoleQuick('reviewer')">Reviewer</button>
            <button class="role-pill-btn ${user.role === 'admin' ? 'active' : ''}" onclick="switchRoleQuick('admin')">Admin</button>
          </div>

          <div class="icon-btn-wrapper">
            <a href="notifications.html" class="icon-btn" title="View Notifications">
              ${ICONS.notifications}
              ${userUnread > 0 ? `<span class="notif-badge-dot"></span>` : ''}
            </a>
          </div>

          <a href="profile.html" style="display: flex; align-items: center; gap: 0.6rem;" title="View Profile">
            <img src="${user.avatar}" alt="${user.name}" style="width: 38px; height: 38px; border-radius: 50%; border: 2px solid #fff; box-shadow: var(--shadow-sm);">
          </a>
        </div>
      </header>
    `;

    // Global Search behavior
    const searchInput = document.getElementById('globalSearchInput');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            window.location.href = `courses.html?search=${encodeURIComponent(query)}`;
          }
        }
      });
    }
  }

  // Setup mobile hamburger drawer toggling
  const menuBtn = document.getElementById('menuToggleBtn');
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (menuBtn && sidebar && backdrop) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('sidebar-open');
      backdrop.classList.toggle('active');
    });

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('sidebar-open');
      backdrop.classList.remove('active');
    });
  }
}

// Modal helper functions
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Date formatter
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffSecs = Math.floor((now - date) / 1000);

  if (diffSecs < 60) return 'Just now';
  if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
  if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
  if (diffSecs < 604800) return `${Math.floor(diffSecs / 86400)}d ago`;
  return formatDate(dateStr);
}
