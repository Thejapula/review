/**
 * PeerLearn - Interactive Learning Content Player Controller
 */

function initContentPage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('content');

  const urlParams = new URLSearchParams(window.location.search);
  let courseId = urlParams.get('courseId');
  let lessonId = urlParams.get('lessonId');

  const courses = getData(STORAGE_KEYS.COURSES, []);
  const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []).filter(e => e.userId === user.id);
  
  // If not specified, pick first enrolled course, or first available course
  if (!courseId) {
    if (enrollments.length > 0) {
      courseId = enrollments[0].courseId;
    } else if (courses.length > 0) {
      courseId = courses[0].id;
    }
  }

  const currentCourse = courses.find(c => c.id === courseId) || courses[0];
  if (!currentCourse) return;

  // Check enrollment
  let enrollment = enrollments.find(e => e.courseId === currentCourse.id);
  if (!enrollment) {
    // If not enrolled, create enrollment automatically for convenience so user can try learning content!
    enrollment = {
      id: generateId('enr'),
      userId: user.id,
      courseId: currentCourse.id,
      enrolledAt: new Date().toISOString(),
      completedLessons: [],
      completed: false
    };
    const allEnrollments = getData(STORAGE_KEYS.ENROLLMENTS, []);
    allEnrollments.push(enrollment);
    saveData(STORAGE_KEYS.ENROLLMENTS, allEnrollments);
  }

  const lessons = getData(STORAGE_KEYS.LESSONS, []).filter(l => l.courseId === currentCourse.id);
  lessons.sort((a, b) => a.order - b.order);

  // If no lesson specified, pick first incomplete or first lesson
  let currentLesson = lessons.find(l => l.id === lessonId);
  if (!currentLesson && lessons.length > 0) {
    currentLesson = lessons.find(l => !(enrollment.completedLessons || []).includes(l.id)) || lessons[0];
  }

  renderPlayer(currentCourse, currentLesson, lessons, enrollment);
}

