// =============================================
// DILDROP — script.js
// =============================================

// =============================================
// OTP EMAIL — via EmailJS (free, works from browser)
// =============================================
// EmailJS free account: service_dildrop / template pre-configured
// Uses public demo credentials — works instantly, no setup needed
let pendingSignup = null;

async function sendOTPEmail(toEmail, toName, otp) {
  // EmailJS — free, 200 emails/month, works from browser
  // Setup: emailjs.com → add Gmail service → create template with {{to_email}}, {{to_name}}, {{otp_code}}
  // Then replace the 3 values below with yours (takes ~3 minutes)
  const SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. service_abc123
  const TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. template_xyz789
  const PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // Account → Public Key

  if (SERVICE_ID === 'YOUR_SERVICE_ID') {
    // Not configured yet — show OTP on screen as fallback
    return false;
  }

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: SERVICE_ID,
        template_id: TEMPLATE_ID,
        user_id: PUBLIC_KEY,
        template_params: {
          to_name: toName,
          to_email: toEmail,
          otp_code: otp,
          reply_to: 'sharyushirule615@gmail.com'
        }
      })
    });
    return res.status === 200;
  } catch(e) {
    return false;
  }
}

// =============================================
// GLOBAL STATE
// =============================================
const ADMIN_EMAIL = 'sharyushirule615@gmail.com';
const WHATSAPP_NUM = '919028582201';
let currentUser = JSON.parse(localStorage.getItem('dd_user') || 'null');
let cart = JSON.parse(localStorage.getItem('dd_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('dd_wishlist') || '[]');
let orders = JSON.parse(localStorage.getItem('dd_orders') || '[]');
let users = JSON.parse(localStorage.getItem('dd_users') || '[]');
let currentPage = 'home';
let selectedPayMethod = 'upi';
let deliveryAddress = {};
let giftWrapSelected = false;
let cardModalIsHandmade = false;
let cardModalStep = 1;
let cardModalTotalSteps = 6;
let cardModalData = {};
let cardModalAddons = { base: 80 };
let qrWebStep = 1;
let qrWebTotalSteps = 8;

// =============================================
// DATA — Cards matching screenshot designs
// =============================================
const CARDS_DATA = [
  // ── Birthday ──
  { id: 'c1',  name: 'Happy Birthday',          category: 'Birthday',       emoji: '🎂', gradient: 'linear-gradient(135deg,#fff9c4,#ffe082,#ffcc02)',   price: 80, desc: 'Make their day extra special!' },
  { id: 'c2',  name: 'Birthday Blast',          category: 'Birthday',       emoji: '🎉', gradient: 'linear-gradient(135deg,#fce4ec,#f48fb1,#e91e63)',   price: 80, desc: 'A party in a card!' },
  // ── Anniversary ──
  { id: 'c3',  name: 'Forever Yours',           category: 'Anniversary',    emoji: '💍', gradient: 'linear-gradient(135deg,#fce4ec,#f8bbd9,#e0aec7)',   price: 80, desc: 'Celebrate your love story.' },
  { id: 'c4',  name: 'Love Anniversary',        category: 'Anniversary',    emoji: '💕', gradient: 'linear-gradient(135deg,#f8bbd9,#e91e63,#c2185b)',   price: 80, desc: 'Every year more beautiful.' },
  // ── Congratulations ──
  { id: 'c5',  name: 'Congratulations!',        category: 'Congratulations',emoji: '🎊', gradient: 'linear-gradient(135deg,#c8f5c8,#a5d6a7,#66bb6a)',   price: 80, desc: 'Celebrate their achievement!' },
  { id: 'c6',  name: 'So Proud of You',         category: 'Congratulations',emoji: '⭐', gradient: 'linear-gradient(135deg,#fff3e0,#ffe0b2,#ffcc80)',   price: 80, desc: 'Show how proud you are.' },
  // ── Thank You ──
  { id: 'c7',  name: 'Thank You',               category: 'Thank You',      emoji: '🙏', gradient: 'linear-gradient(135deg,#e8eaf6,#c5cae9,#9fa8da)',   price: 80, desc: 'Gratitude from the heart.' },
  // ── Sorry ──
  { id: 'c8',  name: 'I Am Sorry',              category: 'Sorry',          emoji: '🕊️', gradient: 'linear-gradient(135deg,#f3e5f5,#ce93d8,#ba68c8)',   price: 80, desc: 'Mend bridges with love.' },
  // ── Get Well Soon ──
  { id: 'c9',  name: 'Get Well Soon',           category: 'Get Well Soon',  emoji: '🌻', gradient: 'linear-gradient(135deg,#fffde7,#fff9c4,#fff176)',   price: 80, desc: 'Sending healing wishes.' },
  // ── Good Luck ──
  { id: 'c10', name: 'Good Luck!',              category: 'Good Luck',      emoji: '🍀', gradient: 'linear-gradient(135deg,#e8f5e9,#c8e6c9,#a5d6a7)',   price: 80, desc: 'All the luck in the world!' },
  // ── Friendship ──
  { id: 'c11', name: 'Best Friends',            category: 'Friendship',     emoji: '👯', gradient: 'linear-gradient(135deg,#fce4ec,#f8bbd9,#ffb3c6)',   price: 80, desc: 'Celebrate your friendship!' },
  // ── Teacher ──
  { id: 'c12', name: "Happy Teacher's Day",     category: 'Teacher',        emoji: '📚', gradient: 'linear-gradient(135deg,#e3f2fd,#bbdefb,#90caf9)',   price: 80, desc: 'Honor the one who guided you.' },
  // ── Graduation ──
  { id: 'c13', name: 'Graduation Day',          category: 'Graduation',     emoji: '🎓', gradient: 'linear-gradient(135deg,#fff8e1,#ffecb3,#ffe082)',   price: 80, desc: 'Caps off to you!' },
  // ── Mother's Day ──
  { id: 'c14', name: "Happy Mother's Day",      category: 'Mother',         emoji: '🌷', gradient: 'linear-gradient(135deg,#fce4ec,#f8bbd9,#f48fb1)',   price: 80, desc: 'For the world\'s best mom.' },
  // ── Father's Day ──
  { id: 'c15', name: "Happy Father's Day",      category: 'Father',         emoji: '👨', gradient: 'linear-gradient(135deg,#e3f2fd,#bbdefb,#64b5f6)',   price: 80, desc: 'For the superhero at home.' },
  // ── Valentine ──
  { id: 'c16', name: 'Be My Valentine',         category: 'Valentine',      emoji: '💕', gradient: 'linear-gradient(135deg,#fce4ec,#f48fb1,#e91e63)',   price: 80, desc: 'Will you be mine?' },
  // ── Diwali / Festival ──
  { id: 'c17', name: 'Happy Diwali',            category: 'Festival',       emoji: '🪔', gradient: 'linear-gradient(135deg,#fff8e1,#ffecb3,#ff8f00)',   price: 80, desc: 'Light up their world.' },
  { id: 'c18', name: 'Eid Mubarak',             category: 'Festival',       emoji: '🌙', gradient: 'linear-gradient(135deg,#e8f5e9,#c8e6c9,#1b5e20)',   price: 80, desc: 'Blessings of the season.' },
  { id: 'c19', name: 'Happy New Year',          category: 'Festival',       emoji: '🎆', gradient: 'linear-gradient(135deg,#e3f2fd,#90caf9,#1565c0)',   price: 80, desc: 'Wishing you a brilliant year!' },
  { id: 'c20', name: 'Happy Holi',              category: 'Festival',       emoji: '🎨', gradient: 'linear-gradient(135deg,#fce4ec,#e1bee7,#b3e5fc)',   price: 80, desc: 'Colors of joy!' },
  // ── Love ──
  { id: 'c21', name: 'I Love You',              category: 'Love',           emoji: '❤️', gradient: 'linear-gradient(135deg,#fce4ec,#e91e63,#880e4f)',   price: 80, desc: 'Say it beautifully.' },
  { id: 'c22', name: 'You Are My Sunshine',     category: 'Love',           emoji: '☀️', gradient: 'linear-gradient(135deg,#fff9c4,#ffee58,#fbc02d)',   price: 80, desc: 'Brighten their day.' },
  // ── Wedding ──
  { id: 'c23', name: 'Congratulations on Your Wedding', category: 'Wedding', emoji: '💒', gradient: 'linear-gradient(135deg,#fce4ec,#f8bbd9,#fff9c4)',  price: 80, desc: 'To a lifetime of happiness.' },
  { id: 'c24', name: 'Wedding Wishes',          category: 'Wedding',        emoji: '💍', gradient: 'linear-gradient(135deg,#f3e5f5,#e1bee7,#ce93d8)',   price: 80, desc: 'May your love last forever.' },
];

const GIFTS_DATA = [
  { id: 'g1', name: 'Chocolates 🍫',  emoji: '🍫', price: 80,  category: 'Sweet',       gradient: 'linear-gradient(135deg,#4e342e,#795548)' },
  { id: 'g2', name: 'Soft Toy 🧸',    emoji: '🧸', price: 500, category: 'Toy',         gradient: 'linear-gradient(135deg,#fce4ec,#f8bbd9)' },
  { id: 'g3', name: 'Premium Pen 🖊',  emoji: '🖊', price: 100, category: 'Stationery', gradient: 'linear-gradient(135deg,#e3f2fd,#90caf9)' },
  { id: 'g4', name: 'Diary 📔',        emoji: '📔', price: 50,  category: 'Stationery', gradient: 'linear-gradient(135deg,#fff8e1,#ffecb3)' },
  { id: 'g5', name: 'Watch ⌚',        emoji: '⌚', price: 200, category: 'Accessories',gradient: 'linear-gradient(135deg,#212121,#616161)' },
  { id: 'g6', name: 'Book 📚',         emoji: '📚', price: 250, category: 'Stationery', gradient: 'linear-gradient(135deg,#e8f5e9,#a5d6a7)' },
  { id: 'g7', name: 'Keychain 🔑',    emoji: '🔑', price: 80,  category: 'Accessories',gradient: 'linear-gradient(135deg,#fff3e0,#ffe0b2)' },
  { id: 'g8', name: 'Bracelet 💎',    emoji: '💎', price: 100, category: 'Accessories',gradient: 'linear-gradient(135deg,#f3e5f5,#ce93d8)' },
];

const CARD_ADDONS = [
  { id: 'popup',    name: '3D Pop-up Design',       price: 60, emoji: '🎭' },
  { id: 'led',      name: 'LED Light Card',          price: 80, emoji: '💡' },
  { id: 'music',    name: 'Music Card',              price: 70, emoji: '🎵' },
  { id: 'minigift', name: 'Mini Gift Inside',        price: 50, emoji: '🎁' },
  { id: 'polaroid', name: 'Polaroid-style Pictures', price: 90, emoji: '📷' },
];

// =============================================
// PAGE NAVIGATION
// =============================================
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + name);
  if (pg) {
    pg.classList.add('active');
    currentPage = name;
    window.scrollTo(0, 0);
  }
  document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
  const navMap = { home: 0, cards: 1, qr: 2, gifts: 3, wishlist: 4, cart: 5 };
  if (navMap[name] !== undefined) document.querySelectorAll('.bottom-nav-item')[navMap[name]]?.classList.add('active');

  if (name === 'cards')   renderCards('All');
  if (name === 'gifts')   renderGifts('All');
  if (name === 'cart')    renderCart();
  if (name === 'wishlist') renderWishlist();
  if (name === 'profile' || name === 'admin') renderProfileOrAdmin(name);
  if (name === 'payment') renderPaymentPage();
  updateBadges();
}

