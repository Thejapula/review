/**
 * PeerLearn - Administrator Dashboard & System Management
 */

function initAdminPage() {
  const user = requireAuth(['admin']);
  if (!user) return;

  renderAppShell('admin');

  const container = document.getElementById('adminPageContent');
  if (!container) return;

  renderAdminOverview();
}

function renderAdminOverview() {
  const container = document.getElementById('adminPageContent');
  if (!container) return;

  // Retrieve metrics
  const users = getData(STORAGE_KEYS.USERS, []);
  const students = users.filter(u => u.role === 'student');
  const reviewers = users.filter(u => u.role === 'reviewer');
  const courses = getData(STORAGE_KEYS.COURSES, []);
  const lessons = getData(STORAGE_KEYS.LESSONS, []);
  const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, []);
  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
  const reviews = getData(STORAGE_KEYS.REVIEWS, []);

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <span class="role-badge role-admin" style="margin-bottom: 0.35rem;">Academic Administration</span>
        <h1>Platform Control Center</h1>
        <p class="page-subtitle">Manage system users, curriculum tracks, lessons, peer reviews, and system health.</p>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-primary btn-sm" onclick="openCreateCourseModal()">+ Create New Course</button>
        <button class="btn btn-outline btn-sm" onclick="resetStorageToDefault()">Reset Demo Database</button>
      </div>
    </div>

    <!-- 1. Statistics Cards Grid -->
    <div class="grid-4" style="margin-bottom: 2rem;">
      <div class="stat-card-3d">
        <div class="stat-info">
          <span class="stat-label">Total Users</span>
          <span class="stat-value">${users.length}</span>
          <span class="stat-trend trend-neutral">${students.length} Students • ${reviewers.length} Reviewers</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-blue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </div>
      </div>

      <div class="stat-card-3d">
        <div class="stat-info">
          <span class="stat-label">Active Courses</span>
          <span class="stat-value">${courses.length}</span>
          <span class="stat-trend trend-up">${lessons.length} Total Lessons</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-purple">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
        </div>
      </div>

      <div class="stat-card-3d">
        <div class="stat-info">
          <span class="stat-label">Submissions</span>
          <span class="stat-value">${submissions.length}</span>
          <span class="stat-trend trend-up">${assignments.length} Assignments Active</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-emerald">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
        </div>
      </div>

      <div class="stat-card-3d">
        <div class="stat-info">
          <span class="stat-label">Peer Reviews</span>
          <span class="stat-value">${reviews.length}</span>
          <span class="stat-trend trend-up">Evaluations Logged</span>
        </div>
        <div class="stat-icon-wrapper stat-icon-amber">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
      </div>
    </div>

    <!-- 2. Management Tabs Navigation -->
    <div style="display: flex; gap: 0.5rem; border-bottom: 2px solid var(--border-subtle); margin-bottom: 1.5rem; overflow-x: auto;">
      <button class="filter-pill active" id="tabUsersBtn" onclick="switchAdminTab('users')">User Management</button>
      <button class="filter-pill" id="tabCoursesBtn" onclick="switchAdminTab('courses')">Course Management</button>
      <button class="filter-pill" id="tabLessonsBtn" onclick="switchAdminTab('lessons')">Content & Lessons</button>
      <button class="filter-pill" id="tabReviewsBtn" onclick="switchAdminTab('reviews')">Review Moderation</button>
    </div>

    <!-- Tab Panels Container -->
    <div id="adminTabContent">
      <!-- Content loaded via switchAdminTab() -->
    </div>
  `;

  switchAdminTab('users');
}

function switchAdminTab(tabName) {
  const container = document.getElementById('adminTabContent');
  if (!container) return;

  // Toggle pills
  ['users', 'courses', 'lessons', 'reviews'].forEach(t => {
    const btn = document.getElementById(`tab${t.charAt(0).toUpperCase() + t.slice(1)}Btn`);
    if (btn) {
      if (t === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  if (tabName === 'users') {
    renderUsersManagement(container);
  } else if (tabName === 'courses') {
    renderCoursesManagement(container);
  } else if (tabName === 'lessons') {
    renderLessonsManagement(container);
  } else if (tabName === 'reviews') {
    renderReviewsManagement(container);
  }
}

// -------------------------------------------------------------
// USER MANAGEMENT
// -------------------------------------------------------------
function renderUsersManagement(container) {
  const users = getData(STORAGE_KEYS.USERS, []);

  container.innerHTML = `
    <div class="card-3d" style="padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 class="card-title">User Accounts (${users.length})</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Manage registered students, reviewers, and administrative staff.</p>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <input type="text" id="adminUserSearch" class="form-control" placeholder="Search by name or email..." style="width: 250px;">
          <select id="adminUserRoleFilter" class="form-control" style="width: 140px;">
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="reviewer">Reviewers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="adminUsersTbody">
            <!-- Rendered by updateUsersTable -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  function updateUsersTable() {
    const search = (document.getElementById('adminUserSearch')?.value || '').toLowerCase().trim();
    const role = document.getElementById('adminUserRoleFilter')?.value || 'all';

    const filtered = users.filter(u => {
      const matchQuery = !search || u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search);
      const matchRole = role === 'all' || u.role === role;
      return matchQuery && matchRole;
    });

    const tbody = document.getElementById('adminUsersTbody');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No users matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(u => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${u.avatar}" alt="${u.name}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover;">
            <span style="font-weight: 700; color: var(--text-main);">${u.name}</span>
          </div>
        </td>
        <td>${u.email}</td>
        <td><span class="role-badge role-${u.role}">${u.role}</span></td>
        <td>${formatDate(u.createdAt)}</td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="editUserRolePrompt('${u.id}')">Change Role</button>
          <button class="btn btn-danger btn-sm" onclick="deleteUserRecord('${u.id}')" ${u.email === 'admin@example.com' ? 'disabled' : ''}>Delete</button>
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('adminUserSearch')?.addEventListener('input', updateUsersTable);
  document.getElementById('adminUserRoleFilter')?.addEventListener('change', updateUsersTable);
  updateUsersTable();
}

