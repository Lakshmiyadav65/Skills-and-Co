/* Skills and Co. — site behaviour
   Scroll reveal, marquee hydration, sticky nav, mobile menu, version switch. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- data ---------- */
  var CLIENTS = [
    'tcs', 'accenture', 'capgemini', 'wipro', 'infosys', 'cognizant', 'salesforce',
    'boeing', 'dell', 'kpmg', 'bofa', 'anz', 'mercedes', 'ltimindtree', 'exl', 'wns',
    'kpit', 'birlasoft', 'asianpaints', 'teleperformance', 'verint', 'biocon',
    'amararaja', 'fis', 'hitachi', 'iima', 'birlasunlife'
  ];

  var PRESS = [
    ['press-asianage-trimmed', 'The Asian Age'],
    ['press-hindustanbytes-trimmed', 'Hindustan Bytes'],
    ['press-republic-trimmed', 'Republic News India'],
    ['press-entrepreneurhunt-trimmed', 'Entrepreneur Hunt']
  ];

  var QUOTES = [
    {
      text: 'I joined the weekday batch while working full time. Three months later I cleared the interview I had been avoiding for two years. The pausing and pacing technique alone changed how I answer questions.',
      name: 'Ram Kumar', role: 'Capgemini', img: 'person-ram.jpg'
    },
    {
      text: 'As a lawyer I was never short of words. I was short of composure. The confidence modules gave me a way to steady myself before I speak, not just hope the nerves pass.',
      name: 'Vishal', role: 'Lawyer', img: 'person-vishal.jpg'
    },
    {
      text: 'I moved abroad for work and the accent and fluency sessions made the difference in daily standups. I stopped rehearsing sentences in my head before speaking.',
      name: 'Anand', role: 'Bengaluru → Devonport', img: 'person-anand.jpg'
    },
    {
      text: 'The practice assignments are the real value. Live feedback every week meant I could not hide behind theory. I had to actually speak, and that is what fixed it.',
      name: 'Priya S.', role: 'Programme participant', img: 'person-ram.jpg'
    },
    {
      text: 'Voice modulation and body language changed how my team responds in meetings. I say less now and people listen more.',
      name: 'Rohit M.', role: 'Team lead, IT services', img: 'person-vishal.jpg'
    }
  ];

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* A marquee loops seamlessly only when the track holds the set twice. */
  function fillMarquee(node, items, build) {
    if (!node) return;
    var frag = document.createDocumentFragment();
    for (var pass = 0; pass < 2; pass++) {
      items.forEach(function (item) {
        var child = build(item);
        if (pass === 1) child.setAttribute('aria-hidden', 'true');
        frag.appendChild(child);
      });
    }
    node.appendChild(frag);
  }

  function logoChip(name, label) {
    var chip = el('div', 'logo-chip');
    var img = el('img');
    img.src = 'assets/logos/' + name + '.png';
    img.alt = label || name;
    img.loading = 'lazy';
    chip.appendChild(img);
    return chip;
  }

  /* ---------- build marquees ---------- */
  var half = Math.ceil(CLIENTS.length / 2);
  fillMarquee(document.getElementById('logoTrackA'), CLIENTS.slice(0, half), function (n) {
    return logoChip(n, n + ' logo');
  });
  fillMarquee(document.getElementById('logoTrackB'), CLIENTS.slice(half), function (n) {
    return logoChip(n, n + ' logo');
  });
  var pressRow = document.getElementById('pressRow');
  if (pressRow) {
    PRESS.forEach(function (p) { pressRow.appendChild(logoChip(p[0], p[1])); });
  }

  fillMarquee(document.getElementById('quoteTrack'), QUOTES, function (q) {
    return el('article', 'quote',
      '<div class="quote__mark">&rdquo;</div>' +
      '<p>' + esc(q.text) + '</p>' +
      '<div class="quote__who">' +
        '<img src="assets/img/' + esc(q.img) + '" alt="" loading="lazy">' +
        '<div><div class="quote__name">' + esc(q.name) + '</div>' +
        '<div class="quote__role">' + esc(q.role) + '</div></div>' +
      '</div>');
  });

  /* ---------- scroll reveal ----------
     The source template left elements stuck in their pre-animation state,
     which is why its headings double-rendered. Reveal once, then unobserve. */
  var revealables = document.querySelectorAll('.rv');
  if (reduced || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (n) { n.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (n, i) {
      n.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
      io.observe(n);
    });
  }

  /* ---------- sticky nav state ---------- */
  var nav = document.getElementById('nav');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      nav.classList.toggle('is-stuck', window.scrollY > 24);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- design version switch ----------
     V1 is the original sky-blue design; V2 is the client's navy-and-gold
     revision. The head script has already applied the saved choice, so this
     only syncs the button and records new choices (?v=2 makes a shareable link). */
  var root = document.documentElement;
  var ver = document.getElementById('verToggle');
  var VER_TITLES = {
    '1': 'Version 1: original sky-blue design. Click to see version 2.',
    '2': 'Version 2: navy and gold, the corporate branding the client asked for. Click to go back to version 1.'
  };
  function setVersion(v, remember) {
    root.setAttribute('data-version', v);
    ver.setAttribute('aria-pressed', String(v === '2'));
    ver.title = VER_TITLES[v];
    if (!remember) return;
    try { localStorage.setItem('sc-version', v); } catch (e) {}
    try {
      var url = new URL(window.location.href);
      if (v === '2') url.searchParams.set('v', '2'); else url.searchParams.delete('v');
      window.history.replaceState(null, '', url);
    } catch (e) {}
  }
  if (ver) {
    setVersion(root.getAttribute('data-version') === '2' ? '2' : '1', false);
    ver.addEventListener('click', function () {
      setVersion(root.getAttribute('data-version') === '2' ? '1' : '2', true);
    });
  }

  /* ---------- footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