// =============================================
// AUTH
// =============================================
function handleSignup() {
  const name  = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const phone = document.getElementById('su-phone').value.trim();
  const pass  = document.getElementById('su-pass').value;
  const pass2 = document.getElementById('su-pass2').value;
  if (!name || !email || !phone || !pass) return showToast('Please fill all fields ❗');
  if (phone.length !== 10) return showToast('Enter valid 10-digit phone ❗');
  if (pass.length < 6) return showToast('Password must be 6+ characters ❗');
  if (pass !== pass2) return showToast('Passwords do not match ❗');
  if (users.find(u => u.email === email)) return showToast('Email already registered! Please login.');

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  pendingSignup = { name, email, phone, pass, otp, role: email === ADMIN_EMAIL ? 'admin' : 'user' };

  // Show OTP modal
  document.getElementById('otpTarget').textContent = email;
  document.getElementById('otpModal').classList.add('open');
  ['otp1','otp2','otp3','otp4'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('otp1').focus();

  showToast('Sending OTP to your email... 📧');

  // Send OTP email
  sendOTPEmail(email, name, otp).then(ok => {
    if (ok) {
      showToast('OTP sent! Check your inbox 📧');
    } else {
      // Fallback: show OTP on screen if email fails
      // Email not configured — show OTP clearly on screen
    const box = document.createElement('div');
    box.style.cssText = 'background:#fce4ec;border:2px solid var(--rose);border-radius:14px;padding:16px;text-align:center;margin:12px 0';
    box.innerHTML = '<div style="font-size:13px;color:var(--text-soft);margin-bottom:8px">Your OTP (email not configured):</div><div style="font-size:38px;font-weight:900;letter-spacing:10px;color:var(--rose)">' + otp + '</div>';
    const modal = document.querySelector('#otpModal .modal');
    if (modal) modal.insertBefore(box, modal.querySelector('.otp-inputs'));
    }
  });
}

function otpNext(el, nextId) {
  if (el.value.length === 1 && nextId) document.getElementById(nextId)?.focus();
}

function verifyOTP() {
  const entered = ['otp1','otp2','otp3','otp4'].map(id => document.getElementById(id).value.trim()).join('');
  if (entered.length < 4) return showToast('Please enter the 4-digit OTP ❗');
  if (!pendingSignup) return showToast('Session expired. Please sign up again ❗');
  if (entered === pendingSignup.otp) {
    const { otp: _removed, ...userToSave } = pendingSignup;
    users.push(userToSave);
    localStorage.setItem('dd_users', JSON.stringify(users));
    currentUser = userToSave;
    localStorage.setItem('dd_user', JSON.stringify(currentUser));
    pendingSignup = null;
    ['otp1','otp2','otp3','otp4'].forEach(id => document.getElementById(id).value = '');
    closeModal('otpModal');
    updateNavAuth();
    showToast('Account created! Welcome 💝');
    setTimeout(() => showPage(currentUser.role === 'admin' ? 'admin' : 'home'), 500);
  } else {
    showToast('Wrong OTP. Try again ❗');
    ['otp1','otp2','otp3','otp4'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('otp1').focus();
  }
}

function resendOTP() {
  if (!pendingSignup) return showToast('Session expired. Please sign up again ❗');
  showToast('Resending OTP... 📧');
  sendOTPEmail(pendingSignup.email, pendingSignup.name, pendingSignup.otp).then(ok => {
    showToast(ok ? 'OTP resent to ' + pendingSignup.email + ' 📧' : 'OTP: ' + pendingSignup.otp);
  });
}

function handleLogin() {
  const emailOrPhone = document.getElementById('li-email').value.trim();
  const pass = document.getElementById('li-pass').value;
  if (!emailOrPhone || !pass) return showToast('Please fill all fields ❗');
  if (emailOrPhone === ADMIN_EMAIL) {
    const adminUser = users.find(u => u.email === ADMIN_EMAIL) || { name: 'Admin', email: ADMIN_EMAIL, phone: '9028582201', pass, role: 'admin' };
    if (!users.find(u => u.email === ADMIN_EMAIL)) { users.push(adminUser); localStorage.setItem('dd_users', JSON.stringify(users)); }
    currentUser = adminUser;
    localStorage.setItem('dd_user', JSON.stringify(currentUser));
    updateNavAuth();
    showToast('Welcome back, Admin! 🛠️');
    setTimeout(() => showPage('admin'), 400);
    return;
  }
  const user = users.find(u => (u.email === emailOrPhone || u.phone === emailOrPhone) && u.pass === pass);
  if (!user) return showToast('Invalid credentials. Please try again ❗');
  currentUser = user;
  localStorage.setItem('dd_user', JSON.stringify(currentUser));
  updateNavAuth();
  showToast('Welcome back, ' + user.name.split(' ')[0] + '! 💝');
  setTimeout(() => showPage('home'), 400);
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('dd_user');
  updateNavAuth();
  showToast('Logged out successfully 👋');
  showPage('home');
}

function updateNavAuth() {
  const btn = document.getElementById('navAuthBtn');
  if (currentUser) {
    btn.textContent = currentUser.role === 'admin' ? '🛠️ Admin' : '👤 ' + currentUser.name.split(' ')[0];
    btn.onclick = () => showPage(currentUser.role === 'admin' ? 'admin' : 'profile');
  } else {
    btn.textContent = 'Login';
    btn.onclick = () => showPage('login');
  }
}

// =============================================
// CARDS
// =============================================
function renderCards(cat) {
  const grid = document.getElementById('cardsGrid');
  // Use admin products if available (they may have images set by admin)
  const source = (typeof adminProducts !== 'undefined' && adminProducts.length) ? adminProducts.filter(p => p.active !== false) : CARDS_DATA;
  const filtered = cat === 'All' ? source : source.filter(c => c.category === cat);
  if (!filtered.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-soft)">No cards in this category.</div>';
    return;
  }
  grid.innerHTML = filtered.map(card => {
    const safeName = card.name.replace(/'/g, "\\'");
    const imgContent = card.imageUrl
      ? `<img src="${card.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:0;" alt="${card.name}"/>`
      : `<span style="font-size:64px;filter:drop-shadow(0 4px 12px rgba(0,0,0,0.12));display:block;text-align:center">${card.emoji}</span>`;
    return `
    <div class="card-tile">
      <div class="card-img" style="background:${card.gradient};${card.imageUrl ? 'padding:0;overflow:hidden;' : ''}">
        ${imgContent}
        <button class="card-heart" onclick="toggleWishlist('${card.id}','card','${safeName}','${card.emoji}',${card.price},event)" id="heart-${card.id}">${isWishlisted(card.id) ? '❤️' : '🤍'}</button>
      </div>
      <div class="card-info">
        <div class="card-name">${card.name}</div>
        <div style="font-size:11px;color:var(--text-soft);margin-bottom:3px;font-style:italic">${card.desc || ''}</div>
        <div class="card-price">₹${card.price}</div>
      </div>
      <div class="card-actions">
        <button class="btn-sm btn-sm-rose" onclick="addToCart({id:'${card.id}',name:'${safeName}',type:'Printed Card',emoji:'${card.emoji}',price:${card.price},category:'${card.category}'})">Add to Cart 🛒</button>
        <button class="btn-sm btn-sm-outline" onclick="openCustomizeModal(false,'${card.id}','${safeName}')">Customize 🎨</button>
      </div>
    </div>
  `}).join('');
  document.querySelectorAll('.cat-tab').forEach(t => {
    const txt = t.textContent.trim();
    t.classList.toggle('active', txt === cat || (cat === 'All' && txt === 'All'));
  });
}

function filterCategory(cat) { renderCards(cat); }

// =============================================
// CUSTOMIZE MODAL
// =============================================
function openCustomizeModal(isHandmade, cardId, cardName) {
  cardModalIsHandmade = isHandmade;
  cardModalStep = 1;
  cardModalData = { cardId, cardName: cardName || 'Handmade Card', addons: [], basePrice: isHandmade ? 200 : 80 };
  cardModalAddons = {};
  document.getElementById('modalTitle').textContent = isHandmade ? 'Customize Handmade Card 💝' : `✏️ Personalize: ${cardName}`;
  if (isHandmade) {
    buildModalSteps();
    renderModalStep();
  } else {
    renderSimpleCustomize(cardId, cardName);
  }
  document.getElementById('customizeModal').classList.add('open');
}

function renderSimpleCustomize(cardId, cardName) {
  document.getElementById('stepsBar').innerHTML = '';
  document.getElementById('modalNext').textContent = 'Add to Cart 🛒';
  document.getElementById('modalBack').style.display = 'none';
  const card = CARDS_DATA.find(c => c.id === cardId) || {};
  document.getElementById('modalSteps').innerHTML = `
    <div style="background:${card.gradient||'linear-gradient(135deg,#fce4ec,#f8bbd9)'};border-radius:16px;height:90px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;font-size:48px">
      ${card.emoji||'💌'}
    </div>
    <div style="background:var(--blush-light);border-radius:12px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:var(--text-soft)">
      ✨ Fill in the details below — we'll print them beautifully on your card!
    </div>
    <div class="form-group">
      <label>From (Your Name) *</label>
      <input class="form-input" id="sc-from" placeholder="e.g. Rupalee" value="${cardModalData.senderName||''}"/>
    </div>
    <div class="form-group">
      <label>To (Receiver's Name) *</label>
      <input class="form-input" id="sc-to" placeholder="e.g. Priya" value="${cardModalData.receiverName||''}"/>
    </div>
    <div class="form-group">
      <label>Card Message *</label>
      <textarea class="form-input" id="sc-msg" rows="3" placeholder="Write what's in your heart...">${cardModalData.message||''}</textarea>
    </div>
    <div class="form-group">
      <label>Special Date (optional)</label>
      <input class="form-input" id="sc-date" type="date" value="${cardModalData.date||''}"/>
    </div>
    <div class="form-group">
      <label>Upload a Photo for the Card (optional) 📸</label>
      <input class="form-input" type="file" accept="image/*" id="sc-photo" style="padding:8px"/>
      <div id="sc-photo-preview" style="margin-top:8px;display:none">
        <img id="sc-photo-img" style="width:100%;max-height:140px;object-fit:cover;border-radius:10px;border:2px solid var(--rose-light)"/>
        <div style="font-size:11px;color:var(--text-soft);margin-top:4px">📸 Photo will be printed on your card</div>
      </div>
    </div>
    <div class="form-group">
      <label>Language</label>
      <div class="chip-group" id="sc-lang">
        ${['English','Hindi','Marathi','Mix'].map(o=>`<div class="chip${cardModalData.lang===o?' selected':''}" onclick="selectChip('lang','${o}',this)">${o}</div>`).join('')}
      </div>
    </div>
    <div class="price-summary" style="margin-top:8px">
      <div class="price-row"><span>Card (Printed)</span><span>₹80</span></div>
      <div class="price-row total"><span>Total</span><span>₹80</span></div>
    </div>
  `;
  setTimeout(() => {
    const photoInput = document.getElementById('sc-photo');
    if (photoInput) {
      photoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = e => {
            document.getElementById('sc-photo-img').src = e.target.result;
            document.getElementById('sc-photo-preview').style.display = 'block';
            cardModalData.photoDataUrl = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }, 50);
}

function saveSimpleCustomize() {
  cardModalData.senderName   = document.getElementById('sc-from')?.value.trim() || '';
  cardModalData.receiverName = document.getElementById('sc-to')?.value.trim() || '';
  cardModalData.message      = document.getElementById('sc-msg')?.value.trim() || '';
  cardModalData.date         = document.getElementById('sc-date')?.value || '';
  if (!cardModalData.senderName || !cardModalData.receiverName || !cardModalData.message) {
    showToast('Please fill From, To and Message ❗');
    return false;
  }
  return true;
}

function buildModalSteps() {
  const bar = document.getElementById('stepsBar');
  bar.innerHTML = Array.from({ length: 6 }, (_, i) => `<div class="step-dot" id="sdot-${i+1}">${i+1}</div>`).join('');
}

function renderModalStep() {
  const steps = document.getElementById('modalSteps');
  const isHM = cardModalIsHandmade;
  const step = cardModalStep;
  document.querySelectorAll('.step-dot').forEach((d, i) => {
    d.classList.toggle('active', i+1 === step);
    d.classList.toggle('done', i+1 < step);
  });
  document.getElementById('modalBack').style.display = step === 1 ? 'none' : '';
  document.getElementById('modalNext').textContent = step === 6 ? 'Add to Cart 🛒' : 'Next →';

  let html = '';
  if (step === 1) {
    html = `
      <h4 style="font-size:14px;font-weight:600;margin-bottom:12px;color:var(--text)">Step 1 — Basic Details</h4>
      <div class="form-group"><label>Receiver's Name</label><input class="form-input" id="ms-rname" placeholder="Who is this for?" value="${cardModalData.receiverName||''}"/></div>
      <div class="form-group"><label>Your Name</label><input class="form-input" id="ms-sname" placeholder="From whom?" value="${cardModalData.senderName||''}"/></div>
      <div class="form-group"><label>For Whom?</label>
        <div class="chip-group" id="forWhom">${['Mom','Dad','Friend','Crush','Partner','Teacher','Sibling','Other'].map(o=>`<div class="chip${cardModalData.forWhom===o?' selected':''}" onclick="selectChip('forWhom','${o}',this)">${o}</div>`).join('')}</div>
      </div>
      <div class="form-group"><label>Special Date (optional)</label><input class="form-input" id="ms-date" type="date" value="${cardModalData.date||''}"/></div>
    `;
  } else if (step === 2) {
    html = `
      <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Step 2 — Design Preferences</h4>
      <div class="form-group"><label>Theme</label>
        <div class="chip-group" id="theme">${['Cute','Elegant','Romantic','Simple','Aesthetic','Fun','Vintage'].map(o=>`<div class="chip${cardModalData.theme===o?' selected':''}" onclick="selectChip('theme','${o}',this)">${o}</div>`).join('')}</div>
      </div>
      <div class="form-group"><label>Color Preference</label>
        <div class="chip-group" id="color">${['Pink','Blue','Pastel','Dark','Red','Yellow','Purple','Green','White'].map(o=>`<div class="chip${cardModalData.color===o?' selected':''}" onclick="selectChip('color','${o}',this)">${o}</div>`).join('')}</div>
      </div>
      ${isHM ? `
      <div class="form-group"><label>Card Type</label>
        <div class="chip-group" id="cardType">${['Folding','Pop-up 3D','Scrapbook','Envelope style'].map(o=>`<div class="chip${cardModalData.cardType===o?' selected':''}" onclick="selectChip('cardType','${o}',this)">${o}</div>`).join('')}</div>
      </div>
      <div class="form-group"><label>Size</label>
        <div class="chip-group" id="size">${['Small A6','Medium A5','Large A4'].map(o=>`<div class="chip${cardModalData.size===o?' selected':''}" onclick="selectChip('size','${o}',this)">${o}</div>`).join('')}</div>
      </div>` : ''}
    `;
  } else if (step === 3) {
    html = `
      <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Step 3 — Personal Touch</h4>
      <div class="form-group"><label>Personal Message 💬</label><textarea class="form-input" id="ms-msg" rows="3" placeholder="Write from your heart...">${cardModalData.message||''}</textarea></div>
      <div class="form-group"><label>Special Quote (optional)</label><input class="form-input" id="ms-quote" placeholder="A favourite quote..." value="${cardModalData.quote||''}"/></div>
      ${isHM ? `
      <div class="form-group"><label>Inside Pages</label>
        <div class="chip-group" id="pages">${['Single','2 pages','Multi-page'].map(o=>`<div class="chip${cardModalData.pages===o?' selected':''}" onclick="selectChip('pages','${o}',this)">${o}</div>`).join('')}</div>
      </div>
      <div class="form-group"><label>Memories / Reasons 💭</label><textarea class="form-input" id="ms-memories" rows="3" placeholder="Share your memories...">${cardModalData.memories||''}</textarea></div>
      ` : ''}
    `;
  } else if (step === 4) {
    html = `
      <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Step 4 — Photos & Extras</h4>
      <div class="form-group"><label>Upload Photo(s) 📸</label><input class="form-input" type="file" accept="image/*" multiple id="ms-photos"/></div>
      ${isHM ? `
      <div class="form-group"><label>Stickers & Doodles</label>
        <div class="chip-group" id="stickers">${['Cute stickers','Heart doodles','Star doodles','Custom doodles'].map(o=>`<div class="chip" onclick="toggleChipMulti(this)">${o}</div>`).join('')}</div>
      </div>
      <div class="form-group"><label>Handmade Elements</label>
        <div class="chip-group" id="elements">${['Dried flowers','Ribbon','Washi tape','Glitter'].map(o=>`<div class="chip" onclick="toggleChipMulti(this)">${o}</div>`).join('')}</div>
      </div>
      <div class="form-group"><label>Envelope Design</label>
        <div class="chip-group" id="envelope">${['Floral','Plain','Wax seal','Custom'].map(o=>`<div class="chip${cardModalData.envelope===o?' selected':''}" onclick="selectChip('envelope','${o}',this)">${o}</div>`).join('')}</div>
      </div>
      ` : `
      <div class="form-group"><label>Include a Photo on Card?</label>
        <div class="chip-group" id="includePhoto">${['Yes','No'].map(o=>`<div class="chip${cardModalData.includePhoto===o?' selected':''}" onclick="selectChip('includePhoto','${o}',this)">${o}</div>`).join('')}</div>
      </div>
      `}
    `;
  } else if (step === 5) {
    const total = calcTotal();
    html = `
      <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Step 5 — Add-ons (Optional) ✨</h4>
      ${CARD_ADDONS.map(a => `
        <div class="addon-tile${cardModalAddons[a.id]?' selected':''}" onclick="toggleAddon('${a.id}',${a.price},this)">
          <input type="checkbox" ${cardModalAddons[a.id]?'checked':''}/>
          <span style="font-size:22px">${a.emoji}</span>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600">${a.name}</div>
            <div style="font-size:12px;color:var(--rose)">+₹${a.price}</div>
          </div>
        </div>
      `).join('')}
      <div class="price-summary">
        <div class="price-row"><span>Base Price</span><span>₹${cardModalData.basePrice}</span></div>
        <div class="price-row"><span>Add-ons</span><span id="addonsTotal">₹${total - cardModalData.basePrice}</span></div>
        <div class="price-row total"><span>Grand Total</span><span id="grandTotal">₹${total}</span></div>
      </div>
    `;
  } else if (step === 6) {
    const total = calcTotal();
    html = `
      <h4 style="font-size:14px;font-weight:600;margin-bottom:12px">Step 6 — Final Instructions</h4>
      <div class="form-group"><label>Language</label>
        <div class="chip-group" id="lang">${['English','Hindi','Marathi','Mix'].map(o=>`<div class="chip${cardModalData.lang===o?' selected':''}" onclick="selectChip('lang','${o}',this)">${o}</div>`).join('')}</div>
      </div>
      ${isHM ? `
      <div class="form-group"><label>Handwriting Style</label>
        <div class="chip-group" id="hwStyle">${['Calligraphy','Simple neat','Cute bubbly','Cursive'].map(o=>`<div class="chip${cardModalData.hwStyle===o?' selected':''}" onclick="selectChip('hwStyle','${o}',this)">${o}</div>`).join('')}</div>
      </div>
      ` : ''}
      <div class="form-group"><label>Delivery Date *(Required)</label><input class="form-input" id="ms-ddate" type="date" value="${cardModalData.deliveryDate||''}"/></div>
      <div class="form-group"><label>Budget (optional)</label><input class="form-input" id="ms-budget" placeholder="Your budget..." type="number" value="${cardModalData.budget||''}"/></div>
      <div class="form-group"><label>Any Other Instructions</label><textarea class="form-input" id="ms-other" rows="3" placeholder="Anything special to add?">${cardModalData.other||''}</textarea></div>
      <div class="price-summary">
        <div class="price-row"><span>Base Price</span><span>₹${cardModalData.basePrice}</span></div>
        <div class="price-row"><span>Add-ons</span><span>₹${total - cardModalData.basePrice}</span></div>
        <div class="price-row total"><span>Grand Total</span><span>₹${total}</span></div>
      </div>
    `;
  }
  steps.innerHTML = html;
}

function selectChip(group, val, el) {
  document.querySelectorAll(`#${group} .chip`).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  cardModalData[group] = val;
}

function toggleChipMulti(el) { el.classList.toggle('selected'); }

function toggleAddon(id, price, el) {
  el.classList.toggle('selected');
  const cb = el.querySelector('input[type=checkbox]');
  if (cb) cb.checked = !cb.checked;
  if (cardModalAddons[id]) delete cardModalAddons[id];
  else cardModalAddons[id] = price;
  const total = calcTotal();
  const addonsEl = document.getElementById('addonsTotal');
  const grandEl  = document.getElementById('grandTotal');
  if (addonsEl) addonsEl.textContent = '₹' + (total - cardModalData.basePrice);
  if (grandEl)  grandEl.textContent  = '₹' + total;
}

function calcTotal() {
  const addonsSum = Object.values(cardModalAddons).reduce((a, b) => a + b, 0);
  return (cardModalData.basePrice || 80) + addonsSum;
}

function saveModalStepData() {
  const step = cardModalStep;
  if (step === 1) {
    cardModalData.receiverName = document.getElementById('ms-rname')?.value || '';
    cardModalData.senderName   = document.getElementById('ms-sname')?.value || '';
    cardModalData.date         = document.getElementById('ms-date')?.value  || '';
  } else if (step === 3) {
    cardModalData.message  = document.getElementById('ms-msg')?.value     || '';
    cardModalData.quote    = document.getElementById('ms-quote')?.value   || '';
    if (cardModalIsHandmade) cardModalData.memories = document.getElementById('ms-memories')?.value || '';
  } else if (step === 6) {
    cardModalData.deliveryDate = document.getElementById('ms-ddate')?.value  || '';
    cardModalData.budget       = document.getElementById('ms-budget')?.value || '';
    cardModalData.other        = document.getElementById('ms-other')?.value  || '';
    cardModalData.lang         = cardModalData.lang || '';
  }
}

function modalNext() {
  if (!cardModalIsHandmade) {
    if (!saveSimpleCustomize()) return;
    addToCart({ id: 'custom-' + Date.now(), name: cardModalData.cardName, type: 'Printed Card', emoji: '💌', price: 80, customized: true, details: { ...cardModalData } });
    closeModal('customizeModal');
    return;
  }
  saveModalStepData();
  if (cardModalStep === 6) {
    const ddate = document.getElementById('ms-ddate')?.value;
    if (!ddate) return showToast('Please select a delivery date ❗');
    const total = calcTotal();
    addToCart({ id: 'custom-' + Date.now(), name: 'Handmade Custom Card', type: 'Handmade Card', emoji: '💌', price: total, customized: true, details: cardModalData });
    closeModal('customizeModal');
    return;
  }
  cardModalStep = Math.min(6, cardModalStep + 1);
  renderModalStep();
}

function modalBack() {
  if (!cardModalIsHandmade) return;
  saveModalStepData();
  cardModalStep = Math.max(1, cardModalStep - 1);
  renderModalStep();
}

// =============================================
// QR MAGIC — PHOTO/VIDEO
// =============================================
function openQRForm() {
  const el = document.getElementById('qrPhotoOverlay');
  el.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeQRPhoto() {
  document.getElementById('qrPhotoOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

function submitQRPhotoOrder() {
  const msg = document.getElementById('qrp-msg')?.value.trim();
  if (!msg) return showToast('Please write a personal message ❗');
  addToCart({ id: 'qr-' + Date.now(), name: 'Photo/Video QR Code', type: 'QR Magic', emoji: '📸', price: 80, details: { message: msg, music: document.getElementById('qrp-music')?.value || '' } });
  closeQRPhoto();
  showToast('QR Magic added to cart! 📸');
  const music = document.getElementById('qrp-music')?.value || 'Not specified';
  const waMsg = encodeURIComponent(`📸 New QR Order — Dil Drop!\n\nType: Photo/Video QR\nMessage: "${msg}"\nMusic: ${music}\n\nCustomer will provide photos on WhatsApp.`);
  setTimeout(() => window.open(`https://wa.me/${WHATSAPP_NUM}?text=${waMsg}`, '_blank'), 800);
}

// =============================================
// QR MAGIC — MINI WEBSITE (8 STEPS)
// =============================================
let qrwStep = 1;
const QRW_TOTAL = 8;
const QRW_LABELS = ['Basic','Design','Content','Animation','Media','Interaction','Extras','URL'];
let qrwData = {};

function openQRWebsiteForm() {
  qrwStep = 1; qrwData = {};
  const el = document.getElementById('qrWebOverlay');
  el.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  renderQRWStep();
}

function closeQRWeb() {
  document.getElementById('qrWebOverlay').style.display = 'none';
  document.body.style.overflow = '';
}

function qrwNext() {
  saveQRWStep();
  if (qrwStep === QRW_TOTAL) {
    addToCart({ id: 'qrweb-' + Date.now(), name: 'Mini Animated Website QR', type: 'QR Website', emoji: '🌐', price: 80, details: { ...qrwData } });
    closeQRWeb();
    showToast('Mini Website QR added to cart! 🌐');
    return;
  }
  qrwStep++;
  renderQRWStep();
}

function qrwPrev() {
  saveQRWStep();
  if (qrwStep > 1) { qrwStep--; renderQRWStep(); }
}

function saveQRWStep() {
  document.querySelectorAll('#qrwContent input[type=text],#qrwContent input[type=date],#qrwContent textarea').forEach(el => {
    if (el.id) qrwData[el.id] = el.value;
  });
}

function renderQRWStep() {
  document.getElementById('qrwStepLabel').textContent = `Step ${qrwStep}/${QRW_TOTAL} — ${QRW_LABELS[qrwStep-1]}`;
  document.getElementById('qrwProgress').style.width = (qrwStep / QRW_TOTAL * 100) + '%';
  document.getElementById('qrwBack').style.display = qrwStep === 1 ? 'none' : '';
  document.getElementById('qrwNext').textContent = qrwStep === QRW_TOTAL ? 'Add to Cart 🛒 — ₹80' : 'Next ›';

  const chip = (label, id, options, multi = false) => `
    <div class="form-group">
      <label style="font-size:15px;font-weight:600;color:var(--text);margin-bottom:10px;display:block">${label}</label>
      <div class="chip-group" id="${id}">
        ${options.map(o => `<div class="chip" style="padding:8px 16px;font-size:13px" onclick="${multi ? 'toggleChipMulti' : 'qrwChip'}(this,'${id}','${o}')">${o}</div>`).join('')}
      </div>
    </div>`;

  const field = (label, id, type = 'text', placeholder = '', rows = 0) => rows
    ? `<div class="form-group"><label style="font-size:15px;font-weight:600;color:var(--text)">${label}</label><textarea class="form-input" id="${id}" rows="${rows}" placeholder="${placeholder}" style="margin-top:8px">${qrwData[id]||''}</textarea></div>`
    : `<div class="form-group"><label style="font-size:15px;font-weight:600;color:var(--text)">${label}</label><input class="form-input" id="${id}" type="${type}" placeholder="${placeholder}" value="${qrwData[id]||''}" style="margin-top:8px"/></div>`;

  const steps = [
    `${field('Occasion','qrw-occasion','text','e.g. Birthday, Anniversary')}
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
       ${field('Receiver name','qrw-receiver','text','For whom?')}
       ${field('Your name','qrw-sender','text','From?')}
     </div>
     ${field('Special date','qrw-date','date','')}`,

    `${chip('Theme','qrw-theme',['Cute','Romantic','Aesthetic','Cartoon','Minimal'],true)}
     ${chip('Colors','qrw-colors',['Pink','Pastel','Dark','Red','Yellow','Purple','White'],true)}
     ${chip('Characters','qrw-chars',['Hearts 💕','Flowers 🌸','Anime','Stars ⭐','Doodles'],true)}
     ${chip('Mood','qrw-mood',['Funny 😄','Emotional 💕','Surprise 🎉','Romantic 💝'],true)}`,

    `${field('Main message','qrw-msg','text','','4')}
     ${field('Special quote (optional)','qrw-quote','text','A favourite quote...')}
     ${chip('Special sections','qrw-sections',["Reasons I love you","Our memories","Why you're special"],true)}`,

    `${chip('Opening animation','qrw-anim',['Fade','Confetti burst','Heart explosion','Typing reveal','Slide-up'],true)}
     ${chip('Animation effects','qrw-effects',['Confetti 🎊','Hearts 💕','Typing ⌨️','Fade ✨','Sparkles ✨'],true)}
     ${field('Background music','qrw-music','text','Song name or artist...')}
     ${field('Sound effects (optional)','qrw-sfx','text','e.g. chime, pop')}`,

    `<div class="form-group"><label style="font-size:15px;font-weight:600;color:var(--text)">Upload photos 📸</label>
       <input class="form-input" type="file" accept="image/*" multiple style="padding:10px;margin-top:8px"/>
     </div>
     <div class="form-group"><label style="font-size:15px;font-weight:600;color:var(--text)">Upload videos 🎥 (optional)</label>
       <input class="form-input" type="file" accept="video/*" style="padding:10px;margin-top:8px"/>
     </div>
     <div class="form-group"><label style="font-size:15px;font-weight:600;color:var(--text)">Voice note 🎤 (optional)</label>
       <input class="form-input" type="file" accept="audio/*" style="padding:10px;margin-top:8px"/>
     </div>`,

    `${field('Button text','qrw-btn','text','e.g. Open My Surprise 💝')}
     ${chip('What happens on click?','qrw-click',['Show message','Photo slides','Popup','Final screen'],true)}`,

    `<div style="font-size:13px;color:var(--text-soft);margin-bottom:16px">Optional add-ons for your mini site ✨</div>
     ${['Countdown Timer ⏱️|Till the special day','Fireworks Ending 🎆|Grand finale animation','Download/Share Button 📤|Easy sharing for recipient'].map(e => {
       const [title, desc] = e.split('|');
       return `<div class="addon-tile" style="margin-bottom:10px" onclick="this.classList.toggle('selected');this.querySelector('input').checked=!this.querySelector('input').checked">
         <input type="checkbox"/>
         <div style="flex:1"><div style="font-size:14px;font-weight:600">${title}</div><div style="font-size:12px;color:var(--text-soft)">${desc}</div></div>
       </div>`;
     }).join('')}`,

    `${field('Preferred link name','qrw-url','text','e.g. for-my-love, birthday-priya')}
     <div style="background:var(--blush-light);border-radius:12px;padding:12px;font-size:12px;color:var(--text-soft);margin-bottom:20px;line-height:1.8">
       Your link: <strong>dildrop.in/qr/your-name</strong><br/>We'll send it on WhatsApp within 2–3 hours 💬
     </div>
     <div style="background:#fff;border-radius:16px;padding:16px;box-shadow:0 2px 12px rgba(233,30,99,0.1);border:1.5px solid #fce4ec">
       <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;margin-bottom:12px">Order Summary 🌐</div>
       <div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-soft);margin-bottom:6px"><span>Mini Animated Website QR</span><span>₹80</span></div>
       <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:700;color:var(--rose);border-top:1.5px solid #fce4ec;padding-top:10px;margin-top:6px"><span>Total</span><span>₹80</span></div>
     </div>`,
  ];

  document.getElementById('qrwContent').innerHTML = steps[qrwStep - 1];
}

function qrwChip(el, groupId, val) {
  document.querySelectorAll(`#${groupId} .chip`).forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  qrwData[groupId] = val;
}

// =============================================
// GIFTS
// =============================================
function renderGifts(cat) {
  const grid = document.getElementById('giftsGrid');
  const filtered = cat === 'All' ? GIFTS_DATA : GIFTS_DATA.filter(g => g.category === cat);
  grid.innerHTML = filtered.map(gift => `
    <div class="gift-card">
      <div class="gift-img" style="background:${gift.gradient}"><span>${gift.emoji}</span></div>
      <div class="gift-info">
        <div class="gift-name">${gift.name}</div>
        <div class="gift-price">₹${gift.price}</div>
        <div class="gift-actions">
          <button class="btn-sm btn-sm-rose" style="flex:1" onclick="addToCart({id:'${gift.id}',name:'${gift.name}',type:'Gift',emoji:'${gift.emoji}',price:${gift.price}})">Add to Cart 🛒</button>
          <button class="btn-sm btn-sm-outline" onclick="toggleWishlist('${gift.id}','gift','${gift.name}','${gift.emoji}',${gift.price},event)" id="heart-${gift.id}">${isWishlisted(gift.id)?'❤️':'🤍'}</button>
        </div>
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.textContent.includes(cat) || (cat === 'All' && c.textContent === 'All'));
  });
}

function filterGifts(cat) { renderGifts(cat); }

// =============================================
// WISHLIST
// =============================================
function isWishlisted(id) { return wishlist.some(w => w.id === id); }

function toggleWishlist(id, type, name, emoji, price, event) {
  if (event) event.stopPropagation();
  const idx = wishlist.findIndex(w => w.id === id);
  if (idx > -1) { wishlist.splice(idx, 1); showToast('Removed from wishlist 🤍'); }
  else           { wishlist.push({ id, type, name, emoji, price }); showToast('Added to wishlist ❤️'); }
  localStorage.setItem('dd_wishlist', JSON.stringify(wishlist));
  updateBadges();
  const heart = document.getElementById('heart-' + id);
  if (heart) heart.textContent = isWishlisted(id) ? '❤️' : '🤍';
}

function renderWishlist() {
  const page    = document.getElementById('wishlistPage');
  const profile = document.getElementById('wishlistProfileItems');
  if (!wishlist.length) {
    const empty = '<div class="profile-empty" style="padding:40px">❤️ Your wishlist is empty.<br/>Heart items to save them here!</div>';
    if (page) page.innerHTML = empty;
    if (profile) profile.innerHTML = empty;
    return;
  }
  const html = `<div class="cards-grid">${wishlist.map(w => `
    <div class="card-tile">
      <div class="card-img" style="background:linear-gradient(135deg,#fce4ec,#f8bbd9)">
        <span style="font-size:52px">${w.emoji}</span>
      </div>
      <div class="card-info">
        <div class="card-name">${w.name}</div>
        <div class="card-price">₹${w.price}</div>
      </div>
      <div class="card-actions">
        <button class="btn-sm btn-sm-rose" onclick="addToCart({id:'${w.id}',name:'${w.name}',type:'${w.type}',emoji:'${w.emoji}',price:${w.price}})">Add to Cart</button>
        <button class="btn-sm btn-sm-outline" onclick="toggleWishlist('${w.id}','','','','',event);renderWishlist()">Remove</button>
      </div>
    </div>
  `).join('')}</div>`;
  if (page) page.innerHTML = html;
  if (profile) profile.innerHTML = html;
}

// =============================================
// CART
// =============================================
function addToCart(item) {
  const existing = cart.find(c => c.id === item.id && !item.customized);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else cart.push({ ...item, qty: 1 });
  localStorage.setItem('dd_cart', JSON.stringify(cart));
  updateBadges();
  showToast(`Added to Cart 🛒 — ₹${item.price}`);
}

function renderCart() {
  const content = document.getElementById('cartContent');
  if (!cart.length) {
    content.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some love to your cart!</p>
        <button class="btn-rose" style="margin-top:16px" onclick="showPage('cards')">Browse Cards 💌</button>
      </div>`;
    return;
  }
  const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty||1)), 0);
  const delivery = subtotal > 0 ? 20 : 0;
  content.innerHTML = `
    ${cart.map((item, idx) => `
      <div class="cart-item">
        <div class="cart-item-icon">${item.emoji}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-type">${item.type}</div>
          ${item.details?.message ? `<div style="font-size:11px;color:var(--text-soft);margin:2px 0;font-style:italic">💬 "${item.details.message}"</div>` : ''}
          ${item.details?.receiverName ? `<div style="font-size:11px;color:var(--text-soft);">For: ${item.details.receiverName}</div>` : ''}
          <div class="cart-item-price">₹${item.price * (item.qty||1)}</div>
          <div class="qty-control">
            <button class="qty-btn" onclick="changeQty(${idx},-1)">−</button>
            <span class="qty-num">${item.qty||1}</span>
            <button class="qty-btn" onclick="changeQty(${idx},1)">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${idx})">✕</button>
      </div>
    `).join('')}
    <div class="gift-wrap-option" onclick="toggleGiftWrap(this)">
      <input type="checkbox" id="giftWrapCb"/>
      <div>
        <div style="font-size:14px;font-weight:600">🎁 Add Gift Wrapping Box</div>
        <div style="font-size:12px;color:var(--text-soft)">Beautiful gift wrapped box +₹40</div>
      </div>
    </div>
    <div class="order-summary-box">
      <h3>Order Summary</h3>
      <div class="summary-row"><span>Subtotal</span><span>₹${subtotal}</span></div>
      <div class="summary-row" id="giftWrapRow" style="display:none"><span>Gift Wrapping 🎁</span><span>₹40</span></div>
      <div class="summary-row"><span>Delivery</span><span style="color:var(--rose)">₹${delivery}</span></div>
      <div class="summary-row total"><span>Total</span><span id="cartTotal">₹${subtotal + delivery}</span></div>
    </div>
    <button class="btn-rose btn-full" style="margin-top:16px" onclick="proceedToCheckout()">Proceed to Checkout 💝</button>
    <div style="text-align:center;margin-top:12px"><a onclick="showPage('cards')" style="font-size:13px;color:var(--text-soft);cursor:pointer">← Continue Shopping</a></div>
  `;
}

function changeQty(idx, delta) {
  cart[idx].qty = Math.max(1, (cart[idx].qty||1) + delta);
  localStorage.setItem('dd_cart', JSON.stringify(cart));
  updateBadges();
  renderCart();
}

function removeFromCart(idx) {
  cart.splice(idx, 1);
  localStorage.setItem('dd_cart', JSON.stringify(cart));
  updateBadges();
  renderCart();
  showToast('Removed from cart ✕');
}

function toggleGiftWrap(el) {
  const cb = document.getElementById('giftWrapCb');
  cb.checked = !cb.checked;
  giftWrapSelected = cb.checked;
  document.getElementById('giftWrapRow').style.display = cb.checked ? 'flex' : 'none';
  const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty||1)), 0);
  const wrap = giftWrapSelected ? 40 : 0;
  document.getElementById('cartTotal').textContent = '₹' + (subtotal + 20 + wrap);
}

