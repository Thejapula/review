/**
 * PeerLearn - Peer Reviews Center & Rubric Evaluation Controller
 */

function initReviewsPage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('reviews');

  const container = document.getElementById('reviewsListContainer');
  const emptyState = document.getElementById('reviewsEmptyState');
  const tabs = document.querySelectorAll('.review-tab-btn');

  let activeTab = 'pending'; // 'pending' | 'completed' | 'received'

  // Read URL query if set
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab')) {
    activeTab = urlParams.get('tab');
  }

  function render() {
    // Update active tab button style
    tabs.forEach(tab => {
      if (tab.dataset.tab === activeTab) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
    const reviews = getData(STORAGE_KEYS.REVIEWS, []);

    let listHtml = '';

    if (activeTab === 'pending') {
      // Submissions assigned to this user that are under_review
      const pending = submissions.filter(s => s.assignedReviewerId === user.id && s.status === 'under_review');
      
      if (pending.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('.empty-state-title').textContent = 'No Pending Peer Reviews';
        emptyState.querySelector('.empty-state-desc').textContent = 'You have no assigned submissions awaiting evaluation at this time.';
        return;
      }

      emptyState.style.display = 'none';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '1.25rem';

      listHtml = pending.map(sub => `
        <div class="card-3d" style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span class="role-badge role-reviewer">Action Required: Assigned Peer Review</span>
              <h3 style="font-size: 1.25rem; color: var(--text-main); margin-top: 0.35rem;">
                ${sub.assignmentTitle}
              </h3>
              <div style="font-size: 0.82rem; color: var(--text-muted);">
                Student: <strong>${sub.studentName}</strong> • Submitted: ${formatDate(sub.submittedAt)}
              </div>
            </div>

            <span class="status-badge status-under_review">Pending Your Review</span>
          </div>

          <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem;">
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.25rem;">${sub.title}</div>
            <p style="font-size: 0.88rem; color: var(--text-body); line-height: 1.5;">${sub.description}</p>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted);">
              Course: <strong>${sub.courseTitle}</strong>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <a href="${sub.submissionLink}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                Inspect Project Link ↗
              </a>
              <a href="review-details.html?submissionId=${sub.id}" class="btn btn-primary btn-sm">
                Start Peer Evaluation →
              </a>
            </div>
          </div>
        </div>
      `).join('');

    } else if (activeTab === 'completed') {
      // Reviews completed by this user
      const completed = reviews.filter(r => r.reviewerId === user.id);

      if (completed.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('.empty-state-title').textContent = 'No Completed Reviews Yet';
        emptyState.querySelector('.empty-state-desc').textContent = 'When you evaluate submissions, your submitted review records and scores will appear here.';
        return;
      }

      emptyState.style.display = 'none';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '1.25rem';

      listHtml = completed.map(rev => `
        <div class="card-3d" style="padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span class="role-badge role-reviewer">Review Submitted</span>
              <h3 style="font-size: 1.25rem; color: var(--text-main); margin-top: 0.35rem;">
                ${rev.assignmentTitle || 'Course Assignment'}
              </h3>
              <div style="font-size: 0.82rem; color: var(--text-muted);">
                Student: <strong>${rev.studentName}</strong> • Evaluated on: ${formatDate(rev.reviewedAt)}
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem; background: #fef3c7; border: 1px solid #fde68a; padding: 0.35rem 0.85rem; border-radius: var(--radius-full);">
              <span style="font-size: 0.85rem; font-weight: 800; color: #b45309;">${rev.overallRating} ★</span>
            </div>
          </div>

          <div style="background: #f8fafc; border-left: 4px solid var(--primary-500); padding: 0.85rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.88rem; color: var(--text-body); line-height: 1.5;">
            <strong>Your Feedback Summary:</strong> "${rev.feedback.general || rev.feedback.strengths}"
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <a href="review-details.html?submissionId=${rev.submissionId}" class="btn btn-secondary btn-sm">
              View Complete Rubric Breakdown
            </a>
          </div>
        </div>
      `).join('');

    } else if (activeTab === 'received') {
      // Reviews received by this user on their own submissions
      const mySubmissions = submissions.filter(s => s.studentId === user.id);
      const mySubIds = mySubmissions.map(s => s.id);
      const received = reviews.filter(r => mySubIds.includes(r.submissionId) || r.studentId === user.id);

      if (received.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('.empty-state-title').textContent = 'No Reviews Received Yet';
        emptyState.querySelector('.empty-state-desc').textContent = 'Submit your course assignments to receive constructive evaluations from peers and mentors!';
        return;
      }

      emptyState.style.display = 'none';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '1.25rem';

      listHtml = received.map(rev => `
        <div class="card-3d" style="padding: 1.5rem; border: 1px solid #bbf7d0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <span class="role-badge role-student">Feedback Received</span>
              <h3 style="font-size: 1.25rem; color: var(--text-main); margin-top: 0.35rem;">
                ${rev.assignmentTitle || 'Assignment Review'}
              </h3>
              <div style="font-size: 0.82rem; color: var(--text-muted);">
                Reviewer: <strong>${rev.reviewerName}</strong> (${rev.reviewerRole}) • Date: ${formatDate(rev.reviewedAt)}
              </div>
            </div>

            <div style="text-align: right; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.5rem 1rem; border-radius: var(--radius-md);">
              <div style="font-size: 1.25rem; font-weight: 800; color: #15803d;">${rev.overallRating} / 5.0</div>
              <div class="rating-stars">${renderStars(rev.overallRating)}</div>
            </div>
          </div>

          <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 0.85rem 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem; font-size: 0.88rem; color: #166534; line-height: 1.5;">
            <strong>Strengths:</strong> ${rev.feedback.strengths}
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <a href="submission.html?assignmentId=${rev.assignmentId}" class="btn btn-success btn-sm">
              View Detailed Score & Discussion
            </a>
          </div>
        </div>
      `).join('');
    }

    container.innerHTML = listHtml;
  }

  // Bind tab click events
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      render();
    });
  });

  render();
}