function editUserRolePrompt(userId) {
  const users = getData(STORAGE_KEYS.USERS, []);
  const u = users.find(x => x.id === userId);
  if (!u) return;

  const newRole = prompt(`Change role for ${u.name} (Current: ${u.role})\nEnter: student, reviewer, or admin:`, u.role);
  if (newRole && ['student', 'reviewer', 'admin'].includes(newRole.toLowerCase())) {
    u.role = newRole.toLowerCase();
    saveData(STORAGE_KEYS.USERS, users);
    showToast(`Updated role for ${u.name} to ${u.role}`, 'success');
    switchAdminTab('users');
  } else if (newRole) {
    showToast('Invalid role specified. Must be student, reviewer, or admin.', 'error');
  }
}

function deleteUserRecord(userId) {
  if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
  deleteData(STORAGE_KEYS.USERS, userId);
  showToast('User record deleted.', 'info');
  switchAdminTab('users');
}

// -------------------------------------------------------------
// COURSE MANAGEMENT
// -------------------------------------------------------------
function renderCoursesManagement(container) {
  const courses = getData(STORAGE_KEYS.COURSES, []);

  container.innerHTML = `
    <div class="card-3d" style="padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h3 class="card-title">Course Management (${courses.length})</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Create, update, or remove curriculum offerings.</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openCreateCourseModal()">+ Add Course</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Course Title</th>
              <th>Category</th>
              <th>Difficulty</th>
              <th>Instructor</th>
              <th>Students</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${courses.map(c => `
              <tr>
                <td><strong>${c.title}</strong></td>
                <td><span class="role-badge role-student">${c.category}</span></td>
                <td>${c.difficulty}</td>
                <td>${c.instructor}</td>
                <td>${c.studentsCount || 0}</td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-sm" onclick="openEditCourseModal('${c.id}')">Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteCourseRecord('${c.id}')">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function deleteCourseRecord(courseId) {
  if (!confirm('Are you sure you want to delete this course? All related syllabus lessons will remain archived.')) return;
  deleteData(STORAGE_KEYS.COURSES, courseId);
  showToast('Course removed successfully.', 'info');
  switchAdminTab('courses');
}

// -------------------------------------------------------------
// CONTENT & LESSONS MANAGEMENT
// -------------------------------------------------------------
function renderLessonsManagement(container) {
  const courses = getData(STORAGE_KEYS.COURSES, []);
  const lessons = getData(STORAGE_KEYS.LESSONS, []);

  container.innerHTML = `
    <div class="card-3d" style="padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 class="card-title">Content & Lesson Materials (${lessons.length})</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Manage syllabus lessons, text readings, and video assignments.</p>
        </div>

        <button class="btn btn-primary btn-sm" onclick="openCreateLessonModal()">+ Add New Lesson</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Lesson Title</th>
              <th>Course</th>
              <th>Order</th>
              <th>Duration</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${lessons.map(l => {
              const crs = courses.find(c => c.id === l.courseId);
              return `
                <tr>
                  <td><strong>${l.title}</strong></td>
                  <td>${crs ? crs.title : 'Unassigned'}</td>
                  <td>#${l.order || 1}</td>
                  <td>${l.duration}</td>
                  <td style="text-align: right;">
                    <a href="content.html?courseId=${l.courseId}&lessonId=${l.id}" class="btn btn-secondary btn-sm" target="_blank">View</a>
                    <button class="btn btn-danger btn-sm" onclick="deleteLessonRecord('${l.id}')">Delete</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function deleteLessonRecord(lessonId) {
  if (!confirm('Delete this lesson from the syllabus?')) return;
  deleteData(STORAGE_KEYS.LESSONS, lessonId);
  showToast('Lesson deleted.', 'info');
  switchAdminTab('lessons');
}

// -------------------------------------------------------------
// REVIEW MODERATION
// -------------------------------------------------------------
function renderReviewsManagement(container) {
  const reviews = getData(STORAGE_KEYS.REVIEWS, []);

  container.innerHTML = `
    <div class="card-3d" style="padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <h3 class="card-title">Peer Review Moderation (${reviews.length})</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Audit evaluation scores, ratings, and remove inappropriate feedback.</p>
        </div>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Student</th>
              <th>Reviewer</th>
              <th>Score</th>
              <th>Feedback Preview</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${reviews.map(r => `
              <tr>
                <td><strong>${r.assignmentTitle || 'Assignment'}</strong></td>
                <td>${r.studentName}</td>
                <td>${r.reviewerName}</td>
                <td><span style="font-weight: 800; color: #b45309;">${r.overallRating} ★</span></td>
                <td style="max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  "${r.feedback.general || r.feedback.strengths}"
                </td>
                <td style="text-align: right;">
                  <button class="btn btn-danger btn-sm" onclick="deleteInappropriateReview('${r.id}')">Remove Feedback</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function deleteInappropriateReview(reviewId) {
  if (!confirm('Remove this review for moderation compliance?')) return;
  deleteData(STORAGE_KEYS.REVIEWS, reviewId);
  showToast('Review removed by administrator.', 'info');
  switchAdminTab('reviews');
}

// -------------------------------------------------------------
// MODALS (Create/Edit Course, Create Lesson)
// -------------------------------------------------------------
function openCreateCourseModal() {
  const modal = document.getElementById('adminModal');
  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  if (!modal || !title || !body) return;

  title.textContent = 'Create New Course Offering';
  body.innerHTML = `
    <form id="courseForm">
      <div class="form-group">
        <label class="form-label">Course Title *</label>
        <input type="text" id="mCourseTitle" class="form-control" required placeholder="e.g., Advanced Deep Learning with PyTorch">
      </div>
      <div class="form-group">
        <label class="form-label">Category *</label>
        <select id="mCourseCategory" class="form-control" required>
          <option value="Web Development">Web Development</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Python">Python</option>
          <option value="Data Structures">Data Structures</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Design Thinking">Design Thinking</option>
        </select>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Difficulty *</label>
          <select id="mCourseDiff" class="form-control">
            <option value="Beginner">Beginner</option>
            <option value="Intermediate" selected>Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Duration</label>
          <input type="text" id="mCourseDuration" class="form-control" value="6 Weeks">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Instructor Name *</label>
        <input type="text" id="mCourseInstructor" class="form-control" value="Prof. David Miller" required>
      </div>
      <div class="form-group">
        <label class="form-label">Course Description *</label>
        <textarea id="mCourseDesc" class="form-control" rows="3" required placeholder="Comprehensive summary of learning objectives..."></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal('adminModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Create Course</button>
      </div>
    </form>
  `;

  document.getElementById('courseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newCourse = {
      id: generateId('crs'),
      title: document.getElementById('mCourseTitle').value.trim(),
      category: document.getElementById('mCourseCategory').value,
      difficulty: document.getElementById('mCourseDiff').value,
      duration: document.getElementById('mCourseDuration').value,
      instructor: document.getElementById('mCourseInstructor').value.trim(),
      description: document.getElementById('mCourseDesc').value.trim(),
      studentsCount: 1,
      rating: 5.0,
      badge: 'New',
      image: 'https://images.unsplash.com/photo-1516116211227-bbc13c7293b6?auto=format&fit=crop&w=600&q=80',
      createdAt: new Date().toISOString()
    };

    const courses = getData(STORAGE_KEYS.COURSES, []);
    courses.unshift(newCourse);
    saveData(STORAGE_KEYS.COURSES, courses);

    closeModal('adminModal');
    showToast('Course successfully created!', 'success');
    switchAdminTab('courses');
  });

  openModal('adminModal');
}

function openEditCourseModal(courseId) {
  const courses = getData(STORAGE_KEYS.COURSES, []);
  const c = courses.find(x => x.id === courseId);
  if (!c) return;

  const modal = document.getElementById('adminModal');
  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  title.textContent = `Edit Course: ${c.title}`;
  body.innerHTML = `
    <form id="editCourseForm">
      <div class="form-group">
        <label class="form-label">Course Title</label>
        <input type="text" id="mEditCourseTitle" class="form-control" value="${c.title}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <input type="text" id="mEditCourseCat" class="form-control" value="${c.category}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea id="mEditCourseDesc" class="form-control" rows="3" required>${c.description}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal('adminModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Changes</button>
      </div>
    </form>
  `;

  document.getElementById('editCourseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    c.title = document.getElementById('mEditCourseTitle').value.trim();
    c.category = document.getElementById('mEditCourseCat').value.trim();
    c.description = document.getElementById('mEditCourseDesc').value.trim();
    saveData(STORAGE_KEYS.COURSES, courses);

    closeModal('adminModal');
    showToast('Course updated successfully!', 'success');
    switchAdminTab('courses');
  });

  openModal('adminModal');
}

