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
    unreadCount: 0
};

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const messageForm = document.getElementById('messageForm');
const logoutBtn = document.querySelector('.logout-btn');
const avatarBtn = document.querySelector('.avatar-btn');
const avatarModal = document.getElementById('avatarModal');
const closeBtn = document.querySelector('.close-btn');
const currentUserAvatar = document.getElementById('currentUserAvatar');
const currentUserName = document.getElementById('currentUserName');
const userBtns = document.querySelectorAll('.user-btn');
const avatarOptions = document.querySelectorAll('.avatar-option');

// Initialize IndexedDB
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('ChatDB', 1);

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
        // Use service worker to send notification
        app.sw.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: title,
            options: {
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%236366f1" width="192" height="192"/><text x="50%" y="50%" font-size="120" dominant-baseline="middle" text-anchor="middle" fill="white">💬</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%236366f1" width="192" height="192"/><text x="50%" y="50%" font-size="120" dominant-baseline="middle" text-anchor="middle" fill="white">💬</text></svg>',
                tag: 'chathub-message',
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

    // Update document title
    if (app.unreadCount > 0) {
        document.title = `ChatHub (${app.unreadCount})`;
    } else {
        document.title = 'ChatHub';
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
    // Clear container but keep welcome message if no messages
    if (app.messages.length === 0) {
        messagesContainer.innerHTML = '<div class="welcome-message"><p>Welcome! Start chatting...</p></div>';
        return;
    }

    messagesContainer.innerHTML = '';

    app.messages.forEach(msg => {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${msg.sender === app.currentUser ? 'own' : ''}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = app.users[msg.sender].avatar;

        const content = document.createElement('div');
        content.className = 'message-content';

        const sender = document.createElement('div');
        sender.className = 'message-sender';
        sender.textContent = msg.sender;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = msg.text;

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = formatTime(new Date(msg.timestamp));

        content.appendChild(sender);
        content.appendChild(bubble);
        content.appendChild(time);

        messageEl.appendChild(avatar);
        messageEl.appendChild(content);

        messagesContainer.appendChild(messageEl);
    });

    // Scroll to bottom
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

    // Save to DB
    await saveMessage(message);
    app.messages.push(message);

    // Simulate receiving messages from other users (for demo)
    // In production, this would come from a server
    simulateOtherUserMessages();

    // Clear input and render
    messageInput.value = '';
    await renderMessages();
    updateUnreadCount();
    messageInput.focus();
}

// Simulate other users sending messages (demo only)
function simulateOtherUserMessages() {
    // 30% chance another user responds
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

        // Simulate slight delay
        setTimeout(async () => {
            const message = {
                sender: randomUser,
                text: randomResponse,
                timestamp: new Date().toISOString()
            };

            await saveMessage(message);
            app.messages.push(message);
            await renderMessages();
            updateUnreadCount();

            // Send notification if window not focused
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

    // Save to session storage
    sessionStorage.setItem('currentUser', userName);

    // Load messages
    await loadMessages();
    await renderMessages();

    // Check notification permission status
    if (Notification.permission === 'granted') {
        app.notificationsEnabled = true;
    }
    updateNotificationButton();

    // Switch screens
    loginScreen.classList.remove('active');
    chatScreen.classList.add('active');
    messageInput.focus();

    // Reset unread count when user is active
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            updateUnreadCount();
        }
    });
}

// Logout
function logout() {
    app.currentUser = null;
    app.unreadCount = 0;
    document.title = 'ChatHub';
    sessionStorage.removeItem('currentUser');
    messageInput.value = '';
    loginScreen.classList.add('active');
    chatScreen.classList.remove('active');
    messagesContainer.innerHTML = '<div class="welcome-message"><p>Welcome! Start chatting...</p></div>';
}

// Open avatar picker
function openAvatarPicker() {
    avatarModal.classList.add('active');
    updateAvatarSelection();
}

// Close avatar picker
function closeAvatarPicker() {
    avatarModal.classList.remove('active');
}

// Update avatar selection UI
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

// Change avatar
async function changeAvatar(newAvatar) {
    app.users[app.currentUser].avatar = newAvatar;
    currentUserAvatar.textContent = newAvatar;
    await saveUserAvatar(app.currentUser, newAvatar);
    closeAvatarPicker();
    await renderMessages();
}

// Event Listeners
messageForm.addEventListener('submit', sendMessage);

userBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const userName = btn.dataset.user;
        loginUser(userName);
    });
});

logoutBtn.addEventListener('click', logout);
avatarBtn.addEventListener('click', openAvatarPicker);
closeBtn.addEventListener('click', closeAvatarPicker);

// Notification button
const notificationsBtn = document.getElementById('notificationsBtn');
notificationsBtn.addEventListener('click', async () => {
    if (app.notificationsEnabled) {
        // Already enabled
        alert('Notifications are already enabled!');
        return;
    }

    notificationsBtn.classList.add('requesting');
    const granted = await requestNotificationPermission();
    notificationsBtn.classList.remove('requesting');

    if (granted) {
        notificationsBtn.classList.add('enabled');
        await sendNotification('Notifications Enabled! 🎉', {
            body: 'You\'ll now get alerts for new messages.'
        });
    } else {
        alert('Notification permission was denied.');
    }
});

// Update notification button state
function updateNotificationButton() {
    if (app.notificationsEnabled) {
        notificationsBtn.classList.add('enabled');
        notificationsBtn.classList.remove('disabled');
        notificationsBtn.title = 'Notifications enabled ✓';
    } else {
        notificationsBtn.classList.remove('enabled');
        if (Notification.permission === 'denied') {
            notificationsBtn.classList.add('disabled');
            notificationsBtn.title = 'Notifications blocked (change in browser settings)';
        } else {
            notificationsBtn.title = 'Click to enable notifications';
        }
    }
}

avatarOptions.forEach(option => {
    option.addEventListener('click', () => {
        changeAvatar(option.dataset.avatar);
    });
});

// Close modal on background click
avatarModal.addEventListener('click', (e) => {
    if (e.target === avatarModal) {
        closeAvatarPicker();
    }
});

// Prevent modal close on content click
document.querySelector('.modal-content')?.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Initialize
(async () => {
    await initDB();
    await loadUserAvatars();

    // Check if user was logged in
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        await loginUser(savedUser);
    }
})();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            app.sw = registration;
            console.log('✓ Service Worker registered');
        })
        .catch(err => {
            console.log('Service Worker registration failed:', err);
        });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data.type === 'NOTIFICATION_CLICKED') {
            window.focus();
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
}
