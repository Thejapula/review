/**
 * PeerLearn - User Profile & Account Settings Controller
 */

function initProfilePage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('profile');

  const container = document.getElementById('profilePageContent');
  if (!container) return;

  // Retrieve user metrics
  const enrollments = getData(STORAGE_KEYS.ENROLLMENTS, []).filter(e => e.userId === user.id);
  const submissions = getData(STORAGE_KEYS.SUBMISSIONS, []).filter(s => s.studentId === user.id);
  const reviewsGiven = getData(STORAGE_KEYS.REVIEWS, []).filter(r => r.reviewerId === user.id);
  const reviewsReceived = getData(STORAGE_KEYS.REVIEWS, []).filter(r => r.studentId === user.id);

  // Compute average rating received
  let avgRating = 0;
  if (reviewsReceived.length > 0) {
    const sum = reviewsReceived.reduce((acc, r) => acc + (r.overallRating || 0), 0);
    avgRating = (sum / reviewsReceived.length).toFixed(1);
  }

  const overallProgress = calculateOverallProgress(user.id);

  container.innerHTML = `
    <div class="page-header">
      <div class="page-title-group">
        <h1>User Profile & Settings</h1>
        <p class="page-subtitle">Manage your personal credentials, bio, preferences, and security settings.</p>
      </div>
    </div>

    <div class="grid-dashboard">
      <!-- Left Column: Profile Card & Summary Metrics -->
      <div>
        <div class="card-3d" style="text-align: center; padding: 2.5rem 1.5rem; margin-bottom: 1.5rem;">
          <div style="position: relative; display: inline-block; margin-bottom: 1rem;">
            <img id="profileAvatarImg" src="${user.avatar}" alt="${user.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #fff; box-shadow: var(--shadow-md); margin: 0 auto;">
            <span class="role-badge role-${user.role}" style="position: absolute; bottom: -5px; right: 0;">
              ${user.role}
            </span>
          </div>

          <h2 style="font-size: 1.5rem; color: var(--text-main); margin-bottom: 0.25rem;">${user.name}</h2>
          <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.75rem;">${user.email}</div>
          <p style="font-size: 0.9rem; color: var(--text-body); max-width: 450px; margin: 0 auto 1.5rem; line-height: 1.5;">
            ${user.bio || 'Active peer reviewer and student on the PeerLearn educational platform.'}
          </p>

          <!-- Metrics summary grid -->
          <div class="grid-4" style="text-align: left; background: #f8fafc; padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Enrolled</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--primary-600);">${enrollments.length}</div>
            </div>
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Submissions</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--purple-600);">${submissions.length}</div>
            </div>
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Reviews Given</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: var(--accent-emerald);">${reviewsGiven.length}</div>
            </div>
            <div>
              <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted);">Avg Rating</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: #f59e0b;">★ ${avgRating > 0 ? avgRating : '5.0'}</div>
            </div>
          </div>
        </div>

        <!-- Edit Profile Form -->
        <div class="card-3d">
          <h3 class="card-title" style="margin-bottom: 1.25rem;">Edit Personal Details</h3>
          
          <form id="editProfileForm">
            <div class="form-group">
              <label class="form-label" for="editName">Full Name *</label>
              <input type="text" id="editName" class="form-control" value="${user.name}" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="editEmail">Email Address</label>
              <input type="email" id="editEmail" class="form-control" value="${user.email}" disabled style="background: #f1f5f9; cursor: not-allowed;">
              <div class="form-hint">Email address cannot be modified as it is tied to authentication.</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="editBio">Profile Bio</label>
              <textarea id="editBio" class="form-control" rows="3" placeholder="Tell other students and reviewers about your technical background and goals...">${user.bio || ''}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="editAvatar">Avatar Image URL</label>
              <input type="url" id="editAvatar" class="form-control" value="${user.avatar || ''}" placeholder="https://images.unsplash.com/...">
              <div class="form-hint">Paste an image link or select one of the presets below.</div>
              
              <!-- Quick Avatar Presets -->
              <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Presets:</span>
                <button type="button" class="btn btn-secondary btn-sm" onclick="setAvatarPreset('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80')">Avatar 1</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="setAvatarPreset('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80')">Avatar 2</button>
                <button type="button" class="btn btn-secondary btn-sm" onclick="setAvatarPreset('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80')">Avatar 3</button>
              </div>
            </div>

            <div style="text-align: right; margin-top: 1.5rem;">
              <button type="submit" class="btn btn-primary">Save Profile Changes</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Right Column: Security & Demo Info -->
      <div>
        <!-- Change Password Form -->
        <div class="card-3d" style="margin-bottom: 1.5rem;">
          <h3 class="card-title" style="margin-bottom: 1rem;">Change Password</h3>
          
          <form id="changePasswordForm">
            <div class="form-group">
              <label class="form-label" for="currentPass">Current Password *</label>
              <input type="password" id="currentPass" class="form-control" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="newPass">New Password *</label>
              <input type="password" id="newPass" class="form-control" minlength="6" required>
              <div class="form-hint">Minimum 6 characters.</div>
            </div>

            <div class="form-group">
              <label class="form-label" for="confirmNewPass">Confirm New Password *</label>
              <input type="password" id="confirmNewPass" class="form-control" minlength="6" required>
            </div>

            <div style="text-align: right;">
              <button type="submit" class="btn btn-secondary">Update Password</button>
            </div>
          </form>
        </div>

        <!-- Role & Permissions Overview -->
        <div class="card-3d">
          <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.75rem;">Active Role Permissions</h4>
          <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-body);">
            <p style="margin-bottom: 0.5rem;">You are signed in as a <strong>${user.role.toUpperCase()}</strong>.</p>
            <ul style="padding-left: 1.2rem; color: var(--text-muted); font-size: 0.84rem; display: flex; flex-direction: column; gap: 0.35rem;">
              <li>Browse, search and enroll in course tracks</li>
              <li>Read interactive lesson materials & view documents</li>
              <li>Submit assignments and edit before deadline</li>
              <li>Evaluate peers via multi-criteria rubrics</li>
              <li>Post feedback and reply to discussion threads</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Edit Profile Form
  const profileForm = document.getElementById('editProfileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('editName').value.trim();
      const bio = document.getElementById('editBio').value.trim();
      const avatar = document.getElementById('editAvatar').value.trim();

      if (!name) {
        showToast('Please enter your full name.', 'error');
        return;
      }

      // Update in USERS storage
      const users = getData(STORAGE_KEYS.USERS, []);
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].name = name;
        users[userIndex].bio = bio;
        if (avatar) users[userIndex].avatar = avatar;
        saveData(STORAGE_KEYS.USERS, users);

        // Update CURRENT_USER
        setCurrentUser(users[userIndex]);

        showToast('Profile updated successfully!', 'success');
        setTimeout(() => window.location.reload(), 600);
      }
    });
  }

  // Bind Change Password Form
  const passForm = document.getElementById('changePasswordForm');
  if (passForm) {
    passForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentPass = document.getElementById('currentPass').value;
      const newPass = document.getElementById('newPass').value;
      const confirmNewPass = document.getElementById('confirmNewPass').value;

      if (currentPass !== user.password) {
        showToast('Current password does not match.', 'error');
        return;
      }

      if (newPass.length < 6) {
        showToast('New password must be at least 6 characters.', 'error');
        return;
      }

      if (newPass !== confirmNewPass) {
        showToast('New passwords do not match.', 'error');
        return;
      }

      const users = getData(STORAGE_KEYS.USERS, []);
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].password = newPass;
        saveData(STORAGE_KEYS.USERS, users);
        user.password = newPass;
        setCurrentUser(user);

        showToast('Password changed successfully!', 'success');
        passForm.reset();
      }
    });
  }
}

function setAvatarPreset(url) {
  const input = document.getElementById('editAvatar');
  const img = document.getElementById('profileAvatarImg');
  if (input) input.value = url;
  if (img) img.src = url;
}
