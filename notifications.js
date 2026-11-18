/**
 * PeerLearn - Notification Center Controller
 */

function initNotificationsPage() {
  const user = requireAuth();
  if (!user) return;

  renderAppShell('notifications');

  const container = document.getElementById('notificationsContainer');
  const emptyState = document.getElementById('notificationsEmptyState');
  const filterBtns = document.querySelectorAll('.notif-filter-btn');

  let filterMode = 'all'; // 'all' | 'unread'

  function render() {
    filterBtns.forEach(btn => {
      if (btn.dataset.filter === filterMode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const notifs = getData(STORAGE_KEYS.NOTIFICATIONS, []);
    let userNotifs = notifs.filter(n => n.userId === user.id);

    if (filterMode === 'unread') {
      userNotifs = userNotifs.filter(n => !n.read);
    }

    if (userNotifs.length === 0) {
      if (container) container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (container) {
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.gap = '0.75rem';

      container.innerHTML = userNotifs.map(n => {
        const icons = {
          review_assigned: `<div class="stat-icon-wrapper stat-icon-purple" style="width: 42px; height: 42px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>`,
          review_completed: `<div class="stat-icon-wrapper stat-icon-emerald" style="width: 42px; height: 42px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`,
          submission: `<div class="stat-icon-wrapper stat-icon-blue" style="width: 42px; height: 42px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></div>`,
          enrollment: `<div class="stat-icon-wrapper stat-icon-blue" style="width: 42px; height: 42px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg></div>`,
          comment: `<div class="stat-icon-wrapper stat-icon-amber" style="width: 42px; height: 42px;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>`
        };

        const icon = icons[n.type] || icons.submission;

        return `
          <div class="card-3d" style="padding: 1.15rem 1.35rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: ${n.read ? '#ffffff' : '#f0f7ff'}; border-left: 4px solid ${n.read ? 'transparent' : 'var(--primary-600)'}; transition: var(--transition-smooth);">
            <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0;">
              ${icon}
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${n.title}</h4>
                  ${!n.read ? `<span style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary-600); display: inline-block;"></span>` : ''}
                </div>
                <p style="font-size: 0.85rem; color: var(--text-body); margin: 0.2rem 0;">${n.message}</p>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${formatRelativeTime(n.createdAt)}</div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0;">
              ${n.link && n.link !== '#' ? `
                <a href="${n.link}" class="btn btn-secondary btn-sm" onclick="markNotificationRead('${n.id}')">View</a>
              ` : ''}
              ${!n.read ? `
                <button class="btn btn-outline btn-sm" onclick="markNotificationRead('${n.id}')" title="Mark as Read">✓ Read</button>
              ` : ''}
              <button class="btn btn-danger btn-sm" onclick="deleteNotificationItem('${n.id}')" title="Delete">✕</button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Filter tabs
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterMode = btn.dataset.filter;
      render();
    });
  });

  render();
}

function markNotificationRead(id) {
  const notifs = getData(STORAGE_KEYS.NOTIFICATIONS, []);
  const notif = notifs.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    const user = getCurrentUser();
    renderAppShell('notifications');
    initNotificationsPage();
  }
}

function markAllNotificationsAsRead() {
  const user = getCurrentUser();
  if (!user) return;

  const notifs = getData(STORAGE_KEYS.NOTIFICATIONS, []);
  notifs.forEach(n => {
    if (n.userId === user.id) {
      n.read = true;
    }
  });

  saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
  showToast('All notifications marked as read.', 'success');
  renderAppShell('notifications');
  initNotificationsPage();
}

function clearAllNotifications() {
  const user = getCurrentUser();
  if (!user) return;

  if (!confirm('Are you sure you want to clear all your notifications?')) return;

  const notifs = getData(STORAGE_KEYS.NOTIFICATIONS, []);
  const remaining = notifs.filter(n => n.userId !== user.id);
  saveData(STORAGE_KEYS.NOTIFICATIONS, remaining);

  showToast('Notifications cleared.', 'info');
  renderAppShell('notifications');
  initNotificationsPage();
}

function deleteNotificationItem(id) {
  deleteData(STORAGE_KEYS.NOTIFICATIONS, id);
  showToast('Notification removed.', 'info');
  renderAppShell('notifications');
  initNotificationsPage();
}
