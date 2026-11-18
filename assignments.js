/**
 * PeerLearn - Assignment Listing & Submission Controller
 */

function initAssignmentsPage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('assignments');

  const container = document.getElementById('assignmentsListContainer');
  const filterStatus = document.getElementById('filterAssignmentStatus');
  const searchInput = document.getElementById('searchAssignments');
  const emptyState = document.getElementById('assignmentsEmptyState');

  function render() {
    const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, []);
    const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
    const mySubmissions = submissions.filter(s => s.studentId === user.id);

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedStatus = filterStatus ? filterStatus.value : 'all';

    const filtered = assignments.filter(asg => {
      const mySub = mySubmissions.find(s => s.assignmentId === asg.id);
      const currentStatus = mySub ? mySub.status : 'not_submitted';

      // Status Filter
      if (selectedStatus !== 'all' && currentStatus !== selectedStatus) {
        return false;
      }

      // Query Filter
      if (query && !asg.title.toLowerCase().includes(query) && !asg.description.toLowerCase().includes(query) && !asg.courseTitle.toLowerCase().includes(query)) {
        return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      if (container) container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (container) {
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '1.25rem';

      container.innerHTML = filtered.map(asg => {
        const mySub = mySubmissions.find(s => s.assignmentId === asg.id);
        const status = mySub ? mySub.status : 'not_submitted';

        const statusBadges = {
          not_submitted: '<span class="status-badge status-not_submitted">Not Submitted</span>',
          submitted: '<span class="status-badge status-submitted">Submitted</span>',
          under_review: '<span class="status-badge status-under_review">Under Peer Review</span>',
          reviewed: '<span class="status-badge status-reviewed">Reviewed ★</span>',
          revision_required: '<span class="status-badge status-revision_required">Revision Required</span>'
        };

        return `
          <div class="card-3d" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span class="role-badge role-student" style="font-size: 0.72rem; margin-bottom: 0.35rem;">${asg.courseTitle}</span>
                <h3 style="font-size: 1.25rem; color: var(--text-main); margin-top: 0.2rem;">${asg.title}</h3>
              </div>
              <div>${statusBadges[status] || statusBadges.not_submitted}</div>
            </div>

            <p style="font-size: 0.9rem; color: var(--text-body); line-height: 1.5;">${asg.description}</p>

            <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 1.5rem; font-size: 0.82rem; color: var(--text-muted);">
                <span><strong>Deadline:</strong> ${formatDate(asg.deadline)}</span>
                <span><strong>Max Score:</strong> ${asg.maxScore} pts</span>
                ${mySub && mySub.assignedReviewerName ? `<span><strong>Reviewer:</strong> ${mySub.assignedReviewerName}</span>` : ''}
              </div>

              <div style="display: flex; gap: 0.5rem;">
                <a href="submission.html?assignmentId=${asg.id}" class="btn ${status === 'reviewed' ? 'btn-success' : (status === 'not_submitted' ? 'btn-primary' : 'btn-secondary')} btn-sm">
                  ${status === 'not_submitted' ? 'Submit Assignment' : (status === 'reviewed' ? 'View Review & Grade' : 'View Submission')}
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  if (filterStatus) filterStatus.addEventListener('change', render);
  if (searchInput) searchInput.addEventListener('input', render);

  render();
}

// Submission Details & Form Page Controller
function initSubmissionPage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('assignments');

  const urlParams = new URLSearchParams(window.location.search);
  const assignmentId = urlParams.get('assignmentId');

  const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, []);
  const assignment = assignments.find(a => a.id === assignmentId) || assignments[0];

  if (!assignment) {
    window.location.href = 'assignments.html';
    return;
  }

  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
  let mySubmission = submissions.find(s => s.assignmentId === assignment.id && s.studentId === user.id);

  const reviews = getData(STORAGE_KEYS.REVIEWS, []);
  const review = mySubmission ? reviews.find(r => r.submissionId === mySubmission.id) : null;

  renderSubmissionView(assignment, mySubmission, review);
}

function renderSubmissionView(assignment, submission, review) {
  const user = getCurrentUser();
  const container = document.getElementById('submissionContent');
  if (!container) return;

  const isSubmitted = !!submission;
  const isReviewed = submission && submission.status === 'reviewed' && review;

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <a href="assignments.html" style="font-size: 0.82rem; color: var(--primary-600); display: inline-flex; align-items: center; gap: 0.35rem; margin-bottom: 0.5rem;">
          ← Back to All Assignments
        </a>
        <h1>${assignment.title}</h1>
        <p class="page-subtitle">${assignment.courseTitle} • Due by ${formatDate(assignment.deadline)} • Max ${assignment.maxScore} Points</p>
      </div>

      <div>
        ${isSubmitted ? `
          <span class="status-badge status-${submission.status}">${submission.status.replace('_', ' ')}</span>
        ` : `
          <span class="status-badge status-not_submitted">Not Submitted Yet</span>
        `}
      </div>
    </div>

    <div class="grid-dashboard">
      <!-- Main Column -->
      <div>
        <!-- Instructions Card -->
        <div class="card-3d" style="margin-bottom: 1.5rem;">
          <h3 class="card-title" style="margin-bottom: 0.75rem;">Assignment Instructions & Prompt</h3>
          <p style="font-size: 0.95rem; color: var(--text-body); line-height: 1.6; margin-bottom: 1rem;">
            ${assignment.description}
          </p>
          <div style="background: #f8fafc; border-left: 4px solid var(--primary-500); padding: 1rem; border-radius: 0 var(--radius-md) var(--radius-md) 0; font-size: 0.88rem; line-height: 1.6; white-space: pre-line;">
            ${assignment.instructions}
          </div>
        </div>

        ${isReviewed ? `
          <!-- COMPLETED PEER REVIEW CARD -->
          <div class="card-3d" style="border: 2px solid #86efac; background: #ffffff; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <span class="role-badge role-reviewer">Evaluation Result</span>
                <h3 style="font-size: 1.35rem; color: var(--text-main); margin-top: 0.35rem;">
                  Peer Review Evaluation
                </h3>
                <div style="font-size: 0.82rem; color: var(--text-muted);">
                  Evaluated by <strong>${review.reviewerName}</strong> (${review.reviewerRole}) on ${formatDate(review.reviewedAt)}
                </div>
              </div>

              <!-- Overall 5-Star Rating Badge -->
              <div style="text-align: right; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.75rem 1.25rem; border-radius: var(--radius-md);">
                <div style="font-size: 0.75rem; font-weight: 700; color: #16a34a; text-transform: uppercase;">Overall Rating</div>
                <div style="font-size: 1.75rem; font-weight: 800; color: #15803d; line-height: 1.2;">
                  ${review.overallRating} / 5.0
                </div>
                <div class="rating-stars" style="justify-content: flex-end;">
                  ${renderStars(review.overallRating)}
                </div>
              </div>
            </div>

            <!-- Rubric Scores Breakdown -->
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem;">Rubric Scoring Matrix</h4>
            <div class="grid-2" style="margin-bottom: 1.5rem;">
              <div style="background: #f8fafc; padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>Content Quality</span>
                  <span style="color: var(--primary-600);">${review.ratings.quality} / 5</span>
                </div>
                <div class="progress-track"><div class="progress-fill" style="width: ${review.ratings.quality * 20}%;"></div></div>
              </div>

              <div style="background: #f8fafc; padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>Clarity & Documentation</span>
                  <span style="color: var(--primary-600);">${review.ratings.clarity} / 5</span>
                </div>
                <div class="progress-track"><div class="progress-fill" style="width: ${review.ratings.clarity * 20}%;"></div></div>
              </div>

              <div style="background: #f8fafc; padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>Creativity & Aesthetics</span>
                  <span style="color: var(--primary-600);">${review.ratings.creativity} / 5</span>
                </div>
                <div class="progress-track"><div class="progress-fill" style="width: ${review.ratings.creativity * 20}%;"></div></div>
              </div>

              <div style="background: #f8fafc; padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.35rem;">
                  <span>Completeness & Functionality</span>
                  <span style="color: var(--primary-600);">${review.ratings.completeness} / 5</span>
                </div>
                <div class="progress-track"><div class="progress-fill" style="width: ${review.ratings.completeness * 20}%;"></div></div>
              </div>
            </div>

            <!-- Detailed Written Feedback Sections -->
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem; border-radius: var(--radius-sm);">
                <h5 style="color: #15803d; font-size: 0.88rem; font-weight: 700; margin-bottom: 0.35rem;">Key Strengths (What Was Done Well)</h5>
                <p style="font-size: 0.9rem; color: #166534; line-height: 1.5;">${review.feedback.strengths}</p>
              </div>

              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1rem; border-radius: var(--radius-sm);">
                <h5 style="color: #1e40af; font-size: 0.88rem; font-weight: 700; margin-bottom: 0.35rem;">Areas for Improvement (Constructive Critique)</h5>
                <p style="font-size: 0.9rem; color: #1e3a8a; line-height: 1.5;">${review.feedback.improvements}</p>
              </div>

              <div style="background: #f8fafc; border-left: 4px solid #94a3b8; padding: 1rem; border-radius: var(--radius-sm);">
                <h5 style="color: var(--text-main); font-size: 0.88rem; font-weight: 700; margin-bottom: 0.35rem;">General Assessment & Summary</h5>
                <p style="font-size: 0.9rem; color: var(--text-body); line-height: 1.5;">${review.feedback.general}</p>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Submission Status / Form Card -->
        <div class="card-3d" style="margin-bottom: 1.5rem;">
          ${isSubmitted ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <h3 class="card-title">Your Submitted Work</h3>
              ${!isReviewed ? `
                <button class="btn btn-secondary btn-sm" onclick="enableEditSubmission('${submission.id}')">
                  Edit Submission
                </button>
              ` : ''}
            </div>

            <div id="submittedDisplay">
              <div style="margin-bottom: 1rem;">
                <label style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Submission Title</label>
                <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-main);">${submission.title}</div>
              </div>

              <div style="margin-bottom: 1rem;">
                <label style="font-size: 0.78rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Description / Notes</label>
                <div style="font-size: 0.92rem; color: var(--text-body); line-height: 1.6;">${submission.description}</div>
              </div>

              <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                <div style="flex: 1; background: #f8fafc; padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Project Link / Repository</label>
                  <div>
                    <a href="${submission.submissionLink}" target="_blank" rel="noopener noreferrer" style="font-size: 0.9rem; font-weight: 600; color: var(--primary-600); word-break: break-all;">
                      ${submission.submissionLink} ↗
                    </a>
                  </div>
                </div>

                ${submission.fileName ? `
                  <div style="background: #f8fafc; padding: 0.85rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                    <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Attached File</label>
                    <div style="font-size: 0.9rem; font-weight: 600; color: var(--text-main);">
                      📁 ${submission.fileName} (${submission.fileSize || '1.2 MB'})
                    </div>
                  </div>
                ` : ''}
              </div>

              <div style="font-size: 0.82rem; color: var(--text-muted);">
                Submitted on: ${new Date(submission.submittedAt).toLocaleString()} • Assigned Reviewer: <strong>${submission.assignedReviewerName || 'Under Selection'}</strong>
              </div>
            </div>
          ` : ''}

          <!-- New / Edit Submission Form -->
          <div id="submissionFormWrapper" style="${isSubmitted ? 'display: none;' : 'display: block;'}">
            <h3 class="card-title" style="margin-bottom: 1rem;">
              ${isSubmitted ? 'Edit Submission' : 'Submit Assignment for Peer Review'}
            </h3>
            
            <form id="assignmentSubmitForm">
              <div class="form-group">
                <label class="form-label" for="subTitle">Submission Title *</label>
                <input type="text" id="subTitle" class="form-control" placeholder="e.g., NovaSaaS - Responsive 3D Educational Web Platform" value="${submission ? submission.title : ''}" required>
              </div>

              <div class="form-group">
                <label class="form-label" for="subDesc">Description & Implementation Highlights *</label>
                <textarea id="subDesc" class="form-control" rows="4" placeholder="Explain your design decisions, key features, and any instructions for the peer reviewer..." required>${submission ? submission.description : ''}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label" for="subLink">Project Link (GitHub / CodePen / Live URL) *</label>
                <input type="url" id="subLink" class="form-control" placeholder="https://github.com/username/project-repo" value="${submission ? submission.submissionLink : ''}" required>
                <div class="form-hint">Provide an accessible public URL for your reviewer to inspect.</div>
              </div>

              <div class="form-group">
                <label class="form-label" for="subFile">Project Archive / Bundle (Optional)</label>
                <input type="file" id="subFile" class="form-control">
                <div class="form-hint">Optional .zip or document file (simulated client attachment).</div>
              </div>

              <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
                ${isSubmitted ? `
                  <button type="button" class="btn btn-secondary" onclick="cancelEditSubmission()">Cancel</button>
                ` : ''}
                <button type="submit" class="btn btn-primary btn-lg">
                  ${isSubmitted ? 'Update Submission' : 'Submit for Peer Review'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Submission Discussion & Comments Section -->
        ${isSubmitted ? `
          <div class="card-3d">
            <h3 class="card-title" style="margin-bottom: 1rem;">Discussion & Feedback Comments</h3>
            <div id="submissionCommentsContainer">
              <!-- Comments will render here -->
            </div>

            <!-- Add Comment Form -->
            <form id="newCommentForm" style="margin-top: 1.5rem;">
              <div class="form-group">
                <textarea id="commentTextInput" class="form-control" rows="3" placeholder="Leave a clarifying question or comment for the reviewer..." required></textarea>
              </div>
              <div style="text-align: right;">
                <button type="submit" class="btn btn-primary btn-sm">Post Comment</button>
              </div>
            </form>
          </div>
        ` : ''}
      </div>

      <!-- Rubric Sidebar Guide -->
      <div>
        <div class="card-3d" style="margin-bottom: 1.5rem;">
          <h3 class="card-title" style="margin-bottom: 1rem;">Evaluation Rubric</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
            Your peer reviewer will assess your submission based on these four criteria (1 to 5 stars each):
          </p>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${(assignment.rubric || []).map(r => `
              <div style="background: #f8fafc; padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                  <strong style="font-size: 0.9rem; color: var(--text-main);">${r.criterion}</strong>
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary-600);">${r.weight}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${r.desc || 'Comprehensive criterion evaluation.'}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Workflow Step Indicator -->
        <div class="card-3d">
          <h4 style="font-size: 0.95rem; margin-bottom: 1rem; color: var(--text-main);">Peer Review Cycle</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.84rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; color: ${isSubmitted ? 'var(--accent-emerald)' : 'var(--text-main)'}; font-weight: 600;">
              <span>${isSubmitted ? '✓' : '1.'}</span> Submit your solution
            </div>
            <div style="display: flex; align-items: center; gap: 0.6rem; color: ${isReviewed ? 'var(--accent-emerald)' : (isSubmitted ? 'var(--primary-600)' : 'var(--text-muted)')}; font-weight: 600;">
              <span>${isReviewed ? '✓' : '2.'}</span> Peer reviewer evaluates work
            </div>
            <div style="display: flex; align-items: center; gap: 0.6rem; color: ${isReviewed ? 'var(--accent-emerald)' : 'var(--text-muted)'}; font-weight: 600;">
              <span>${isReviewed ? '✓' : '3.'}</span> Receive rating, feedback & score
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Submit Form
  const form = document.getElementById('assignmentSubmitForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAssignmentSubmit(assignment.id, submission ? submission.id : null);
    });
  }

  // Bind Comments
  if (isSubmitted) {
    renderComments(submission.id);
    const commentForm = document.getElementById('newCommentForm');
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const textInput = document.getElementById('commentTextInput');
        const text = textInput.value.trim();
        if (text) {
          addComment(submission.id, text);
          textInput.value = '';
          renderComments(submission.id);
        }
      });
    }
  }
}

