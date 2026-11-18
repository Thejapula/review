/**
 * PeerLearn - Authentication & Role-Based Access Control
 */

function getCurrentUser() {
  return getData(STORAGE_KEYS.CURRENT_USER, null);
}

function setCurrentUser(user) {
  saveData(STORAGE_KEYS.CURRENT_USER, user);
}

function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  showToast('Logged out successfully.', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 400);
}

// Page protection guard
function requireAuth(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) {
    const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
    window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    showToast(`Access Restricted: This page is for ${allowedRoles.join('/')} only.`, 'error');
    setTimeout(() => {
      window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
    }, 1200);
    return null;
  }

  return user;
}

// Quick role switch for demo presentation
function switchRoleQuick(role) {
  const users = getData(STORAGE_KEYS.USERS, []);
  let targetUser = null;

  if (role === 'student') {
    targetUser = users.find(u => u.email === 'student@example.com') || users.find(u => u.role === 'student');
  } else if (role === 'reviewer') {
    targetUser = users.find(u => u.email === 'reviewer@example.com') || users.find(u => u.role === 'reviewer');
  } else if (role === 'admin') {
    targetUser = users.find(u => u.email === 'admin@example.com') || users.find(u => u.role === 'admin');
  }

  if (targetUser) {
    setCurrentUser(targetUser);
    showToast(`Switched active profile to ${targetUser.name} (${targetUser.role.toUpperCase()})`, 'success');
    setTimeout(() => {
      // If admin, go to admin.html if currently on dashboard or vice versa
      if (targetUser.role === 'admin' && window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'admin.html';
      } else if (targetUser.role !== 'admin' && window.location.pathname.includes('admin.html')) {
        window.location.href = 'dashboard.html';
      } else {
        window.location.reload();
      }
    }, 600);
  }
}

// Register Form Controller
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const role = document.getElementById('regRole').value;

    const errorDiv = document.getElementById('regError');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Validations
    if (!name || !email || !password || !confirmPassword || !role) {
      errorDiv.textContent = 'Please fill out all required fields.';
      errorDiv.style.display = 'block';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errorDiv.textContent = 'Please enter a valid email address.';
      errorDiv.style.display = 'block';
      return;
    }

    if (password.length < 6) {
      errorDiv.textContent = 'Password must be at least 6 characters long.';
      errorDiv.style.display = 'block';
      return;
    }

    if (password !== confirmPassword) {
      errorDiv.textContent = 'Passwords do not match.';
      errorDiv.style.display = 'block';
      return;
    }

    // Check duplicate
    const users = getData(STORAGE_KEYS.USERS, []);
    const existing = users.find(u => u.email.toLowerCase() === email);
    if (existing) {
      errorDiv.textContent = 'An account with this email address already exists.';
      errorDiv.style.display = 'block';
      return;
    }

    // Create new user
    const newUser = {
      id: generateId('usr'),
      name,
      email,
      password,
      role, // 'student' | 'reviewer' | 'admin'
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      bio: `Enthusiastic ${role} participating on the PeerLearn educational network.`,
      title: `${role.charAt(0).toUpperCase() + role.slice(1)} Member`,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveData(STORAGE_KEYS.USERS, users);
    setCurrentUser(newUser);

    // Welcome notification
    createNotification({
      userId: newUser.id,
      title: 'Welcome to PeerLearn!',
      message: `Your account as a ${role} has been created. Start exploring courses and assignments!`,
      type: 'general',
      link: 'dashboard.html'
    });

    showToast(`Welcome, ${name}! Your account was created successfully.`, 'success');
    setTimeout(() => {
      window.location.href = role === 'admin' ? 'admin.html' : 'dashboard.html';
    }, 800);
  });
}

// Login Form Controller
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');

    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    if (!email || !password) {
      errorDiv.textContent = 'Please enter both email and password.';
      errorDiv.style.display = 'block';
      return;
    }

    const users = getData(STORAGE_KEYS.USERS, []);
    const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

    if (!user) {
      errorDiv.textContent = 'Invalid email or password. Please check credentials or use demo accounts.';
      errorDiv.style.display = 'block';
      return;
    }

    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`, 'success');

    // Handle redirect parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get('redirect');

    setTimeout(() => {
      if (redirectUrl) {
        window.location.href = decodeURIComponent(redirectUrl);
      } else {
        window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
      }
    }, 700);
  });
}

// Fill Demo Credentials
function fillDemoLogin(role) {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  if (!emailInput || !passwordInput) return;

  if (role === 'student') {
    emailInput.value = 'student@example.com';
    passwordInput.value = 'student123';
  } else if (role === 'reviewer') {
    emailInput.value = 'reviewer@example.com';
    passwordInput.value = 'reviewer123';
  } else if (role === 'admin') {
    emailInput.value = 'admin@example.com';
    passwordInput.value = 'admin123';
  }

  showToast(`Loaded ${role.toUpperCase()} credentials. Click Sign In!`, 'info');
}
