// ============ CYBER HAT — shared script ============

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    const setMenu = (open) => {
      menu.classList.toggle('open', open);
      toggle.textContent = open ? '✕' : '☰';
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  }

  // Logo image: fall back to the built-in icon + text if logo.png is missing
  document.querySelectorAll('.logo-img').forEach(img => {
    const parent = img.parentElement;
    const fail = () => parent.classList.add('no-logo-img');
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Terminal typing effect (home page hero)
  const termOut = document.querySelector('[data-terminal]');
  if (termOut) {
    const lines = [
      { type: 'cmd', text: 'cyberhat init --client="your-business"' },
      { type: 'out', text: 'Reading workflow... 3 departments found' },
      { type: 'out', text: 'Mapping to modules: ERP · HRM · REPORTS' },
      { type: 'cmd', text: 'cyberhat build --deploy' },
      { type: 'out', text: '✓ Build complete — system live' },
    ];
    let li = 0, ci = 0;
    function typeNext() {
      if (li >= lines.length) return;
      const line = lines[li];
      const div = document.createElement('div');
      div.className = 'line';
      termOut.appendChild(div);
      const prefix = line.type === 'cmd' ? '<span class="prompt">$</span> ' : '<span class="out">';
      const suffix = line.type === 'cmd' ? '' : '</span>';

      function typeChar() {
        if (ci <= line.text.length) {
          div.innerHTML = prefix + line.text.slice(0, ci) + suffix;
          ci++;
          setTimeout(typeChar, line.type === 'cmd' ? 32 : 14);
        } else {
          ci = 0;
          li++;
          setTimeout(typeNext, 380);
        }
      }
      typeChar();
    }
    setTimeout(typeNext, 500);
  }

  // Contact / work-order form fake submit
  document.querySelectorAll('form[data-fake-submit]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.submit-btn');
      const original = btn.textContent;
      btn.textContent = 'Message sent ✓';
      btn.style.background = '#0A3FC4';
      setTimeout(() => {
        form.reset();
        btn.textContent = original;
        btn.style.background = '';
      }, 2400);
    });
  });

  // Portfolio filter (work page)
  const pills = document.querySelectorAll('.filter-pill');
  const workCards = document.querySelectorAll('[data-category]');
  if (pills.length && workCards.length) {
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.dataset.filter;
        workCards.forEach(card => {
          const show = cat === 'all' || card.dataset.category === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }
});


// ============ Victory Day quiz popup ============
// বন্ধ করতে: নিচের enabled: false করুন (অথবা ১৬ ডিসেম্বরের পর endsAt পার হলে নিজে থেকেই বন্ধ হয়ে যাবে)।
(function () {
  const POPUP = {
    enabled: true,
    endsAt: '2026-12-17T00:00:00+06:00',          // ১৬ ডিসেম্বর রাত ১২টা পর্যন্ত (বাংলাদেশ সময়)
    url: 'https://www.quiz.khaborbangla.com',     // ছবিতে ক্লিক করলে এই লিংকে যাবে
    image: 'quiz-popup.jpg',
    delay: 800                                     // পেজ খোলার কত মিলিসেকেন্ড পরে দেখাবে
  };

  const force = /[?&]popup=1\b/.test(location.search);   // টেস্টের জন্য: ?popup=1
  if (!POPUP.enabled && !force) return;
  if (!force && Date.now() >= new Date(POPUP.endsAt).getTime()) return;

  const KEY = 'ch_quiz_popup_seen';
  const store = {
    get() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } },
    set() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }
  };
  if (!force && store.get()) return;     // একই ভিজিটে একবারই দেখাবে

  const css = `
  .qp-overlay{position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center;
    padding:max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom));
    background:rgba(4,7,14,.72); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
    opacity:0; transition:opacity .3s ease;}
  .qp-overlay:focus{outline:none;}
  .qp-overlay.show{opacity:1;}
  .qp-box{--w:min(92vw, 460px, calc(86vh * 0.8208)); position:relative; width:var(--w); aspect-ratio:1498/1825;
    border-radius:calc(var(--w) * 0.037); box-shadow:0 24px 70px rgba(0,0,0,.55);
    transform:translateY(14px) scale(.97); transition:transform .3s ease;}
  .qp-overlay.show .qp-box{transform:none;}
  .qp-link{display:block; width:100%; height:100%; border-radius:inherit; overflow:hidden;}
  .qp-link img{display:block; width:100%; height:100%; object-fit:cover;}
  .qp-close{position:absolute; left:94.1%; top:5.1%; width:10%; aspect-ratio:1; transform:translate(-50%,-50%);
    border:0; border-radius:50%; background:transparent; cursor:pointer; padding:0;}
  .qp-close:focus-visible{outline:3px solid #fff; outline-offset:2px;}
  `;

  function open() {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.className = 'qp-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'বিজয় দিবস বিশেষ কুইজ ২০২৬');
    overlay.innerHTML =
      '<div class="qp-box">' +
        '<a class="qp-link" target="_blank" rel="noopener">' +
          '<img alt="বিজয় দিবস বিশেষ কুইজ ২০২৬ — অংশ নিতে এখানে ক্লিক করুন" width="900" height="1096">' +
        '</a>' +
        '<button type="button" class="qp-close" aria-label="বন্ধ করুন"></button>' +
      '</div>';
    const link = overlay.querySelector('.qp-link');
    link.href = POPUP.url;
    overlay.querySelector('img').src = POPUP.image;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const closeBtn = overlay.querySelector('.qp-close');
    overlay.tabIndex = -1;
    overlay.focus({ preventScroll: true });

    function close() {
      overlay.classList.remove('show');
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { overlay.remove(); style.remove(); }, 300);
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    closeBtn.addEventListener('click', close);                         // X চাপলে এই সাইটেই থাকবে
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });  // বাইরে চাপলেও বন্ধ
    document.addEventListener('keydown', onKey);
    link.addEventListener('click', () => { store.set(); });            // কুইজে গেলেও আবার ফিরে এলে বিরক্ত করবে না
  }

  // ছবি লোড হওয়ার পরেই পপআপ দেখাবে (ফাঁকা বক্স দেখাবে না)
  window.addEventListener('load', () => {
    setTimeout(() => {
      const pre = new Image();
      pre.onload = () => { store.set(); open(); };
      pre.src = POPUP.image;
    }, POPUP.delay);
  });
})();