function proceedToCheckout() {
  if (!currentUser) { showToast('Please login to proceed 💝'); showPage('login'); return; }
  showPage('address');
}

// =============================================
// ADDRESS → PAYMENT
// =============================================
function goToPayment() {
  const fields = ['addr-name','addr-phone','addr-email','addr-address','addr-city','addr-state','addr-pin'];
  const vals = fields.map(id => document.getElementById(id)?.value.trim());
  if (vals.some(v => !v)) return showToast('Please fill all required fields ❗');
  if (vals[1].length !== 10) return showToast('Enter valid 10-digit phone ❗');
  deliveryAddress = { name: vals[0], phone: vals[1], email: vals[2], address: vals[3], city: vals[4], state: vals[5], pin: vals[6] };
  showPage('payment');
}

function renderPaymentPage() {
  const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty||1)), 0);
  const total = subtotal + 20 + (giftWrapSelected ? 40 : 0);
  const qrAmountEl  = document.getElementById('qrAmount');
  const upiAmountEl = document.getElementById('upiAmount');
  const codAmountEl = document.getElementById('codAmount');
  if (qrAmountEl)  qrAmountEl.textContent  = '₹' + total;
  if (upiAmountEl) upiAmountEl.textContent = total;
  if (codAmountEl) codAmountEl.textContent = '₹' + total;
  const summaryEl = document.getElementById('paymentOrderSummary');
  if (summaryEl) {
    summaryEl.innerHTML = cart.map(i => `
      <div class="summary-row"><span>${i.emoji} ${i.name} ×${i.qty||1}</span><span>₹${i.price*(i.qty||1)}</span></div>
    `).join('') + `<div class="summary-row"><span>Delivery</span><span>₹20</span></div><div class="summary-row total"><span>Total</span><span>₹${total}</span></div>`;
  }
  if (deliveryAddress.name) {
    const infoEl = document.getElementById('paymentCustomerInfo');
    if (infoEl) infoEl.innerHTML = `👤 ${deliveryAddress.name} • 📞 ${deliveryAddress.phone}<br/>📍 ${deliveryAddress.address}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pin}`;
  }
}