function handleAssignmentSubmit(assignmentId, existingSubId) {
  const user = getCurrentUser();
  if (!user) return;

  const title = document.getElementById('subTitle').value.trim();
  const description = document.getElementById('subDesc').value.trim();
  const submissionLink = document.getElementById('subLink').value.trim();
  const fileInput = document.getElementById('subFile');

  let fileName = null;
  let fileSize = null;
  if (fileInput && fileInput.files && fileInput.files[0]) {
    fileName = fileInput.files[0].name;
    fileSize = `${(fileInput.files[0].size / (1024 * 1024)).toFixed(1)} MB`;
  }

  const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, []);
  const assignment = assignments.find(a => a.id === assignmentId);
  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);

  if (existingSubId) {
    // Update existing submission
    const sub = submissions.find(s => s.id === existingSubId);
    if (sub) {
      sub.title = title;
      sub.description = description;
      sub.submissionLink = submissionLink;
      if (fileName) {
        sub.fileName = fileName;
        sub.fileSize = fileSize;
      }
      sub.updatedAt = new Date().toISOString();
      saveData(STORAGE_KEYS.SUBMISSIONS, submissions);
      showToast('Submission updated successfully!', 'success');
      setTimeout(() => window.location.reload(), 600);
    }
    return;
  }

  // Create new submission
  const newSub = {
    id: generateId('sub'),
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    courseId: assignment.courseId,
    courseTitle: assignment.courseTitle,
    studentId: user.id,
    studentName: user.name,
    studentAvatar: user.avatar,
    title,
    description,
    submissionLink,
    fileName: fileName || 'project_source_archive.zip',
    fileSize: fileSize || '1.8 MB',
    submittedAt: new Date().toISOString(),
    status: 'submitted',
    assignedReviewerId: null,
    assignedReviewerName: null
  };

  submissions.unshift(newSub);
  saveData(STORAGE_KEYS.SUBMISSIONS, submissions);

  // Auto assign peer reviewer
  const assignedReviewer = autoAssignPeerReviewer(newSub.id);

  // Notify submitter
  createNotification({
    userId: user.id,
    title: 'Assignment Submitted Successfully! 🚀',
    message: assignedReviewer 
      ? `Your assignment "${title}" was submitted and assigned to ${assignedReviewer.name} for peer review.`
      : `Your assignment "${title}" was submitted and is queued for peer review.`,
    type: 'submission',
    link: `submission.html?assignmentId=${assignment.id}`
  });

  showToast('Assignment submitted! Assigned for peer review.', 'success');
  setTimeout(() => window.location.reload(), 800);
}