function openCreateLessonModal() {
  const courses = getData(STORAGE_KEYS.COURSES, []);
  const modal = document.getElementById('adminModal');
  const title = document.getElementById('adminModalTitle');
  const body = document.getElementById('adminModalBody');

  title.textContent = 'Add New Syllabus Lesson';
  body.innerHTML = `
    <form id="newLessonForm">
      <div class="form-group">
        <label class="form-label">Select Course *</label>
        <select id="mLessonCourse" class="form-control" required>
          ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Lesson Title *</label>
        <input type="text" id="mLessonTitle" class="form-control" placeholder="e.g., Deep Learning Backpropagation" required>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Estimated Duration</label>
          <input type="text" id="mLessonDuration" class="form-control" value="25 min">
        </div>
        <div class="form-group">
          <label class="form-label">Order #</label>
          <input type="number" id="mLessonOrder" class="form-control" value="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Short Summary</label>
        <input type="text" id="mLessonSummary" class="form-control" placeholder="Brief outline of lesson concept">
      </div>
      <div class="form-group">
        <label class="form-label">Lesson Markdown Content *</label>
        <textarea id="mLessonContent" class="form-control" rows="5" required placeholder="### Lesson Heading\nDetailed explanation..."></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
        <button type="button" class="btn btn-secondary" onclick="closeModal('adminModal')">Cancel</button>
        <button type="submit" class="btn btn-primary">Save Lesson</button>
      </div>
    </form>
  `;

  document.getElementById('newLessonForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newLesson = {
      id: generateId('lsn'),
      courseId: document.getElementById('mLessonCourse').value,
      title: document.getElementById('mLessonTitle').value.trim(),
      duration: document.getElementById('mLessonDuration').value,
      order: parseInt(document.getElementById('mLessonOrder').value, 10) || 1,
      summary: document.getElementById('mLessonSummary').value.trim(),
      content: document.getElementById('mLessonContent').value.trim(),
      resources: [{ title: 'Lesson Supplementary Guide.pdf', size: '1.1 MB' }]
    };

    const lessons = getData(STORAGE_KEYS.LESSONS, []);
    lessons.push(newLesson);
    saveData(STORAGE_KEYS.LESSONS, lessons);

    closeModal('adminModal');
    showToast('New lesson added to curriculum!', 'success');
    switchAdminTab('lessons');
  });

  openModal('adminModal');
}