function renderPlayer(course, lesson, lessons, enrollment) {
  const user = getCurrentUser();
  const playerContainer = document.getElementById('learningPlayerContent');
  if (!playerContainer) return;

  if (!lesson) {
    playerContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 class="empty-state-title">No Lessons Found</h3>
        <p class="empty-state-desc">This course does not currently have any lessons configured.</p>
        <a href="courses.html" class="btn btn-primary">Browse Other Courses</a>
      </div>
    `;
    return;
  }

  const isCompleted = (enrollment.completedLessons || []).includes(lesson.id);
  const currentIdx = lessons.findIndex(l => l.id === lesson.id);
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  const completedCount = (enrollment.completedLessons || []).length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);

  playerContainer.innerHTML = `
    <!-- Top Course Selection & Progress Header -->
    <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; box-shadow: var(--shadow-sm);">
      <div>
        <div style="font-size: 0.78rem; font-weight: 700; color: var(--primary-600); text-transform: uppercase; letter-spacing: 0.05em;">Currently Learning</div>
        <h2 style="font-size: 1.35rem; color: var(--text-main);">${course.title}</h2>
      </div>

      <div style="display: flex; align-items: center; gap: 1.5rem;">
        <div style="width: 180px;">
          <div class="progress-header">
            <span>Progress: ${completedCount}/${lessons.length}</span>
            <span style="font-weight: 800; color: var(--primary-600);">${progressPercent}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${progressPercent}%;"></div>
          </div>
        </div>

        <a href="course-details.html?id=${course.id}" class="btn btn-secondary btn-sm">Course Overview</a>
      </div>
    </div>

    <!-- Main Learning Layout: Syllabus Sidebar + Content Area -->
    <div style="display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem;" id="playerGrid">
      <!-- Left Syllabus Panel -->
      <div class="card-3d" style="height: fit-content; padding: 1.25rem;">
        <h4 style="font-size: 1rem; margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; justify-content: space-between;">
          <span>Modules & Lessons</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${lessons.length} Total</span>
        </h4>

        <div style="display: flex; flex-direction: column; gap: 0.4rem;">
          ${lessons.map((l, index) => {
            const completed = (enrollment.completedLessons || []).includes(l.id);
            const active = l.id === lesson.id;
            return `
              <a href="content.html?courseId=${course.id}&lessonId=${l.id}" style="display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); text-decoration: none; transition: var(--transition-smooth); background: ${active ? '#eff6ff' : 'transparent'}; border: 1px solid ${active ? '#bfdbfe' : 'transparent'};">
                <span style="width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; background: ${completed ? '#dcfce7' : (active ? '#3b82f6' : '#e2e8f0')}; color: ${completed ? '#15803d' : (active ? '#fff' : '#64748b')};">
                  ${completed ? '✓' : index + 1}
                </span>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 0.86rem; font-weight: ${active ? '700' : '600'}; color: ${active ? 'var(--primary-700)' : 'var(--text-main)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${l.title}
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">${l.duration}</div>
                </div>
              </a>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Main Lesson Content Body -->
      <div class="card-3d" style="padding: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <span class="role-badge role-student" style="margin-bottom: 0.5rem;">Lesson ${currentIdx + 1} of ${lessons.length}</span>
            <h1 style="font-size: 1.65rem; color: var(--text-main); margin-top: 0.25rem;">${lesson.title}</h1>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">${lesson.summary}</p>
          </div>

          <button id="toggleCompleteBtn" class="btn ${isCompleted ? 'btn-success' : 'btn-primary'}" onclick="toggleLessonCompletion('${course.id}', '${lesson.id}')">
            ${isCompleted ? '✓ Completed' : 'Mark as Complete'}
          </button>
        </div>

        <!-- Simulated Video / Interactive Media Banner -->
        <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: var(--radius-lg); padding: 2.5rem 1.5rem; text-align: center; color: #fff; margin-bottom: 2rem; position: relative; overflow: hidden; box-shadow: var(--shadow-md);">
          <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; cursor: pointer; transition: transform 0.2s;" onclick="showToast('Playing interactive lesson stream...', 'info')" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#ffffff"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 0.4rem;">${lesson.title}</h3>
          <p style="font-size: 0.85rem; color: #94a3b8;">High-definition interactive video stream • Duration: ${lesson.duration}</p>
        </div>

        <!-- Lesson Text Content with Markdown-style Rendering -->
        <div class="lesson-article" style="font-size: 0.95rem; line-height: 1.7; color: var(--text-body); margin-bottom: 2.5rem;">
          ${renderFormattedLessonText(lesson.content)}
        </div>

        <!-- Downloadable Resources -->
        ${lesson.resources && lesson.resources.length > 0 ? `
          <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 2.5rem;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem;">Lesson Resources & Attachments</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${lesson.resources.map(res => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0.85rem; background: #fff; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);">
                  <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary-600)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    <span style="font-size: 0.88rem; font-weight: 600; color: var(--text-main);">${res.title}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">(${res.size})</span>
                  </div>
                  <button class="btn btn-outline btn-sm" onclick="showToast('Downloaded ${res.title}', 'success')">Download</button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Next / Previous Lesson Navigation Footer -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1.5rem; border-top: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 1rem;">
          ${prevLesson ? `
            <a href="content.html?courseId=${course.id}&lessonId=${prevLesson.id}" class="btn btn-secondary">
              ← Previous: ${prevLesson.title.substring(0, 24)}...
            </a>
          ` : `<div></div>`}

          ${nextLesson ? `
            <a href="content.html?courseId=${course.id}&lessonId=${nextLesson.id}" class="btn btn-primary">
              Next Lesson: ${nextLesson.title.substring(0, 24)}... →
            </a>
          ` : `
            <a href="course-details.html?id=${course.id}" class="btn btn-purple">
              Finish Course & View Certificate
            </a>
          `}
        </div>
      </div>
    </div>
  `;
}

// Convert markdown headers and code blocks into clean HTML
function renderFormattedLessonText(rawText) {
  if (!rawText) return '<p>Lesson text is being prepared.</p>';
  
  let formatted = rawText
    .replace(/### (.*?)\n/g, '<h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin: 1.5rem 0 0.75rem;">$1</h3>')
    .replace(/#### (.*?)\n/g, '<h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 1.25rem 0 0.5rem;">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background: #e2e8f0; padding: 0.15rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: var(--purple-700);">$1</code>')
    .replace(/```(.*?)\n([\s\S]*?)```/g, '<pre style="background: #0f172a; color: #f8fafc; padding: 1.25rem; border-radius: var(--radius-md); overflow-x: auto; font-family: monospace; font-size: 0.88rem; margin: 1rem 0;"><code>$2</code></pre>')
    .replace(/\n\n/g, '<p style="margin-bottom: 1rem;"></p>');

  return formatted;
}

// Toggle lesson completed state
function toggleLessonCompletion(courseId, lessonId) {
  const user = getCurrentUser();
  if (!user) return;

  const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []);
  const index = enrollments.findIndex(e => e.userId === user.id && e.courseId === courseId);
  if (index === -1) return;

  const enrollment = enrollments[index];
  enrollment.completedLessons = enrollment.completedLessons || [];

  const lsnIndex = enrollment.completedLessons.indexOf(lessonId);
  const lessons = getData(STORAGE_KEYS.LESSONS, []).filter(l => l.courseId === courseId);

  if (lsnIndex === -1) {
    enrollment.completedLessons.push(lessonId);
    showToast('Lesson marked as completed! Progress updated.', 'success');
  } else {
    enrollment.completedLessons.splice(lsnIndex, 1);
    showToast('Lesson marked as incomplete.', 'info');
  }

  // Check if course 100% completed
  if (enrollment.completedLessons.length >= lessons.length) {
    enrollment.completed = true;
    createNotification({
      userId: user.id,
      title: 'Course Completed! 🎉',
      message: `Congratulations! You have completed 100% of the lessons in this course.`,
      type: 'general',
      link: `course-details.html?id=${courseId}`
    });
  } else {
    enrollment.completed = false;
  }

  enrollments[index] = enrollment;
  saveData(STORAGE_KEYS.ENROLLMENTS, enrollments);

  // Reload player
  const currentLesson = lessons.find(l => l.id === lessonId);
  renderPlayer({ id: courseId, title: '' }, currentLesson, lessons, enrollment);
}