function enableEditSubmission() {
  const display = document.getElementById('submittedDisplay');
  const form = document.getElementById('submissionFormWrapper');
  if (display) display.style.display = 'none';
  if (form) form.style.display = 'block';
}

function cancelEditSubmission() {
  const display = document.getElementById('submittedDisplay');
  const form = document.getElementById('submissionFormWrapper');
  if (display) display.style.display = 'block';
  if (form) form.style.display = 'none';
}

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<svg width="18" height="18" viewBox="0 0 24 24" fill="${i <= rating ? '#fbbf24' : '#cbd5e1'}"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
  }
  return html;
}

// Comments Helper
function renderComments(submissionId) {
  const container = document.getElementById('submissionCommentsContainer');
  if (!container) return;

  const comments = getData(STORAGE_KEYS.COMMENTS, []).filter(c => c.submissionId === submissionId);
  const currentUser = getCurrentUser();

  if (comments.length === 0) {
    container.innerHTML = `
      <div style="font-size: 0.88rem; color: var(--text-muted); padding: 1rem 0;">
        No comments yet. Start the conversation with your peer or reviewer below!
      </div>
    `;
    return;
  }

  container.innerHTML = comments.map(c => {
    const isMine = currentUser && c.userId === currentUser.id;
    return `
      <div class="comment-card ${c.parentId ? 'nested' : ''}">
        <div class="comment-header">
          <img src="${c.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" alt="${c.userName}" class="comment-author-avatar">
          <div class="comment-author-info">
            <div class="comment-author-name">${c.userName} <span class="role-badge role-${c.userRole}" style="font-size: 0.65rem;">${c.userRole}</span></div>
            <div class="comment-time">${formatRelativeTime(c.createdAt)}</div>
          </div>
          ${isMine ? `
            <button class="comment-action-btn delete" onclick="deleteComment('${c.id}', '${submissionId}')" title="Delete Comment">
              Delete
            </button>
          ` : ''}
        </div>
        <div class="comment-body">${c.text}</div>
      </div>
    `;
  }).join('');
}

function addComment(submissionId, text, parentId = null) {
  const user = getCurrentUser();
  if (!user) return;

  const comments = getData(STORAGE_KEYS.COMMENTS, []);
  const newComment = {
    id: generateId('cmt'),
    submissionId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    userRole: user.role,
    text,
    parentId,
    createdAt: new Date().toISOString()
  };

  comments.push(newComment);
  saveData(STORAGE_KEYS.COMMENTS, comments);

  // Notify submission owner if someone else commented
  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
  const sub = submissions.find(s => s.id === submissionId);
  if (sub && sub.studentId !== user.id) {
    createNotification({
      userId: sub.studentId,
      title: 'New Feedback Comment',
      message: `${user.name} left a comment on your submission "${sub.title}".`,
      type: 'comment',
      link: `submission.html?assignmentId=${sub.assignmentId}`
    });
  }

  showToast('Comment posted.', 'success');
}

function deleteComment(commentId, submissionId) {
  deleteData(STORAGE_KEYS.COMMENTS, commentId);
  showToast('Comment deleted.', 'info');
  renderComments(submissionId);
}