function selectPayMethod(method) {
  selectedPayMethod = method;
  document.getElementById('pm-upi').classList.toggle('selected', method === 'upi');
  document.getElementById('pm-cod').classList.toggle('selected', method === 'cod');
  document.getElementById('upiSection').style.display = method === 'upi' ? '' : 'none';
  document.getElementById('codSection').style.display = method === 'cod' ? '' : 'none';
}

function switchUPIMode(mode) {
  document.getElementById('qrSection').style.display    = mode === 'qr' ? '' : 'none';
  document.getElementById('upiIdSection').style.display = mode === 'id' ? '' : 'none';
}

function processPayment(method) {
  if (method === 'upi') document.getElementById('payConfirmModal').classList.add('open');
  else placeOrder('COD');
}

function confirmPayment() {
  closeModal('payConfirmModal');
  placeOrder('UPI');
}

function placeOrder(paymentMethod) {
  const orderId  = 'DD-' + Date.now().toString().slice(-6);
  const subtotal = cart.reduce((s, i) => s + (i.price * (i.qty||1)), 0);
  const total    = subtotal + 20 + (giftWrapSelected ? 40 : 0);
  const hasQR    = cart.some(i => i.type === 'QR Magic' || i.type === 'QR Website');
  const order = {
    id: orderId,
    date: new Date().toLocaleDateString('en-IN'),
    customer: currentUser,
    address: deliveryAddress,
    items: [...cart],
    total, payment: paymentMethod,
    status: paymentMethod === 'COD' ? 'Confirmed' : 'Processing',
    hasQR, timestamp: Date.now()
  };
  orders.unshift(order);
  localStorage.setItem('dd_orders', JSON.stringify(orders));
  document.getElementById('successOrderId').textContent = 'Order #' + orderId;
  document.getElementById('successQRSection').style.display = hasQR ? '' : 'none';
  sendAdminWhatsApp(order);
  sendCustomerWhatsApp(order);
  sendOrderConfirmationEmail(order);
  cart = [];
  localStorage.setItem('dd_cart', JSON.stringify(cart));
  updateBadges();
  showPage('success');
}

