// Connect to server
const socket = io(); // assumes server hosted same origin; otherwise pass URL

// DOM elements
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const usersList = document.getElementById('users');
const typingIndicator = document.getElementById('typingIndicator');

let myUsername = null;
let typingTimeout = null;

// Helpers
function appendMessage({ username, text, time, me=false }) {
  const msgEl = document.createElement('div');
  msgEl.classList.add('message');
  if (me) msgEl.classList.add('me');

  const meta = document.createElement('div');
  meta.className = 'meta';
  const t = new Date(time).toLocaleTimeString();
  meta.textContent = `${username} • ${t}`;

  const body = document.createElement('div');
  body.className = 'body';
  body.textContent = text;

  msgEl.appendChild(meta);
  msgEl.appendChild(body);
  messagesDiv.appendChild(msgEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendSystem(text) {
  const el = document.createElement('div');
  el.className = 'system';
  el.textContent = text;
  messagesDiv.appendChild(el);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Join button
joinBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) {
    alert('Please enter a name');
    return;
  }
  myUsername = name;
  socket.emit('setUsername', name);

  usernameInput.disabled = true;
  joinBtn.disabled = true;
  messageInput.disabled = false;
  sendBtn.disabled = false;
  messageInput.focus();
});

// Send message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  } else {
    socket.emit('typing', true);
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit('typing', false), 800);
  }
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('sendMessage', text);
  // show locally as 'me' with time now
  appendMessage({ username: myUsername || 'Me', text, time: new Date().toISOString(), me: true });
  messageInput.value = '';
  socket.emit('typing', false);
}

// Socket events
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('newMessage', (payload) => {
  // don't double-add messages sent by this client (we already append "me")
  if (payload.username === myUsername) return;
  appendMessage({ username: payload.username, text: payload.text, time: payload.time });
});

socket.on('systemMessage', (txt) => {
  appendSystem(txt);
});

socket.on('userList', (list) => {
  usersList.innerHTML = '';
  list.forEach(u => {
    const li = document.createElement('li');
    li.textContent = u;
    usersList.appendChild(li);
  });
});

socket.on('typing', ({ username, isTyping }) => {
  if (!username || username === myUsername) return;
  typingIndicator.textContent = isTyping ? `${username} is typing...` : '';
});
