// Theme toggle and small UI behaviors for RMC site
(function(){
  const body = document.body;

  // --- Updated Theme Logic ---

  function setToggleLabels(name){
    const isDark = name === 'dark';
    const labelText = isDark ? 'Light theme' : 'Dark theme';
    const iconClass = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    
    const headerToggleEl = document.getElementById('theme-toggle');
    const mobileToggleEl = document.getElementById('mobile-theme-toggle');

    if(headerToggleEl) {
      headerToggleEl.innerHTML = `<i class="${iconClass}" aria-hidden="true" style="color: rgb(255, 212, 59);"></i>`;
    }
    if(mobileToggleEl) {
      // For mobile, we show both the icon and the text label
      mobileToggleEl.innerHTML = `<i class="${iconClass}" aria-hidden="true" style="color: rgb(255, 212, 59);"></i> <span class="theme-label">${labelText}</span>`;
    }
  }

  function applyTheme(name){
    if(name === 'dark') body.classList.add('theme-dark');
    else body.classList.remove('theme-dark');
    localStorage.setItem('site-theme', name);
    setToggleLabels(name);
  }

  function toggleTheme(){
    const isDark = body.classList.contains('theme-dark');
    applyTheme(isDark ? 'light' : 'dark');
  }

  // Global initialization
  const saved = localStorage.getItem('site-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);

  // Use event delegation for toggles so they work even if rendered late
  document.addEventListener('click', (e) => {
    if (e.target.closest('#theme-toggle')) {
      toggleTheme();
    }
  });
  const mobileThemeToggleEl = document.getElementById('mobile-theme-toggle');

if (mobileThemeToggleEl) {
  mobileThemeToggleEl.addEventListener('click', function(e) {
    // .closest() ensures that even if you click the icon or text, 
    // it treats it as a click on the button itself.
    const btn = e.target.closest('#mobile-theme-toggle');
    if (btn) {
      toggleTheme(); // Triggers your existing global theme toggle function
    }
  });
}


  // init theme based on saved preference or system
  (function initTheme(){
    const saved = localStorage.getItem('site-theme');
    if(saved) { applyTheme(saved); return }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  })();

  // hook up toggles if they exist
  const headerToggle = document.getElementById('theme-toggle');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
  if(headerToggle) headerToggle.addEventListener('click', toggleTheme);
  if(mobileThemeToggle) mobileThemeToggle.addEventListener('click', toggleTheme);

  // expose helpers globally so the mobile menu scope can sync labels when opened
  window.applyTheme = applyTheme;
  window.toggleTheme = toggleTheme;
  window.setToggleLabels = setToggleLabels;

  // set year
  const y = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = y;

  // Smooth scroll for internal nav anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(href.length>1){
        const el = document.querySelector(href);
        if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
      }
    });
  });
})();

// Initialize Leaflet map if available
document.addEventListener('DOMContentLoaded', function(){
  if(typeof L === 'undefined') return; // Leaflet not loaded
  try{
    const map = L.map('leaflet-map', {scrollWheelZoom: false}).setView([12.922915, 77.484306], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    const marker = L.marker([12.922915, 77.484306]).addTo(map);
    marker.bindPopup(`
      <strong>AM CONCRETE</strong><br/>
      Sy no.19/3 &amp; 19/21 Maragondahalli<br/>
      Kengeri Hobli, Bengaluru<br/>
      <br/>
      <a href="tel:+919164454045">+91 91644 54045</a><br/>
      <a href="mailto:amconcrete999@gmail.com">amconcrete999@gmail.com</a>
    `).openPopup();
  }catch(e){
    console.warn('Leaflet map init failed', e);
  }
});

// Mobile menu toggle logic
(function(){
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  const mobileOverlay = document.getElementById('mobile-overlay');

  if(!menuToggle || !mobileMenu) return;

  function openMenu(){
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden','false');
    mobileOverlay.hidden = false;
    requestAnimationFrame(()=> mobileOverlay.classList.add('visible'));
    menuToggle.setAttribute('aria-expanded','true');
    // animate hamburger into close icon
    const icon = menuToggle.querySelector('i');
    if(icon){ icon.classList.remove('fa-bars'); icon.classList.add('fa-xmark'); }
    menuToggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu(){
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden','true');
    mobileOverlay.classList.remove('visible');
    setTimeout(()=> mobileOverlay.hidden = true, 250);
    menuToggle.setAttribute('aria-expanded','false');
    // animate close icon back to hamburger
    const icon = menuToggle.querySelector('i');
    if(icon){ icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars'); }
    menuToggle.classList.remove('open');
    document.body.style.overflow = '';
  }
  menuToggle.addEventListener('click', ()=>{ if(mobileMenu.classList.contains('open')) closeMenu(); else openMenu(); });
  if(mobileClose) mobileClose.addEventListener('click', closeMenu);
  if(mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeMenu(); });

  // Close when mobile nav link clicked
  mobileMenu.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> closeMenu()));

  // Ensure mobile theme toggle updates label and triggers the global toggle
  const mobileThemeToggleEl = document.getElementById('mobile-theme-toggle');
  if(mobileThemeToggleEl){
    // ensure label reflects current theme when menu is opened
    // call setToggleLabels now in case the element exists before menu opens
    setToggleLabels(document.body.classList.contains('theme-dark') ? 'dark' : 'light');
    mobileThemeToggleEl.addEventListener('click', ()=>{
      // toggle theme; applyTheme will call setToggleLabels
      toggleTheme();
    });
    document.addEventListener('DOMContentLoaded', ()=> setToggleLabels(document.body.classList.contains('theme-dark') ? 'dark' : 'light'));
  }

  // when opening the menu, sync the label so it always shows the correct current action
  const origOpenMenu = openMenu;
  openMenu = function(){
    origOpenMenu();
    setToggleLabels(document.body.classList.contains('theme-dark') ? 'dark' : 'light');
  };
})();

// Measurement / concrete calculator
(function(){
  const toMeters = {
    'm': v => v,
    'ft': v => v * 0.3048,
    'cm': v => v * 0.01,
    'in': v => v * 0.0254
  };

  function qs(id){ return document.getElementById(id); }
  const btn = qs('calc-btn');
  const clear = qs('calc-clear');
  const out = qs('calc-output');

  if(btn){
    btn.addEventListener('click', ()=>{
      const l = parseFloat(qs('dim-length').value) || 0;
      const w = parseFloat(qs('dim-width').value) || 0;
      const d = parseFloat(qs('dim-depth').value) || 0;
      const unit = qs('dim-unit').value || 'm';
      if(l <= 0 || w <= 0 || d <= 0){
        out.innerHTML = '<strong class="muted">Please enter positive numbers for length, width and depth.</strong>';
        return;
      }
      // convert each to meters
      const lm = toMeters[unit](l);
      const wm = toMeters[unit](w);
      const dm = toMeters[unit](d);
      const volume = lm * wm * dm; // in cubic metres
      const roundedUp = Math.ceil(volume);
      out.innerHTML = `<strong>${roundedUp} m³</strong> (Exact: ${volume.toFixed(3)} m³)`;
    });
  }
  if(clear){
    clear.addEventListener('click', ()=>{
      ['dim-length','dim-width','dim-depth'].forEach(id=>{ const e = qs(id); if(e) e.value = ''; });
      out.textContent = 'Enter dimensions and click Calculate to see volume in m³.';
    });
  }
})();