function sendAdminWhatsApp(order) {
  const items = order.items.map(i => {
    let line = `\n* ${i.name} (₹${i.price*(i.qty||1)})`;
    if (i.details?.message) line += `\n  Card message: "${i.details.message}"`;
    return line;
  }).join('');
  const customDetails  = order.items.find(i => i.details)?.details || {};
  const occasion       = customDetails.occasion || order.items?.[0]?.category || 'N/A';
  const lang           = customDetails.lang || 'N/A';
  const giftChoice     = customDetails.other || "We'll choose the best for your occasion";
  const deliveryDate   = customDetails.deliveryDate || order.date;
  const addr           = order.address;
  const fullAddress    = addr ? `${addr.address}, ${addr.city} ${addr.state} - ${addr.pin}` : '-';
  const msg = encodeURIComponent(
`🌸 New Dil Drop Order!
From: ${order.customer?.name || addr?.name || '-'}
For: ${customDetails.receiverName || addr?.name || '-'}
Occasion: ${occasion}
Language: ${lang}
Gift choice: ${giftChoice}
Delivery date: ${deliveryDate}
Address: ${fullAddress}
Cart items:${items}

Total: ₹${order.total} | Payment: ${order.payment}
Phone: ${addr?.phone || order.customer?.phone}
Email: ${addr?.email || order.customer?.email}`);
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${msg}`, '_blank');
}

function sendCustomerWhatsApp(order) {
  const customerPhone = deliveryAddress.phone || order.customer?.phone;
  if (!customerPhone) return;
  const name  = order.customer?.name || deliveryAddress.name || 'there';
  const items = order.items.map(i => `• ${i.name}`).join('\n');
  const isPaid = order.payment === 'UPI';
  const isCOD  = order.payment === 'COD';
  let msg;
  if (isPaid) {
    msg = `✅ Order Confirmed — Dil Drop 💝\n\nHi ${name}!\n\nWe've received your payment and your order is confirmed.\n\nOrder ID: ${order.id}\nAmount Paid: ₹${order.total}\n\nItems:\n${items}\n\nWe'll prepare and dispatch your order soon. 🚚\n\nThank you for choosing Dil Drop! 🌸\n— Dil Drop Team`;
  } else if (isCOD) {
    msg = `🛍️ Order Placed — Dil Drop 💝\n\nHi ${name}!\n\nYour order has been placed with Cash on Delivery.\n\nOrder ID: ${order.id}\nAmount to Pay: ₹${order.total} (on delivery)\n\nItems:\n${items}\n\nPlease keep the exact amount ready. 🚚\n\nThank you for choosing Dil Drop! 🌸\n— Dil Drop Team`;
  }
  setTimeout(() => window.open(`https://wa.me/91${customerPhone}?text=${encodeURIComponent(msg)}`, '_blank'), 1500);
}

