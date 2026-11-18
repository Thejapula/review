/**
 * PeerLearn - Courses Catalog & Details Controller
 */

function initCoursesPage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('courses');

  const coursesGrid = document.getElementById('coursesGrid');
  const searchInput = document.getElementById('courseSearch');
  const categoryContainer = document.getElementById('categoryFilters');
  const difficultyFilter = document.getElementById('difficultyFilter');
  const sortFilter = document.getElementById('sortFilter');
  const emptyState = document.getElementById('coursesEmptyState');

  const urlParams = new URLSearchParams(window.location.search);
  const filterEnrolledOnly = urlParams.get('filter') === 'enrolled';
  const initialSearch = urlParams.get('search') || '';

  if (filterEnrolledOnly) {
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    if (pageTitle) pageTitle.textContent = 'My Enrolled Courses';
    if (pageSubtitle) pageSubtitle.textContent = 'Continue your active learning journeys and track your progress.';
  }

  if (searchInput && initialSearch) {
    searchInput.value = initialSearch;
  }

  let selectedCategory = 'all';

  function render() {
    const courses = getData(STORAGE_KEYS.COURSES, []);
    const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []).filter(e => e.userId === user.id);
    const enrolledCourseIds = enrollments.map(e => e.courseId);

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedDifficulty = difficultyFilter ? difficultyFilter.value : 'all';
    const sortBy = sortFilter ? sortFilter.value : 'popular';

    let filtered = courses.filter(c => {
      // Enrolled only filter
      if (filterEnrolledOnly && !enrolledCourseIds.includes(c.id)) {
        return false;
      }

      // Search match
      const matchesSearch = !query || 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query) || 
        c.instructor.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query);

      // Category match
      const matchesCategory = selectedCategory === 'all' || c.category.toLowerCase() === selectedCategory.toLowerCase();

      // Difficulty match
      const matchesDifficulty = selectedDifficulty === 'all' || c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort
    if (sortBy === 'popular') {
      filtered.sort((a, b) => b.studentsCount - a.studentsCount);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (filtered.length === 0) {
      if (coursesGrid) coursesGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (coursesGrid) {
      coursesGrid.style.display = 'grid';
      coursesGrid.innerHTML = filtered.map(course => {
        const isEnrolled = enrolledCourseIds.includes(course.id);
        const progress = isEnrolled ? calculateCourseProgress(user.id, course.id) : 0;

        return `
          <div class="course-card-3d">
            <div class="course-cover">
              <img src="${course.image || 'https://images.unsplash.com/photo-1516116211227-bbc13c7293b6?auto=format&fit=crop&w=600&q=80'}" alt="${course.title}" class="course-cover-img">
              <span class="course-badge-top">${course.badge || course.difficulty}</span>
              <span class="course-category-tag">${course.category}</span>
            </div>

            <div class="course-body">
              <h3 class="course-title">
                <a href="course-details.html?id=${course.id}">${course.title}</a>
              </h3>
              <p class="course-desc">${course.description}</p>

              <div class="course-meta">
                <div class="course-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>${course.instructor}</span>
                </div>
                <div class="course-meta-item">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span>${course.duration}</span>
                </div>
                <div class="course-meta-item" style="color: #f59e0b; font-weight: 700;">
                  ★ ${course.rating}
                </div>
              </div>

              ${isEnrolled ? `
                <div class="progress-bar-container">
                  <div class="progress-header">
                    <span>Course Progress</span>
                    <span>${progress}%</span>
                  </div>
                  <div class="progress-track">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                  </div>
                </div>
              ` : ''}

              <div class="course-footer">
                ${isEnrolled ? `
                  <a href="content.html?courseId=${course.id}" class="btn btn-primary btn-sm" style="width: 100%;">
                    Continue Learning
                  </a>
                ` : `
                  <a href="course-details.html?id=${course.id}" class="btn btn-secondary btn-sm">View Details</a>
                  <button class="btn btn-primary btn-sm" onclick="enrollInCourse('${course.id}')">Enroll Free</button>
                `}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Bind category filters
  if (categoryContainer) {
    categoryContainer.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        categoryContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedCategory = pill.dataset.category || 'all';
        render();
      });
    });
  }

  if (searchInput) searchInput.addEventListener('input', render);
  if (difficultyFilter) difficultyFilter.addEventListener('change', render);
  if (sortFilter) sortFilter.addEventListener('change', render);

  render();
}

// Global Enroll function
function enrollInCourse(courseId) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []);
  const existing = enrollments.find(e => e.userId === user.id && e.courseId === courseId);

  if (existing) {
    showToast('You are already enrolled in this course!', 'info');
    return;
  }

  const courses = getData(STORAGE_KEYS.COURSES, []);
  const course = courses.find(c => c.id === courseId);
  if (!course) return;

  const newEnrollment = {
    id: generateId('enr'),
    userId: user.id,
    courseId: course.id,
    enrolledAt: new Date().toISOString(),
    completedLessons: [],
    completed: false
  };

  enrollments.push(newEnrollment);
  saveData(STORAGE_KEYS.ENROLLMENTS, enrollments);

  // Update students count
  course.studentsCount = (course.studentsCount || 0) + 1;
  updateData(STORAGE_KEYS.COURSES, course.id, { studentsCount: course.studentsCount });

  // Generate notification
  createNotification({
    userId: user.id,
    title: 'Enrolled in New Course!',
    message: `You have successfully enrolled in "${course.title}". Start with Lesson 1!`,
    type: 'enrollment',
    link: `content.html?courseId=${course.id}`
  });

  showToast(`Successfully enrolled in "${course.title}"!`, 'success');
  setTimeout(() => {
    window.location.reload();
  }, 600);
}

// Global Unenroll function
function unenrollFromCourse(courseId) {
  const user = getCurrentUser();
  if (!user) return;

  if (!confirm('Are you sure you want to unenroll from this course? Your lesson completion history will be removed.')) {
    return;
  }

  const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []);
  const filtered = enrollments.filter(e => !(e.userId === user.id && e.courseId === courseId));
  saveData(STORAGE_KEYS.ENROLLMENTS, filtered);

  showToast('You have unenrolled from the course.', 'info');
  setTimeout(() => {
    window.location.href = 'courses.html';
  }, 600);
}

// Course Details Page Controller
function initCourseDetailsPage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('courses');

  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  const courses = getData(STORAGE_KEYS.COURSES, []);
  const course = courses.find(c => c.id === courseId) || courses[0];

  if (!course) {
    window.location.href = 'courses.html';
    return;
  }

  const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []);
  const enrollment = enrollments.find(e => e.userId === user.id && e.courseId === course.id);
  const isEnrolled = !!enrollment;
  const progress = isEnrolled ? calculateCourseProgress(user.id, course.id) : 0;

  const lessons = getData(STORAGE_KEYS.LESSONS, []).filter(l => l.courseId === course.id);
  const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, []).filter(a => a.courseId === course.id);

  // Populate HTML elements
  const detailsContainer = document.getElementById('courseDetailsContent');
  if (detailsContainer) {
    detailsContainer.innerHTML = `
      <div class="page-header">
        <div class="page-title-group">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span class="role-badge role-student">${course.category}</span>
            <span class="role-badge role-reviewer">${course.difficulty}</span>
          </div>
          <h1>${course.title}</h1>
          <p class="page-subtitle">${course.description}</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          ${isEnrolled ? `
            <a href="content.html?courseId=${course.id}" class="btn btn-primary btn-lg">
              ${progress > 0 ? 'Continue Learning' : 'Start Course'} (${progress}%)
            </a>
            <button class="btn btn-danger btn-sm" onclick="unenrollFromCourse('${course.id}')">Unenroll</button>
          ` : `
            <button class="btn btn-primary btn-lg" onclick="enrollInCourse('${course.id}')">
              Enroll in Course Now
            </button>
          `}
        </div>
      </div>

      <div class="grid-dashboard">
        <!-- Main Content Column -->
        <div>
          <!-- Course Overview Card -->
          <div class="card-3d" style="margin-bottom: 1.5rem;">
            <h3 class="card-title" style="margin-bottom: 1rem;">Course Curriculum (${lessons.length} Lessons)</h3>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${lessons.map((lesson, idx) => {
                const isCompleted = isEnrolled && (enrollment.completedLessons || []).includes(lesson.id);
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <span style="width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; background: ${isCompleted ? '#dcfce7' : '#eff6ff'}; color: ${isCompleted ? '#15803d' : '#2563eb'};">
                        ${isCompleted ? '✓' : idx + 1}
                      </span>
                      <div>
                        <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-main);">${lesson.title}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted);">${lesson.duration} • ${lesson.summary}</div>
                      </div>
                    </div>
                    ${isEnrolled ? `
                      <a href="content.html?courseId=${course.id}&lessonId=${lesson.id}" class="btn btn-secondary btn-sm">
                        ${isCompleted ? 'Review' : 'Play'}
                      </a>
                    ` : `
                      <span style="font-size: 0.78rem; color: var(--text-muted);">Enroll to Unlock</span>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Course Assignments Section -->
          <div class="card-3d">
            <h3 class="card-title" style="margin-bottom: 1rem;">Peer-Reviewed Course Assignments</h3>
            ${assignments.length === 0 ? `
              <p style="color: var(--text-muted); font-size: 0.9rem;">No assignments posted for this course yet.</p>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${assignments.map(asg => {
                  return `
                    <div style="padding: 1rem 1.25rem; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); background: #ffffff;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="font-size: 1rem; color: var(--text-main);">${asg.title}</h4>
                        <span class="status-badge status-submitted">Max Score: ${asg.maxScore} pts</span>
                      </div>
                      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">${asg.description}</p>
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 0.78rem; color: var(--text-muted);">Due: ${formatDate(asg.deadline)}</span>
                        <a href="submission.html?assignmentId=${asg.id}" class="btn btn-outline btn-sm">Assignment Details</a>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Sidebar Info Column -->
        <div>
          <!-- Course Quick Stats Card -->
          <div class="card-3d" style="margin-bottom: 1.5rem;">
            <img src="${course.image}" alt="${course.title}" style="border-radius: var(--radius-md); width: 100%; height: 180px; object-fit: cover; margin-bottom: 1.25rem;">
            
            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span style="color: var(--text-muted);">Instructor:</span>
                <span style="font-weight: 700; color: var(--text-main);">${course.instructor}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span style="color: var(--text-muted);">Enrolled Students:</span>
                <span style="font-weight: 700; color: var(--text-main);">${course.studentsCount} learners</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span style="color: var(--text-muted);">Course Rating:</span>
                <span style="font-weight: 700; color: #f59e0b;">★ ${course.rating} / 5.0</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span style="color: var(--text-muted);">Estimated Duration:</span>
                <span style="font-weight: 700; color: var(--text-main);">${course.duration}</span>
              </div>
            </div>

            ${isEnrolled ? `
              <div class="progress-bar-container">
                <div class="progress-header">
                  <span>Your Overall Progress</span>
                  <span style="font-weight: 800; color: var(--primary-600);">${progress}%</span>
                </div>
                <div class="progress-track track-lg">
                  <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
              </div>
            ` : `
              <button class="btn btn-primary" style="width: 100%;" onclick="enrollInCourse('${course.id}')">
                Enroll in Course Free
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }
}
