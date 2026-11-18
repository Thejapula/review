/**
 * PeerLearn - Dedicated Progress Tracking & Metrics Controller
 */

function initProgressPage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('progress');

  const container = document.getElementById('progressPageContent');
  if (!container) return;

  // Retrieve stored data
  const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []).filter(e => e.userId === user.id);
  const courses = getData(STORAGE_KEYS.COURSES, []);
  const allLessons = getData(STORAGE_KEYS.LESSONS, []);
  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
  const mySubmissions = submissions.filter(s => s.studentId === user.id);
  const allReviews = getData(STORAGE_KEYS.REVIEWS, []);
  const reviewsGiven = allReviews.filter(r => r.reviewerId === user.id);
  const reviewsReceived = allReviews.filter(r => r.studentId === user.id || mySubmissions.some(s => s.id === r.submissionId));
  const comments = getData(STORAGE_KEYS.COMMENTS, []).filter(c => c.userId === user.id);

  // Compute metrics
  let totalLessonsCompleted = 0;
  enrollments.forEach(e => {
    totalLessonsCompleted += (e.completedLessons || []).length;
  });

  const overallProgress = calculateOverallProgress(user.id);

  // Circular progress SVG constants (radius = 64)
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // approx 402.12
  const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>Learning Progress & Analytics</h1>
        <p class="page-subtitle">Track your educational milestones, course completions, and peer review contributions.</p>
      </div>

      <div style="display: flex; gap: 0.5rem;">
        <a href="courses.html" class="btn btn-primary btn-sm">Explore More Courses</a>
      </div>
    </div>

    <!-- Top KPI Grid: Circular Overall Meter + Activity Statistics -->
    <div style="display: grid; grid-template-columns: 360px 1fr; gap: 1.5rem; margin-bottom: 2rem;" id="progressOverviewGrid">
      <!-- 1. Large Circular SVG Progress Card -->
      <div class="card-3d circle-progress-card">
        <h3 class="card-title" style="margin-bottom: 1.25rem;">Overall Completion</h3>
        
        <div class="circle-progress-wrap">
          <svg class="circle-progress-svg" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6" />
                <stop offset="100%" stop-color="#9333ea" />
              </linearGradient>
            </defs>
            <circle class="circle-bg" cx="80" cy="80" r="${radius}" />
            <circle class="circle-bar" cx="80" cy="80" r="${radius}" 
              stroke-dasharray="${circumference}" 
              stroke-dashoffset="${strokeDashoffset}" />
          </svg>
          <div class="circle-center-text">
            <div class="circle-percent">${overallProgress}%</div>
            <div class="circle-subtext">Mastery</div>
          </div>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-muted); max-width: 260px;">
          Calculated across ${enrollments.length} enrolled course curricula and interactive modules.
        </p>
      </div>

      <!-- 2. Activity Statistics Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
        <!-- Lessons Completed -->
        <div class="stat-card-3d">
          <div class="stat-info">
            <span class="stat-label">Lessons Completed</span>
            <span class="stat-value">${totalLessonsCompleted}</span>
            <span class="stat-trend trend-up">Interactive Modules Finished</span>
          </div>
          <div class="stat-icon-wrapper stat-icon-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>

        <!-- Assignments Submitted -->
        <div class="stat-card-3d">
          <div class="stat-info">
            <span class="stat-label">Assignments Submitted</span>
            <span class="stat-value">${mySubmissions.length}</span>
            <span class="stat-trend trend-up">${mySubmissions.filter(s => s.status === 'reviewed').length} Evaluated</span>
          </div>
          <div class="stat-icon-wrapper stat-icon-purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          </div>
        </div>

        <!-- Reviews Given -->
        <div class="stat-card-3d">
          <div class="stat-info">
            <span class="stat-label">Peer Reviews Given</span>
            <span class="stat-value">${reviewsGiven.length}</span>
            <span class="stat-trend trend-up">Evaluations Completed</span>
          </div>
          <div class="stat-icon-wrapper stat-icon-emerald">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
        </div>

        <!-- Feedback Received -->
        <div class="stat-card-3d">
          <div class="stat-info">
            <span class="stat-label">Feedback Received</span>
            <span class="stat-value">${reviewsReceived.length}</span>
            <span class="stat-trend trend-up">Evaluations from Peers</span>
          </div>
          <div class="stat-icon-wrapper stat-icon-amber">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Enrolled Courses Breakdown -->
    <div class="card-3d" style="margin-bottom: 2rem;">
      <h3 class="card-title" style="margin-bottom: 1.25rem;">Course Breakdown & Syllabus Status</h3>

      ${enrollments.length === 0 ? `
        <div class="empty-state">
          <p style="color: var(--text-muted);">You are not enrolled in any courses yet.</p>
          <a href="courses.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Courses Catalog</a>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          ${enrollments.map(enr => {
            const course = courses.find(c => c.id === enr.courseId);
            if (!course) return '';

            const courseLessons = allLessons.filter(l => l.courseId === course.id);
            const completedCount = (enr.completedLessons || []).length;
            const progress = courseLessons.length > 0 ? Math.round((completedCount / courseLessons.length) * 100) : 0;
            
            const courseSubmissions = mySubmissions.filter(s => s.courseId === course.id);
            const courseReviews = reviewsReceived.filter(r => courseSubmissions.some(s => s.id === r.submissionId));

            return `
              <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: var(--shadow-xs);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                  <div>
                    <span class="role-badge role-student">${course.category}</span>
                    <h4 style="font-size: 1.15rem; color: var(--text-main); margin-top: 0.25rem;">${course.title}</h4>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">Instructor: ${course.instructor} • ${course.duration}</div>
                  </div>

                  <a href="content.html?courseId=${course.id}" class="btn btn-secondary btn-sm">
                    Open Player
                  </a>
                </div>

                <div class="progress-bar-container" style="margin: 0.75rem 0;">
                  <div class="progress-header">
                    <span>Lessons: ${completedCount} / ${courseLessons.length}</span>
                    <span style="font-weight: 700; color: var(--primary-600);">${progress}%</span>
                  </div>
                  <div class="progress-track track-lg">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                  </div>
                </div>

                <div style="display: flex; gap: 1.5rem; font-size: 0.82rem; color: var(--text-muted); margin-top: 0.75rem; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; flex-wrap: wrap;">
                  <span><strong>Assignments:</strong> ${courseSubmissions.length} submitted</span>
                  <span><strong>Reviews:</strong> ${courseReviews.length} evaluated</span>
                  <span style="color: ${progress === 100 ? 'var(--accent-emerald)' : 'var(--text-muted)'}; font-weight: 600;">
                    ${progress === 100 ? '✓ Course Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>

    <!-- Learning Achievements & Badges -->
    <div class="card-3d">
      <h3 class="card-title" style="margin-bottom: 1.25rem;">Milestone Badges</h3>
      
      <div class="grid-4">
        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎓</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">Enrolled Learner</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Enrolled in first course</div>
          <span style="font-size: 0.7rem; color: var(--accent-emerald); font-weight: 700; margin-top: 0.5rem; display: inline-block;">Unlocked</span>
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🌟</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">Peer Contributor</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Submitted peer review</div>
          <span style="font-size: 0.7rem; color: ${reviewsGiven.length > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)'}; font-weight: 700; margin-top: 0.5rem; display: inline-block;">
            ${reviewsGiven.length > 0 ? 'Unlocked' : 'In Progress'}
          </span>
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">💻</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">Code Builder</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">Submitted assignment</div>
          <span style="font-size: 0.7rem; color: ${mySubmissions.length > 0 ? 'var(--accent-emerald)' : 'var(--text-muted)'}; font-weight: 700; margin-top: 0.5rem; display: inline-block;">
            ${mySubmissions.length > 0 ? 'Unlocked' : 'In Progress'}
          </span>
        </div>

        <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; text-align: center;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏆</div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">Master Scholar</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">100% course completion</div>
          <span style="font-size: 0.7rem; color: ${overallProgress >= 100 ? 'var(--accent-emerald)' : 'var(--text-muted)'}; font-weight: 700; margin-top: 0.5rem; display: inline-block;">
            ${overallProgress >= 100 ? 'Unlocked' : 'Locked'}
          </span>
        </div>
      </div>
    </div>
  `;
}