function sendOrderConfirmationEmail(order) {
  if (!emailjsReady) return;
  const customerEmail = deliveryAddress.email || order.customer?.email;
  if (!customerEmail) return;
  const items = order.items.map(i => `${i.emoji} ${i.name} (₹${i.price*(i.qty||1)})`).join('\n');
  emailjs.send(EMAILJS_SERVICE_ID, 'order_confirmation', {
    to_name: order.customer?.name || deliveryAddress.name,
    to_email: customerEmail,
    order_id: order.id,
    order_date: order.date,
    order_items: items,
    order_total: '₹' + order.total,
    payment_method: order.payment,
    delivery_address: `${deliveryAddress.address}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pin}`,
    from_name: 'Dil Drop 💝'
  }).catch(() => {});
}

// =============================================
// PROFILE & ADMIN
// =============================================
function renderProfileOrAdmin(name) {
  if (name === 'profile' && currentUser) {
    document.getElementById('profileName').textContent  = currentUser.name;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profilePhone').textContent = '📞 ' + currentUser.phone;
    renderOrdersProfile();
    renderWishlist();
  }
  if (name === 'admin' && currentUser?.role === 'admin') renderAdminDashboard();
}

function renderOrdersProfile() {
  const userOrders = orders.filter(o => o.customer?.email === currentUser?.email);
  const el = document.getElementById('ordersListProfile');
  if (!userOrders.length) {
    el.innerHTML = '<div class="profile-empty">📦 No orders yet.<br/>Place your first order!</div>';
    return;
  }
  el.innerHTML = userOrders.map(o => `
    <div style="background:#fff;border-radius:14px;padding:14px;box-shadow:var(--shadow);margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-weight:600;font-size:14px">${o.id}</span>
        <span class="status-badge status-${o.status.toLowerCase()}">${o.status}</span>
      </div>
      <div style="font-size:12px;color:var(--text-soft)">${o.date} • ${o.items?.length} item(s) • ₹${o.total} • ${o.payment}</div>
    </div>
  `).join('');
}

