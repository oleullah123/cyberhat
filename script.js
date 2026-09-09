// ============ CYBER HAT — shared script ============

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      toggle.textContent = menu.classList.contains('open') ? '✕' : '☰';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.textContent = '☰';
    }));
  }

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
      btn.style.background = '#00A87D';
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
