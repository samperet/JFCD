// Chat Application State
const app = {
    currentUser: null,
    users: {
        'Jaya': { avatar: '🎨', color: '#FF6B6B' },
        'Fiona': { avatar: '🎭', color: '#4ECDC4' },
        'Lucy': { avatar: '🌟', color: '#FFE66D' },
        'Cece': { avatar: '🚀', color: '#95E1D3' }
    },
    messages: [],
    db: null,
    sw: null,
    notificationsEnabled: false,
    unreadCount: 0,
    menuOpen: false
};

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const messageForm = document.getElementById('messageForm');
const menuBtn = document.getElementById('menuBtn');
const hamburgerMenu = document.getElementById('hamburgerMenu');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const menuBackdrop = document.querySelector('.menu-backdrop');
const avatarBtn = document.querySelector('.avatar-btn');
const avatarModal = document.getElementById('avatarModal');
const closeBtn = document.querySelector('.close-btn');
const currentUserAvatar = document.getElementById('currentUserAvatar');
const currentUserName = document.getElementById('currentUserName');
const notificationBadge = document.getElementById('notificationBadge');
const userBtns = document.querySelectorAll('.user-btn');
const avatarOptions = document.querySelectorAll('.avatar-option');
const menuUserItems = document.querySelectorAll('.menu-user-item');
const menuNotificationsBtn = document.getElementById('menuNotificationsBtn');

// Initialize IndexedDB
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('JFCDDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            app.db = request.result;
            resolve();
        };

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('messages')) {
                db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('users')) {
                db.createObjectStore('users', { keyPath: 'name' });
            }
        };
    });
}

// Save message to IndexedDB
async function saveMessage(message) {
    return new Promise((resolve, reject) => {
        const transaction = app.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        const request = store.add(message);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

// Load messages from IndexedDB
async function loadMessages() {
    return new Promise((resolve, reject) => {
        const transaction = app.db.transaction(['messages'], 'readonly');
        const store = transaction.objectStore('messages');
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            app.messages = request.result;
            resolve(request.result);
        };
    });
}

// Save user avatar to IndexedDB
async function saveUserAvatar(userName, avatar) {
    return new Promise((resolve, reject) => {
        const transaction = app.db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const userData = { name: userName, avatar: avatar };
        const request = store.put(userData);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

// Load user avatars from IndexedDB
async function loadUserAvatars() {
    return new Promise((resolve, reject) => {
        const transaction = app.db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            request.result.forEach(userData => {
                if (app.users[userData.name]) {
                    app.users[userData.name].avatar = userData.avatar;
                }
            });
            resolve();
        };
    });
}

// Request notification permissions
async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Notifications not supported in this browser');
        return false;
    }

    if (Notification.permission === 'granted') {
        app.notificationsEnabled = true;
        return true;
    }

    if (Notification.permission !== 'denied') {
        try {
            const permission = await Notification.requestPermission();
            app.notificationsEnabled = permission === 'granted';
            return app.notificationsEnabled;
        } catch (error) {
            console.error('Notification permission error:', error);
            return false;
        }
    }

    return false;
}

// Send notification
async function sendNotification(title, options = {}) {
    if (!app.notificationsEnabled || !app.sw) return;

    try {
        app.sw.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: title,
            options: {
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23007AFF" width="192" height="192" rx="40"/><text x="50%" y="50%" font-size="100" font-weight="bold" dominant-baseline="middle" text-anchor="middle" fill="white">J</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%23007AFF" width="192" height="192" rx="40"/><text x="50%" y="50%" font-size="100" font-weight="bold" dominant-baseline="middle" text-anchor="middle" fill="white">J</text></svg>',
                tag: 'jfcd-message',
                requireInteraction: false,
                ...options
            }
        });
    } catch (error) {
        console.error('Notification error:', error);
    }
}

// Update unread count
function updateUnreadCount() {
    const unreadMessages = app.messages.filter(msg => msg.sender !== app.currentUser);
    app.unreadCount = unreadMessages.length;

    if (app.unreadCount > 0) {
        document.title = `JFCD (${app.unreadCount})`;
        notificationBadge.textContent = app.unreadCount;
        notificationBadge.style.display = 'inline-block';
    } else {
        document.title = 'JFCD';
        notificationBadge.style.display = 'none';
    }
}

