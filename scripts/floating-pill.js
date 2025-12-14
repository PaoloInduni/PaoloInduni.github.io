document.addEventListener('DOMContentLoaded', function () {
    const pill = document.getElementById('floating-pill');
    const hideBtn = document.getElementById('fp-hide-btn');
    const restoreBtn = document.getElementById('fp-restore-btn');
    const buttons = Array.from(document.querySelectorAll('.fp-btn'));
    const sections = buttons.map(b => document.querySelector(b.dataset.target)).filter(Boolean);
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // restore persisted visibility
    if (localStorage.getItem('fp-hidden') === '1') {
        pill.classList.add('hidden');
        restoreBtn.hidden = false;
    } else {
        // animate pill into view
        requestAnimationFrame(() => setTimeout(()=> pill.classList.add('visible'), 80));
    }

    // click -> scroll to section
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            const target = document.querySelector(btn.dataset.target);
            if (target) {
                target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
                setActive(btn);
            }
        });
        // keyboard activation is native for <button>, but keep aria update on focus click via keyboard
        btn.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    function setActive(activeBtn) {
        buttons.forEach(b => {
            const isActive = b === activeBtn;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            if (isActive) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        });
    }

    // hide/restore handlers
    hideBtn.addEventListener('click', function () {
        pill.classList.remove('visible');
        pill.classList.add('hidden');
        restoreBtn.hidden = false;
        localStorage.setItem('fp-hidden', '1');
        restoreBtn.focus();
    });
    restoreBtn.addEventListener('click', function () {
        pill.classList.remove('hidden');
        pill.classList.add('visible');
        restoreBtn.hidden = true;
        localStorage.setItem('fp-hidden', '0');
        hideBtn.focus();
    });

    // allow Escape to hide the pill quickly
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !pill.classList.contains('hidden')) {
            pill.classList.remove('visible');
            pill.classList.add('hidden');
            restoreBtn.hidden = false;
            localStorage.setItem('fp-hidden', '1');
        }
    });

    // intersection observer to mark active based on viewport
    if ('IntersectionObserver' in window && sections.length) {
        const obs = new IntersectionObserver((entries) => {
            let mostVisible = null;
            entries.forEach(e => {
                if (e.isIntersecting) {
                    if (!mostVisible || e.intersectionRatio > mostVisible.intersectionRatio) {
                        mostVisible = e;
                    }
                }
            });
            if (mostVisible) {
                const id = '#' + mostVisible.target.id;
                const btn = buttons.find(b => b.dataset.target === id);
                if (btn) setActive(btn);
            }
        }, { threshold: [0.25, 0.5, 0.75] });

        sections.forEach(s => obs.observe(s));
    } else {
        // fallback: set first as active
        if (buttons[0]) setActive(buttons[0]);
    }
});