// Review Details / Evaluation Page Controller
function initReviewDetailsPage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('reviews');

  const urlParams = new URLSearchParams(window.location.search);
  const submissionId = urlParams.get('submissionId');

  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
  const submission = submissions.find(s => s.id === submissionId) || submissions[0];

  if (!submission) {
    window.location.href = 'reviews.html';
    return;
  }

  const assignments = getData(STORAGE_KEYS.ASSIGNMENTS, []);
  const assignment = assignments.find(a => a.id === submission.assignmentId);

  const reviews = getData(STORAGE_KEYS.REVIEWS, []);
  let existingReview = reviews.find(r => r.submissionId === submission.id);

  renderEvaluationInterface(submission, assignment, existingReview);
}

function renderEvaluationInterface(submission, assignment, existingReview) {
  const user = getCurrentUser();
  const container = document.getElementById('evaluationContent');
  if (!container) return;

  const isReadOnly = existingReview && existingReview.status === 'completed' && existingReview.reviewerId !== user.id;

  // Selected rating states
  let selectedOverall = existingReview ? existingReview.overallRating : 5;
  let ratings = existingReview ? { ...existingReview.ratings } : {
    quality: 5,
    clarity: 5,
    creativity: 5,
    completeness: 5
  };

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <a href="reviews.html" style="font-size: 0.82rem; color: var(--primary-600); display: inline-flex; align-items: center; gap: 0.35rem; margin-bottom: 0.5rem;">
          ← Back to Peer Reviews
        </a>
        <h1>Peer Review Evaluation</h1>
        <p class="page-subtitle">Evaluating submission for "${submission.assignmentTitle}" by <strong>${submission.studentName}</strong></p>
      </div>

      <div>
        <span class="status-badge status-${submission.status}">${submission.status.replace('_', ' ')}</span>
      </div>
    </div>

    <div class="grid-dashboard">
      <!-- Left Column: Student Submission Showcase -->
      <div>
        <!-- Student Work Card -->
        <div class="card-3d" style="margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem;">
            <img src="${submission.studentAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}" alt="${submission.studentName}" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid #fff; box-shadow: var(--shadow-sm);">
            <div>
              <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${submission.studentName}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">Submitted on ${formatDate(submission.submittedAt)} • ${submission.courseTitle}</div>
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Submission Project Title</label>
            <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-main); margin-top: 0.2rem;">${submission.title}</div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Student's Implementation Description</label>
            <div style="font-size: 0.92rem; color: var(--text-body); line-height: 1.6; margin-top: 0.2rem; background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              ${submission.description}
            </div>
          </div>

          <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem;">
            <div style="flex: 1; background: #eff6ff; padding: 1rem; border-radius: var(--radius-md); border: 1px solid #bfdbfe;">
              <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--primary-700);">Primary Project URL</label>
              <div style="margin-top: 0.25rem;">
                <a href="${submission.submissionLink}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="width: 100%;">
                  Inspect Live Work / Repository ↗
                </a>
              </div>
            </div>

            ${submission.fileName ? `
              <div style="background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; justify-content: center;">
                <label style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Attachment</label>
                <div style="font-size: 0.88rem; font-weight: 600; color: var(--text-main); margin-top: 0.25rem;">
                  📁 ${submission.fileName} (${submission.fileSize || '2.4 MB'})
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Interactive Peer Review Rubric Form -->
        <div class="card-3d">
          <h3 class="card-title" style="margin-bottom: 1.25rem;">
            ${isReadOnly ? 'Review Evaluation Summary' : 'Rubric Evaluation & Constructive Feedback'}
          </h3>

          <form id="evaluationForm">
            <!-- 1. Overall Star Rating Widget -->
            <div style="background: #f8fafc; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.25rem; margin-bottom: 1.75rem; text-align: center;">
              <label style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">
                Overall Rating (1 to 5 Stars) *
              </label>
              <div class="star-rating-widget" id="starRatingSelector" style="justify-content: center;">
                ${[1, 2, 3, 4, 5].map(star => `
                  <button type="button" class="star-btn ${star <= selectedOverall ? 'active' : ''}" data-val="${star}" ${isReadOnly ? 'disabled' : ''}>
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  </button>
                `).join('')}
              </div>
              <div id="starLabel" style="font-size: 0.95rem; font-weight: 700; color: #b45309; margin-top: 0.35rem;">
                ${getStarLabel(selectedOverall)} (${selectedOverall}/5)
              </div>
            </div>

            <!-- 2. Rubric Breakdown -->
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 1rem;">Specific Criteria Ratings</h4>

            <!-- Criterion 1: Quality -->
            <div class="rubric-card">
              <div class="rubric-header">
                <span class="rubric-title">1. Content Quality & Architecture</span>
                <span class="rubric-weight">Weight 25%</span>
              </div>
              <p class="rubric-desc">Code standards, semantic structure, modularity, and error handling.</p>
              <div class="rubric-options" data-criterion="quality">
                ${[1, 2, 3, 4, 5].map(val => `
                  <button type="button" class="rubric-option-btn ${ratings.quality === val ? 'selected' : ''}" data-val="${val}" ${isReadOnly ? 'disabled' : ''}>
                    ${val} ${val === 5 ? '★ Expert' : (val === 1 ? 'Novice' : 'pts')}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Criterion 2: Clarity -->
            <div class="rubric-card">
              <div class="rubric-header">
                <span class="rubric-title">2. Clarity & Documentation</span>
                <span class="rubric-weight">Weight 25%</span>
              </div>
              <p class="rubric-desc">Clear naming conventions, comments, README documentation, and readability.</p>
              <div class="rubric-options" data-criterion="clarity">
                ${[1, 2, 3, 4, 5].map(val => `
                  <button type="button" class="rubric-option-btn ${ratings.clarity === val ? 'selected' : ''}" data-val="${val}" ${isReadOnly ? 'disabled' : ''}>
                    ${val} ${val === 5 ? '★ Expert' : (val === 1 ? 'Novice' : 'pts')}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Criterion 3: Creativity -->
            <div class="rubric-card">
              <div class="rubric-header">
                <span class="rubric-title">3. Creativity & Aesthetics</span>
                <span class="rubric-weight">Weight 25%</span>
              </div>
              <p class="rubric-desc">Originality, visual hierarchy, 3D micro-interactions, and thoughtful design details.</p>
              <div class="rubric-options" data-criterion="creativity">
                ${[1, 2, 3, 4, 5].map(val => `
                  <button type="button" class="rubric-option-btn ${ratings.creativity === val ? 'selected' : ''}" data-val="${val}" ${isReadOnly ? 'disabled' : ''}>
                    ${val} ${val === 5 ? '★ Expert' : (val === 1 ? 'Novice' : 'pts')}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Criterion 4: Completeness -->
            <div class="rubric-card">
              <div class="rubric-header">
                <span class="rubric-title">4. Completeness & Functionality</span>
                <span class="rubric-weight">Weight 25%</span>
              </div>
              <p class="rubric-desc">All required deliverables implemented without breaking bugs or missing states.</p>
              <div class="rubric-options" data-criterion="completeness">
                ${[1, 2, 3, 4, 5].map(val => `
                  <button type="button" class="rubric-option-btn ${ratings.completeness === val ? 'selected' : ''}" data-val="${val}" ${isReadOnly ? 'disabled' : ''}>
                    ${val} ${val === 5 ? '★ Expert' : (val === 1 ? 'Novice' : 'pts')}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- 3. Written Qualitative Feedback -->
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin: 1.5rem 0 1rem;">Written Constructive Feedback</h4>

            <div class="form-group">
              <label class="form-label" for="fbStrengths">
                What was done well? (Key Strengths) *
              </label>
              <textarea id="fbStrengths" class="form-control" rows="3" placeholder="Highlight specific things the student executed brilliantly (e.g. clean semantic tags, soft 3D shadows, smooth transitions)..." required ${isReadOnly ? 'disabled' : ''}>${existingReview ? existingReview.feedback.strengths : ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="fbImprovements">
                What can be improved? (Constructive Recommendations) *
              </label>
              <textarea id="fbImprovements" class="form-control" rows="3" placeholder="Provide concrete, actionable suggestions for improvement (e.g. keyboard navigation, ARIA tags, edge-case testing)..." required ${isReadOnly ? 'disabled' : ''}>${existingReview ? existingReview.feedback.improvements : ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="fbGeneral">
                General Feedback & Concluding Thoughts *
              </label>
              <textarea id="fbGeneral" class="form-control" rows="3" placeholder="Overall appraisal and encouraging words for your peer's continued learning journey..." required ${isReadOnly ? 'disabled' : ''}>${existingReview ? existingReview.feedback.general : ''}</textarea>
            </div>

            ${!isReadOnly ? `
              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid var(--border-subtle);">
                <a href="reviews.html" class="btn btn-secondary">Cancel</a>
                <button type="button" class="btn btn-outline" onclick="saveDraftReview('${submission.id}')">Save Draft</button>
                <button type="submit" class="btn btn-primary btn-lg">Submit Completed Review</button>
              </div>
            ` : ''}
          </form>
        </div>
      </div>

      <!-- Right Column: Rubric Guide & Assignment Specs -->
      <div>
        <div class="card-3d" style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-main);">Reviewer Guidelines</h4>
          <ul style="padding-left: 1.2rem; font-size: 0.86rem; color: var(--text-body); line-height: 1.6; display: flex; flex-direction: column; gap: 0.5rem;">
            <li>Be encouraging, constructive, and respectful.</li>
            <li>Critique the code and solution, not the individual.</li>
            <li>Provide actionable suggestions that the student can test immediately.</li>
            <li>Verify both the visual layout and code quality.</li>
          </ul>
        </div>

        <div class="card-3d">
          <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-main);">Original Assignment Rubric</h4>
          <div style="font-size: 0.85rem; color: var(--text-body); line-height: 1.6; white-space: pre-line;">
            ${assignment ? assignment.instructions : 'No rubric details provided.'}
          </div>
        </div>
      </div>
    </div>
  `;

  // Interactive 5-Star Selector logic
  const starBtns = container.querySelectorAll('.star-btn');
  const starLabel = container.getElementById('starLabel');

  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isReadOnly) return;
      selectedOverall = parseInt(btn.dataset.val, 10);
      starBtns.forEach(b => {
        const val = parseInt(b.dataset.val, 10);
        if (val <= selectedOverall) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      if (starLabel) {
        starLabel.textContent = `${getStarLabel(selectedOverall)} (${selectedOverall}/5)`;
      }
    });
  });

  // Rubric buttons click listeners
  container.querySelectorAll('.rubric-options').forEach(group => {
    const criterion = group.dataset.criterion;
    group.querySelectorAll('.rubric-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isReadOnly) return;
        group.querySelectorAll('.rubric-option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        ratings[criterion] = parseInt(btn.dataset.val, 10);
      });
    });
  });

  // Bind Form Submit
  const evalForm = document.getElementById('evaluationForm');
  if (evalForm && !isReadOnly) {
    evalForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const strengths = document.getElementById('fbStrengths').value.trim();
      const improvements = document.getElementById('fbImprovements').value.trim();
      const general = document.getElementById('fbGeneral').value.trim();

      if (!strengths || !improvements || !general) {
        showToast('Please complete all written feedback fields before submitting.', 'error');
        return;
      }

      // Save and Complete Review
      submitPeerReview({
        submissionId: submission.id,
        assignmentId: submission.assignmentId,
        assignmentTitle: submission.assignmentTitle,
        studentId: submission.studentId,
        studentName: submission.studentName,
        overallRating: selectedOverall,
        ratings,
        feedback: { strengths, improvements, general }
      });
    });
  }
}