// Format time
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Display messages
async function renderMessages() {
    if (app.messages.length === 0) {
        messagesContainer.innerHTML = '<div class="welcome-message"><p>No messages yet</p></div>';
        return;
    }

    messagesContainer.innerHTML = '';

    app.messages.forEach((msg, index) => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${msg.sender === app.currentUser ? 'own' : ''}`;

        const messageGroup = document.createElement('div');
        messageGroup.className = 'message-group';

        // Show avatar and name for first message or when sender changes
        const showSenderInfo = msg.sender !== app.currentUser &&
            (index === 0 || app.messages[index - 1].sender !== msg.sender);

        if (msg.sender !== app.currentUser) {
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = app.users[msg.sender].avatar;
            messageEl.appendChild(avatar);
        }

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = msg.text;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = formatTime(new Date(msg.timestamp));

        messageGroup.appendChild(bubble);
        messageGroup.appendChild(time);

        messageEl.appendChild(messageGroup);
        messagesContainer.appendChild(messageEl);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    updateUnreadCount();
}

// Send message
async function sendMessage(e) {
    e.preventDefault();

    const text = messageInput.value.trim();
    if (!text) return;

    const message = {
        sender: app.currentUser,
        text: text,
        timestamp: new Date().toISOString()
    };

    await saveMessage(message);
    app.messages.push(message);

    // Simulate other users responding
    simulateOtherUserMessages();

    messageInput.value = '';
    await renderMessages();
    messageInput.focus();
}

// Simulate other users sending messages (demo)
function simulateOtherUserMessages() {
    if (Math.random() > 0.7) {
        const otherUsers = Object.keys(app.users).filter(name => name !== app.currentUser);
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];

        const responses = [
            '😄 Ha! That\'s great!',
            'Totally agree! 👍',
            '🔥 Nice one!',
            'Let\'s go! 🚀',
            'I\'m in! 🎉',
            'Sounds good to me 💯',
            'Can\'t wait! ⏰',
            'Love it! ❤️'
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        setTimeout(async () => {
            const message = {
                sender: randomUser,
                text: randomResponse,
                timestamp: new Date().toISOString()
            };

            await saveMessage(message);
            app.messages.push(message);
            await renderMessages();

            if (!document.hasFocus()) {
                const senderAvatar = app.users[randomUser].avatar;
                await sendNotification(`${randomUser} ${senderAvatar}`, {
                    body: randomResponse,
                    tag: `msg-${message.timestamp}`,
                    data: { url: '/' }
                });
            }
        }, 500 + Math.random() * 1500);
    }
}

// Login user
async function loginUser(userName) {
    app.currentUser = userName;
    currentUserName.textContent = userName;
    currentUserAvatar.textContent = app.users[userName].avatar;

    sessionStorage.setItem('currentUser', userName);

    await loadMessages();
    await renderMessages();

    if (Notification.permission === 'granted') {
        app.notificationsEnabled = true;
    }
    updateNotificationButton();
    updateMenuUserSelection();

    loginScreen.classList.remove('active');
    chatScreen.classList.add('active');
    messageInput.focus();

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateUnreadCount();
        }
    });
}

// Logout / Switch user
function logout() {
    app.currentUser = null;
    app.unreadCount = 0;
    document.title = 'JFCD';
    sessionStorage.removeItem('currentUser');
    messageInput.value = '';
    closeMenu();
    loginScreen.classList.add('active');
    chatScreen.classList.remove('active');
    messagesContainer.innerHTML = '<div class="welcome-message"><p>No messages yet</p></div>';
}

// Hamburger Menu
function openMenu() {
    hamburgerMenu.classList.add('active');
    app.menuOpen = true;
}

function closeMenu() {
    hamburgerMenu.classList.remove('active');
    app.menuOpen = false;
}

function toggleMenu() {
    if (app.menuOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}

function updateMenuUserSelection() {
    menuUserItems.forEach(item => {
        const user = item.dataset.user;
        if (user === app.currentUser) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Avatar Management
function openAvatarPicker() {
    avatarModal.classList.add('active');
    updateAvatarSelection();
}

function closeAvatarPicker() {
    avatarModal.classList.remove('active');
}

function updateAvatarSelection() {
    const currentAvatar = app.users[app.currentUser].avatar;
    avatarOptions.forEach(option => {
        if (option.dataset.avatar === currentAvatar) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

async function changeAvatar(newAvatar) {
    app.users[app.currentUser].avatar = newAvatar;
    currentUserAvatar.textContent = newAvatar;
    await saveUserAvatar(app.currentUser, newAvatar);
    closeAvatarPicker();
    await renderMessages();
}

// Notifications
function updateNotificationButton() {
    const status = document.getElementById('notificationStatus');
    if (app.notificationsEnabled) {
        status.textContent = '🔔 Notifications Enabled';
    } else if (Notification.permission === 'denied') {
        status.textContent = '🔕 Notifications Blocked';
    } else {
        status.textContent = '🔔 Enable Notifications';
    }
}

// Event Listeners - Form
messageForm.addEventListener('submit', sendMessage);

// Event Listeners - Login
userBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const userName = btn.dataset.user;
        loginUser(userName);
    });
});

// Event Listeners - Menu
menuBtn.addEventListener('click', toggleMenu);
closeMenuBtn.addEventListener('click', closeMenu);
menuBackdrop.addEventListener('click', closeMenu);

menuUserItems.forEach(item => {
    item.addEventListener('click', () => {
        const user = item.dataset.user;
        if (user !== app.currentUser) {
            loginUser(user);
        }
    });
});

menuNotificationsBtn.addEventListener('click', async () => {
    if (app.notificationsEnabled) {
        alert('Notifications are already enabled!');
    } else {
        const granted = await requestNotificationPermission();
        if (granted) {
            updateNotificationButton();
            await sendNotification('Notifications Enabled! 🎉', {
                body: 'You\'ll now get alerts for new messages.'
            });
        } else {
            alert('Notification permission was denied.');
        }
    }
});

// Event Listeners - Avatar
avatarBtn.addEventListener('click', openAvatarPicker);
closeBtn.addEventListener('click', closeAvatarPicker);

avatarOptions.forEach(option => {
    option.addEventListener('click', () => {
        changeAvatar(option.dataset.avatar);
    });
});

// Modal backdrop click
avatarModal.addEventListener('click', (e) => {
    if (e.target === avatarModal) {
        closeAvatarPicker();
    }
});

// Initialize
(async () => {
    await initDB();
    await loadUserAvatars();

    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        await loginUser(savedUser);
    }
})();

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            app.sw = registration;
            console.log('✓ Service Worker registered');
        })
        .catch(err => {
            console.log('Service Worker registration failed:', err);
        });

    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'NOTIFICATION_CLICKED') {
            window.focus();
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
}