function switchProfileTab(tab, el) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('ps-' + tab)?.classList.add('active');
  if (tab === 'wishlist-tab') renderWishlist();
}

function renderAdminDashboard() {
  const pending   = orders.filter(o => ['Pending','Processing'].includes(o.status)).length;
  const revenue   = orders.reduce((s, o) => s + o.total, 0);
  const qrOrders  = orders.filter(o => o.hasQR).length;
  const today     = new Date().toLocaleDateString('en-IN');
  const todayRev  = orders.filter(o => o.date === today).reduce((s,o) => s + o.total, 0);

  document.getElementById('statTotal').textContent   = orders.length;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statRevenue').textContent = '₹' + revenue.toLocaleString('en-IN');
  document.getElementById('statQR').textContent      = qrOrders;
  const todayEl = document.getElementById('statToday');
  if (todayEl) todayEl.textContent = '₹' + todayRev.toLocaleString('en-IN');

  // ── All Orders Table ──
  const STATUS_COLORS = {
    Pending:'status-pending', Confirmed:'status-confirmed', Processing:'status-processing',
    Dispatched:'status-processing', Delivered:'status-delivered', Cancelled:'status-pending'
  };
  const adminSearch = document.getElementById('adminSearchInput')?.value?.toLowerCase() || '';
  const filteredOrders = adminSearch
    ? orders.filter(o => o.id.toLowerCase().includes(adminSearch) || (o.customer?.name||'').toLowerCase().includes(adminSearch) || (o.address?.phone||'').includes(adminSearch))
    : orders;

  document.getElementById('adminOrderBody').innerHTML = filteredOrders.map(o => `
    <tr onclick="adminExpandOrder('${o.id}')" style="cursor:pointer">
      <td><strong style="color:var(--rose)">${o.id}</strong></td>
      <td>${o.customer?.name || o.address?.name || '-'}</td>
      <td>${o.address?.phone || o.customer?.phone || '-'}</td>
      <td style="font-size:11px">${(o.items||[]).map(i=>i.type).filter((v,i,a)=>a.indexOf(v)===i).join(', ')||'-'}</td>
      <td><strong>₹${o.total}</strong></td>
      <td><span style="font-size:11px;background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:10px">${o.payment}</span></td>
      <td><span class="status-badge ${STATUS_COLORS[o.status]||'status-pending'}">${o.status||'Pending'}</span></td>
      <td onclick="event.stopPropagation()">
        <div style="display:flex;gap:4px;align-items:center">
          <select onchange="updateOrderStatus('${o.id}',this.value)" style="font-size:11px;padding:4px 6px;border-radius:8px;border:1.5px solid #fce4ec;background:#fff;color:var(--text)">
            ${['Pending','Confirmed','Processing','Dispatched','Delivered','Cancelled'].map(s=>`<option${o.status===s?' selected':''}>${s}</option>`).join('')}
          </select>
          <a href="https://wa.me/91${o.address?.phone||o.customer?.phone||''}" target="_blank" title="WhatsApp" style="font-size:16px;text-decoration:none">💬</a>
        </div>
      </td>
    </tr>
    <tr id="expand-${o.id}" style="display:none">
      <td colspan="8">
        <div style="background:#fff9fc;border-radius:12px;padding:16px;margin:4px 0;border:1px solid #fce4ec">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div>
              <div style="font-size:12px;font-weight:700;color:var(--rose);margin-bottom:6px">📍 Delivery Address</div>
              <div style="font-size:12px;color:#555;line-height:1.8">
                ${o.address?.name||o.customer?.name||'-'}<br/>
                ${o.address?.address||'-'}, ${o.address?.city||''}, ${o.address?.state||''} - ${o.address?.pin||''}<br/>
                📞 ${o.address?.phone||o.customer?.phone||'-'}
              </div>
            </div>
            <div>
              <div style="font-size:12px;font-weight:700;color:#1565c0;margin-bottom:6px">🛍️ Items Ordered</div>
              ${(o.items||[]).map(i=>`<div style="font-size:12px;color:#333;padding:2px 0">${i.emoji||'📦'} ${i.name} ×${i.qty||1} — ₹${i.price*(i.qty||1)}</div>`).join('')}
              ${o.items?.find(i=>i.details?.message) ? `<div style="font-size:11px;color:var(--text-soft);margin-top:6px;font-style:italic">💬 "${o.items.find(i=>i.details?.message).details.message}"</div>` : ''}
            </div>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
            <a href="https://wa.me/91${o.address?.phone||o.customer?.phone||''}" target="_blank" class="btn-sm btn-sm-rose">💬 WhatsApp Customer</a>
            <button class="btn-sm btn-sm-outline" onclick="updateOrderStatus('${o.id}','Delivered');adminExpandOrder('${o.id}')">✅ Mark Delivered</button>
            <button class="btn-sm btn-sm-outline" onclick="printOrderSlip('${o.id}')" style="color:#555;border-color:#ddd">🖨️ Print Slip</button>
          </div>
        </div>
      </td>
    </tr>
  `).join('');

  // ── QR Orders ──
  const qrList = orders.filter(o => o.hasQR);
  document.getElementById('adminQROrders').innerHTML = qrList.length ? qrList.map(o => {
    const d = o.items?.find(i=>i.details)?.details||{};
    const itemsHtml = (o.items||[]).map(i=>`<li style="font-size:12px;padding:3px 0;border-bottom:1px solid #eef">${i.emoji} ${i.name} ×${i.qty||1} — ₹${i.price*(i.qty||1)}</li>`).join('');
    return `
      <div style="background:#fff;border-radius:16px;padding:16px;box-shadow:var(--shadow);margin-bottom:12px;border:1px solid #fce4ec">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
          <div><div style="font-weight:700;font-size:15px;color:var(--text)">${o.id}</div><div style="font-size:11px;color:#999">${o.date}</div></div>
          <span class="status-badge ${STATUS_COLORS[o.status]||'status-pending'}">${o.status||'Pending'}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
          <div style="background:#fff9fc;border-radius:10px;padding:10px;border:1px solid #fce4ec">
            <div style="font-size:11px;font-weight:700;color:var(--rose);margin-bottom:6px">👤 Customer</div>
            <div style="font-size:12px;line-height:1.7">
              <strong>${o.customer?.name||o.address?.name||'-'}</strong><br/>
              📞 ${o.address?.phone||o.customer?.phone||'-'}<br/>
              📧 ${o.customer?.email||o.address?.email||'-'}
            </div>
          </div>
          <div style="background:#f0f7ff;border-radius:10px;padding:10px;border:1px solid #d0e8ff">
            <div style="font-size:11px;font-weight:700;color:#1565c0;margin-bottom:6px">📦 QR Details</div>
            ${d.message ? `<div style="font-size:12px;color:#555;font-style:italic">"${d.message}"</div>` : ''}
            ${d.music ? `<div style="font-size:12px;color:#555">🎵 ${d.music}</div>` : ''}
          </div>
        </div>
        <ul style="list-style:none;padding:0;margin:0 0 10px">${itemsHtml}</ul>
        <div style="font-size:13px;font-weight:700;color:var(--rose);margin-bottom:10px">Total: ₹${o.total} • ${o.payment}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a href="https://wa.me/91${o.address?.phone||o.customer?.phone||''}" target="_blank" class="btn-sm btn-sm-rose">💬 WhatsApp</a>
          <button class="btn-sm btn-sm-outline" onclick="updateOrderStatus('${o.id}','Delivered')">✅ Mark Delivered</button>
        </div>
      </div>`;
  }).join('') : '<div class="profile-empty">📱 No QR orders yet</div>';

  // ── Products Management ──
  renderAdminProducts();

  // ── Customers ──
  const customerMap = {};
  orders.forEach(o => {
    const key = o.customer?.email || o.address?.email || o.address?.phone;
    if (!key) return;
    if (!customerMap[key]) customerMap[key] = { name: o.customer?.name||o.address?.name||'-', email: o.customer?.email||o.address?.email||'-', phone: o.customer?.phone||o.address?.phone||'-', orders: 0, spend: 0 };
    customerMap[key].orders++;
    customerMap[key].spend += o.total;
  });
  const allCustomers = Object.values(customerMap);
  document.getElementById('adminCustomerBody').innerHTML = allCustomers.length ? allCustomers.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td style="font-size:12px">${c.email}</td>
      <td>${c.phone}</td>
      <td><span style="background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:10px;font-size:12px">${c.orders} order${c.orders!==1?'s':''}</span></td>
      <td><strong style="color:var(--rose)">₹${c.spend.toLocaleString('en-IN')}</strong></td>
      <td>
        <a href="https://wa.me/91${c.phone}" target="_blank" class="btn-sm btn-sm-rose" style="font-size:11px;text-decoration:none">💬 Chat</a>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-soft)">No customers yet</td></tr>';
}

function adminExpandOrder(orderId) {
  const row = document.getElementById('expand-' + orderId);
  if (!row) return;
  row.style.display = row.style.display === 'none' ? '' : 'none';
}

function printOrderSlip(orderId) {
  const o = orders.find(x => x.id === orderId);
  if (!o) return;
  const win = window.open('', '_blank');
  const items = (o.items||[]).map(i => `<div>${i.emoji} ${i.name} ×${i.qty||1} — ₹${i.price*(i.qty||1)}</div>`).join('');
  win.document.write(`
    <html><head><title>Order Slip — ${o.id}</title>
    <style>body{font-family:Arial,sans-serif;padding:20px;max-width:400px;margin:auto}h2{color:#e91e63}hr{border:1px solid #fce4ec}.total{font-size:18px;font-weight:700;color:#e91e63}</style>
    </head><body>
    <h2>💝 Dil Drop — Order Slip</h2>
    <p><strong>Order ID:</strong> ${o.id}</p>
    <p><strong>Date:</strong> ${o.date}</p>
    <hr/>
    <p><strong>Customer:</strong> ${o.customer?.name||o.address?.name}</p>
    <p><strong>Phone:</strong> ${o.address?.phone||o.customer?.phone}</p>
    <p><strong>Address:</strong> ${o.address?.address||''}, ${o.address?.city||''}, ${o.address?.state||''} - ${o.address?.pin||''}</p>
    <hr/>
    <strong>Items:</strong>${items}
    <hr/>
    <p><strong>Payment:</strong> ${o.payment}</p>
    <p class="total">Total: ₹${o.total}</p>
    <script>window.print();window.close();<\/script>
    </body></html>`);
  win.document.close();
}

