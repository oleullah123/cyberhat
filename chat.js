// ============ CYBER HAT — visitor live chat ============
import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, collection, query, orderBy, onSnapshot, serverTimestamp, writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const form = document.getElementById('chat-form');
const box = document.getElementById('chat-box');
const errEl = document.getElementById('chat-error');

if (form && box) {
  const configured = firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PASTE');
  const showError = (m) => { errEl.textContent = m; errEl.hidden = false; };

  if (!configured) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showError('Live chat is not configured yet. Please reach us on WhatsApp: +880 1617-700502');
    });
  } else {
    start();
  }
}

function start() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const msgsEl = document.getElementById('chat-msgs');
  const sendForm = document.getElementById('chat-send-form');
  const input = document.getElementById('chat-input');
  const titleEl = document.getElementById('chat-title');
  let currentUid = null;
  let unsub = null;

  const fmt = (ts) => {
    const d = ts && ts.toDate ? ts.toDate() : new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  function openChat(uid, name) {
    currentUid = uid;
    form.closest('.contact-form-inner').hidden = true;
    box.hidden = false;
    titleEl.textContent = 'Chat with Cyber Hat';
    if (name) document.getElementById('chat-sub').textContent = 'Hi ' + name.split(' ')[0] + ' — we usually reply within minutes';
    if (unsub) unsub();
    const q = query(collection(db, 'chats', uid, 'messages'), orderBy('createdAt'));
    unsub = onSnapshot(q, (snap) => {
      msgsEl.querySelectorAll('.bubble').forEach(n => n.remove());
      snap.forEach(d => {
        const m = d.data();
        const b = document.createElement('div');
        b.className = 'bubble ' + (m.from === 'visitor' ? 'me' : 'them');
        const t = document.createElement('span');
        t.textContent = m.text;               // textContent => XSS-safe
        const tm = document.createElement('time');
        tm.textContent = fmt(m.createdAt);
        b.append(t, tm);
        msgsEl.appendChild(b);
      });
      msgsEl.scrollTop = msgsEl.scrollHeight;
    }, (e) => console.error(e));
  }

  // Returning visitor: reopen their existing conversation
  onAuthStateChanged(auth, async (user) => {
    if (!user || currentUid) return;
    try {
      const snap = await getDoc(doc(db, 'chats', user.uid));
      if (snap.exists()) openChat(user.uid, snap.data().name);
    } catch (e) { /* no chat yet */ }
  });

  // First message = the contact form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.hidden = true;
    const btn = form.querySelector('.submit-btn');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Connecting…';
    try {
      const user = auth.currentUser || (await signInAnonymously(auth)).user;
      const v = (id) => document.getElementById(id).value.trim();
      const data = { name: v('name'), org: v('org'), phone: v('phone'), need: v('need'), brief: v('brief') };
      const batch = writeBatch(db);
      batch.set(doc(db, 'chats', user.uid), {
        ...data,
        createdAt: serverTimestamp(),
        lastMessage: data.brief.slice(0, 120),
        lastMessageAt: serverTimestamp(),
        unreadAdmin: true
      });
      batch.set(doc(collection(db, 'chats', user.uid, 'messages')), {
        text: data.brief, from: 'visitor', createdAt: serverTimestamp()
      });
      await batch.commit();
      openChat(user.uid, data.name);
    } catch (err) {
      console.error(err);
      showError('Could not start the chat. Please try again, or message us on WhatsApp.');
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  });

  // Follow-up messages
  sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || !currentUid) return;
    input.value = ''; input.style.height = '';
    try {
      const batch = writeBatch(db);
      batch.set(doc(collection(db, 'chats', currentUid, 'messages')), {
        text: text.slice(0, 2000), from: 'visitor', createdAt: serverTimestamp()
      });
      batch.update(doc(db, 'chats', currentUid), {
        lastMessage: text.slice(0, 120), lastMessageAt: serverTimestamp(), unreadAdmin: true
      });
      await batch.commit();
    } catch (err) {
      console.error(err);
      input.value = text;
      showError('Message failed to send. Check your connection and try again.');
    }
  });

  // Enter = send, Shift+Enter = new line
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendForm.requestSubmit(); }
  });
}