function getStarLabel(stars) {
  switch (stars) {
    case 5: return '★★★★★ Exceptional Work';
    case 4: return '★★★★☆ Very Good Effort';
    case 3: return '★★★☆☆ Meets Expectations';
    case 2: return '★★☆☆☆ Needs Improvement';
    case 1: return '★☆☆☆☆ Unsatisfactory';
    default: return '';
  }
}

function submitPeerReview(reviewData) {
  const user = getCurrentUser();
  if (!user) return;

  const reviews = getData(STORAGE_KEYS.REVIEWS, []);
  let revIndex = reviews.findIndex(r => r.submissionId === reviewData.submissionId);

  const completedReview = {
    id: revIndex !== -1 ? reviews[revIndex].id : generateId('rev'),
    submissionId: reviewData.submissionId,
    assignmentId: reviewData.assignmentId,
    assignmentTitle: reviewData.assignmentTitle,
    studentId: reviewData.studentId,
    studentName: reviewData.studentName,
    reviewerId: user.id,
    reviewerName: user.name,
    reviewerAvatar: user.avatar,
    reviewerRole: user.role,
    overallRating: reviewData.overallRating,
    ratings: reviewData.ratings,
    feedback: reviewData.feedback,
    status: 'completed',
    reviewedAt: new Date().toISOString()
  };

  if (revIndex !== -1) {
    reviews[revIndex] = completedReview;
  } else {
    reviews.push(completedReview);
  }
  saveData(STORAGE_KEYS.REVIEWS, reviews);

  // Update submission status to 'reviewed'
  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []);
  const subIndex = submissions.findIndex(s => s.id === reviewData.submissionId);
  if (subIndex !== -1) {
    submissions[subIndex].status = 'reviewed';
    submissions[subIndex].reviewedAt = new Date().toISOString();
    saveData(STORAGE_KEYS.SUBMISSIONS, submissions);
  }

  // Notify student!
  createNotification({
    userId: reviewData.studentId,
    title: `Peer Review Completed! (${reviewData.overallRating} ★)`,
    message: `${user.name} completed the evaluation of your submission for "${reviewData.assignmentTitle}". Check out the feedback!`,
    type: 'review_completed',
    link: `submission.html?assignmentId=${reviewData.assignmentId}`
  });

  showToast('Peer review submitted successfully! Student has been notified.', 'success');
  setTimeout(() => {
    window.location.href = 'reviews.html?tab=completed';
  }, 900);
}

function saveDraftReview(submissionId) {
  const strengths = document.getElementById('fbStrengths').value.trim();
  const improvements = document.getElementById('fbImprovements').value.trim();
  const general = document.getElementById('fbGeneral').value.trim();

  showToast('Review draft saved locally.', 'info');
}