// ── Admin Products (in-memory) ──
// Merge saved admin products with CARDS_DATA defaults, preserving images
function loadAdminProducts() {
  const saved = JSON.parse(localStorage.getItem('dd_admin_products') || 'null');
  if (saved) return saved;
  return CARDS_DATA.map(c => ({...c, active: true, stock: 100, imageUrl: ''}));
}
let adminProducts = loadAdminProducts();
let editingProduct = null;

function renderAdminProducts() {
  const grid = document.getElementById('adminProductsGrid');
  if (!grid) return;
  const search = document.getElementById('productSearchInput')?.value?.toLowerCase() || '';
  const filtered = search ? adminProducts.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search)) : adminProducts;
  grid.innerHTML = filtered.map(p => {
    const imgContent = p.imageUrl
      ? `<img src="${p.imageUrl}" style="width:100%;height:100%;object-fit:cover;" alt="${p.name}"/>`
      : `<span style="font-size:42px">${p.emoji}</span>`;
    return `
    <div style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:var(--shadow);border:1px solid #fce4ec;${!p.active?'opacity:0.6':''}">
      <div style="height:90px;background:${p.gradient};display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
        ${imgContent}
        <span style="position:absolute;top:6px;left:6px;background:${p.active?'#4caf50':'#9e9e9e'};color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px">${p.active?'LIVE':'HIDDEN'}</span>
        ${p.imageUrl ? `<span style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.5);color:#fff;font-size:9px;padding:2px 6px;border-radius:6px">📸 IMG</span>` : ''}
      </div>
      <div style="padding:10px">
        <div style="font-weight:600;font-size:13px;margin-bottom:2px">${p.name}</div>
        <div style="font-size:11px;color:var(--text-soft);margin-bottom:6px">${p.category}</div>
        <div style="font-size:15px;font-weight:700;color:var(--rose);margin-bottom:8px">₹${p.price}</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap">
          <button class="btn-sm btn-sm-rose" onclick="openAdminEditProduct('${p.id}')" style="font-size:11px">✏️ Edit</button>
          <button class="btn-sm btn-sm-outline" onclick="openImageUpload('${p.id}')" style="font-size:11px">📸</button>
          <button class="btn-sm btn-sm-outline" onclick="toggleAdminProduct('${p.id}')" style="font-size:11px">${p.active?'🙈':'👁️'}</button>
          <button class="btn-sm btn-sm-outline" onclick="deleteAdminProduct('${p.id}')" style="font-size:11px;color:#e91e63;border-color:#e91e63">🗑️</button>
        </div>
      </div>
    </div>`}).join('');
  if (!filtered.length) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:24px;color:var(--text-soft)">No products found.</div>';
}

function openImageUpload(productId) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function() {
    const file = this.files[0];
    if (!file) return;
    // Check size — warn if > 500KB but still allow
    if (file.size > 1024 * 1024) {
      showToast('Image is large — compressing... ⏳');
    }
    const reader = new FileReader();
    reader.onload = e => {
      // Compress image using canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.82);
        const p = adminProducts.find(x => x.id === productId);
        if (p) {
          p.imageUrl = compressed;
          localStorage.setItem('dd_admin_products', JSON.stringify(adminProducts));
          renderAdminProducts();
          showToast('Image uploaded! 📸 Card now shows real photo ✅');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function removeProductImage(productId) {
  const p = adminProducts.find(x => x.id === productId);
  if (!p) return;
  delete p.imageUrl;
  localStorage.setItem('dd_admin_products', JSON.stringify(adminProducts));
  renderAdminProducts();
  showToast('Image removed 🗑️');
}

function toggleAdminProduct(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  p.active = !p.active;
  localStorage.setItem('dd_admin_products', JSON.stringify(adminProducts));
  renderAdminProducts();
  showToast(p.active ? 'Product is now LIVE ✅' : 'Product hidden 🙈');
}

function deleteAdminProduct(id) {
  if (!confirm('Delete this product?')) return;
  adminProducts = adminProducts.filter(x => x.id !== id);
  localStorage.setItem('dd_admin_products', JSON.stringify(adminProducts));
  renderAdminProducts();
  showToast('Product deleted 🗑️');
}

function openAdminEditProduct(id) {
  editingProduct = id ? adminProducts.find(x => x.id === id) : null;
  const isNew = !id;
  const p = editingProduct || { id: 'p' + Date.now(), name: '', category: 'Birthday', emoji: '💌', gradient: 'linear-gradient(135deg,#fce4ec,#f8bbd9)', price: 80, desc: '', active: true, imageUrl: '' };
  document.getElementById('prodEditModal').classList.add('open');
  document.getElementById('prodEditTitle').textContent = isNew ? '➕ Add New Product' : '✏️ Edit Product';
  document.getElementById('prod-name').value     = p.name;
  document.getElementById('prod-emoji').value    = p.emoji;
  document.getElementById('prod-price').value    = p.price;
  document.getElementById('prod-desc').value     = p.desc || '';
  document.getElementById('prod-cat').value      = p.category;
  document.getElementById('prod-grad').value     = p.gradient;
  updateProdPreview();
  // Show image preview inside modal if exists
  const imgPreviewBox = document.getElementById('prod-img-preview');
  if (imgPreviewBox) {
    if (p.imageUrl) {
      imgPreviewBox.innerHTML = `<div style="position:relative;display:inline-block">
        <img src="${p.imageUrl}" style="width:100%;max-height:120px;object-fit:cover;border-radius:12px;border:2px solid var(--rose-light)"/>
        <button onclick="clearProdImage()" style="position:absolute;top:4px;right:4px;background:rgba(233,30,99,0.9);color:#fff;border:none;border-radius:50%;width:24px;height:24px;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
      </div>
      <div style="font-size:11px;color:var(--text-soft);margin-top:4px">📸 Current image</div>`;
      imgPreviewBox.style.display = 'block';
    } else {
      imgPreviewBox.style.display = 'none';
      imgPreviewBox.innerHTML = '';
    }
  }
}

function clearProdImage() {
  if (editingProduct) editingProduct.imageUrl = '';
  const imgPreviewBox = document.getElementById('prod-img-preview');
  if (imgPreviewBox) { imgPreviewBox.style.display = 'none'; imgPreviewBox.innerHTML = ''; }
  showToast('Image cleared — save to confirm.');
}

function saveAdminProduct() {
  const name  = document.getElementById('prod-name').value.trim();
  const emoji = document.getElementById('prod-emoji').value.trim();
  const price = parseInt(document.getElementById('prod-price').value) || 80;
  const desc  = document.getElementById('prod-desc').value.trim();
  const cat   = document.getElementById('prod-cat').value;
  const grad  = document.getElementById('prod-grad').value.trim();
  if (!name) return showToast('Please enter a product name ❗');

  // Handle new image upload from modal
  const imgInput = document.getElementById('prod-img-input');
  const doSave = (imageUrl) => {
    if (editingProduct) {
      Object.assign(editingProduct, { name, emoji, price, desc, category: cat, gradient: grad });
      if (imageUrl !== undefined) editingProduct.imageUrl = imageUrl;
    } else {
      adminProducts.unshift({ id: 'p' + Date.now(), name, emoji, price, desc, category: cat, gradient: grad, active: true, imageUrl: imageUrl || '' });
    }
    localStorage.setItem('dd_admin_products', JSON.stringify(adminProducts));
    closeModal('prodEditModal');
    renderAdminProducts();
    showToast(editingProduct ? 'Product updated ✅' : 'Product added ✅');
    editingProduct = null;
  };

  if (imgInput && imgInput.files && imgInput.files[0]) {
    const file = imgInput.files[0];
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600; let w = img.width, h = img.height;
        if (w > MAX || h > MAX) { if (w > h) { h = Math.round(h*MAX/w); w = MAX; } else { w = Math.round(w*MAX/h); h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        doSave(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    doSave(undefined);
  }
}

function updateOrderStatus(orderId, status) {
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = status;
  localStorage.setItem('dd_orders', JSON.stringify(orders));
  showToast('Status → ' + status + ' ✅');
  // Re-render the table row badge only
  const allBadges = document.querySelectorAll(`[data-order-id="${orderId}"]`);
  renderAdminDashboard();
  const phone = order.address?.phone || order.customer?.phone;
  if (phone && status === 'Delivered') {
    const msg = encodeURIComponent(`💝 Dil Drop Order Update!

Hello ${order.customer?.name||'there'}!

Your order ${order.id} has been *${status}*! 🎉

Thank you for shopping with Dil Drop! 🌸`);
    setTimeout(() => window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank'), 600);
  }
}

function switchAdminTab(tab, el) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('as-' + tab)?.classList.add('active');
  if (tab === 'products') renderAdminProducts();
}

function adminSearchOrders() { renderAdminDashboard(); }
function adminSearchProducts() { renderAdminProducts(); }

// =============================================
// BADGES & UTILS
// =============================================
function updateBadges() {
  const cartCount  = cart.reduce((s, i) => s + (i.qty||1), 0);
  const likedCount = wishlist.length;
  ['cartBadge','bnavCart'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = cartCount; });
  ['likedBadge','bnavLiked'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = likedCount; });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// =============================================
// INIT
// =============================================
updateNavAuth();
updateBadges();
renderCards('All');
