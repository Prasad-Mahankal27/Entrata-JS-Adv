let currentUser = null;
let tasks = [
    { id: 1, title: 'Project Initialization', status: 'Completed' },
    { id: 2, title: 'Database Setup', status: 'Pending' },
    { id: 3, title: 'UI Design Review', status: 'In Progress' }
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function init() {
    console.log('Application initialized at: ' + new Date().toString());
    updateClock();
    setInterval(updateClock, 1000);
    checkSession();
    renderTasks();
    displayBrowserInfo();
}

function toggleView(viewId) {
    const views = ['register-view', 'login-view', 'dashboard-view'];
    views.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
}

function updateClock() {
    const now = new Date();
    document.getElementById('current-time').innerText = now.toLocaleTimeString();
}

function displayBrowserInfo() {
    const info = 'Browser: ' + navigator.userAgent.split(' ')[0] + ' | Cookies Enabled: ' + navigator.cookieEnabled;
    document.getElementById('browser-info').innerText = info;
}

function setCookie(name, value, minutes) {
    const d = new Date();
    d.setTime(d.getTime() + (minutes * 60 * 1000));
    document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function checkSession() {
    const sessionUser = getCookie('userSession');
    if (sessionUser) {
        currentUser = JSON.parse(decodeURIComponent(sessionUser));
        document.getElementById('welcome-text').innerText = 'Welcome, ' + currentUser.name + '!';
        toggleView('dashboard-view');
    }
}

document.getElementById('register-form').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value;
    const msg = document.getElementById('reg-msg');

    msg.innerHTML = '';
    let isValid = true;
    let errors = [];

    if (name.length < 3) {
        isValid = false;
        errors.push('Name must be 3+ chars.');
    }

    if (!emailRegex.test(email)) {
        isValid = false;
        errors.push('Invalid email format.');
    }

    if (pass.length < 6) {
        isValid = false;
        errors.push('Password must be 6+ chars.');
    }

    if (!isValid) {
        msg.innerHTML = '<p class="error-msg">' + errors.join('<br>') + '</p>';
        return;
    }

    fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, type: 'register' })
    })
    .then(res => res.json())
    .then(data => {
        msg.innerHTML = '<p class="success">Registration successful! Redirecting...</p>';
        setTimeout(() => {
            toggleView('login-view');
            msg.innerHTML = '';
        }, 2000);
    });
};

document.getElementById('login-form').onsubmit = function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');

    if (!emailRegex.test(email) || pass.length < 1) {
        msg.innerHTML = '<p class="error-msg">Invalid credentials.</p>';
        return;
    }

    fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: email.split('@')[0], email: email, type: 'login' })
    })
    .then(res => res.json())
    .then(data => {
        currentUser = { name: data.message.split('Processed ')[1], id: Math.floor(Math.random() * 9000) + 1000 };
        setCookie('userSession', encodeURIComponent(JSON.stringify(currentUser)), 30);
        document.getElementById('welcome-text').innerText = 'Welcome, ' + currentUser.name + '!';
        toggleView('dashboard-view');
    });
};

function calculateBudget() {
    const inc = parseFloat(document.getElementById('income').value);
    const exp = parseFloat(document.getElementById('expenses').value);
    const result = document.getElementById('budget-result');

    if (isNaN(inc) || isNaN(exp)) {
        result.innerText = 'Please enter valid numbers.';
        return;
    }

    const savings = inc - exp;
    const percentage = (savings / inc) * 100;
    
    result.innerText = 'Projected Savings: $' + Math.round(savings) + ' (' + percentage.toFixed(1) + '% of income)';
    result.style.color = savings >= 0 ? '#27ae60' : '#e74c3c';
}

function renderTasks() {
    const list = document.getElementById('task-list');
    list.innerHTML = tasks.map(t => 
        '<li class="task-item"><span>' + t.title + '</span><strong>' + t.status + '</strong></li>'
    ).join('');
}

function logout() {
    setCookie('userSession', '', -1);
    currentUser = null;
    toggleView('login-view');
}

window.onload = init;