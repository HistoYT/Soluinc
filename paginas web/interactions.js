document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    /* ============================================================
       PRELOADER — terminal que "compila" el sitio y luego el logo
       se inserta en la pantalla (misma mecánica de salida que el home)
       ============================================================ */
    (function initPreloader() {
        const preloader = document.getElementById('preloader');
        const fill = document.getElementById('preloaderFill');
        const percentLabel = document.getElementById('preloaderPercent');
        if (!preloader) return;

        if (reducedMotion) {
            finish();
            return;
        }

        const DURATION = 3400; // deja respirar la secuencia de terminal + logo
        const start = performance.now();
        let finished = false;

        function tick(now) {
            const t = Math.min(1, (now - start) / DURATION);
            const eased = 1 - Math.pow(1 - t, 3);
            const percent = Math.round(eased * 100);
            fill.style.width = percent + '%';
            percentLabel.textContent = percent + '%';
            if (t < 1) {
                requestAnimationFrame(tick);
            } else if (document.readyState === 'complete') {
                finish();
            } else {
                window.addEventListener('load', finish, { once: true });
            }
        }
        requestAnimationFrame(tick);

        // Red de seguridad: nunca dejar al usuario atrapado en la carga
        setTimeout(finish, 6000);

        function finish() {
            if (finished) return;
            finished = true;
            preloader.classList.add('preloader--exit');
            document.body.classList.remove('no-scroll');
            document.body.classList.add('is-loaded');

            const hide = () => preloader.classList.add('preloader--hidden');
            preloader.addEventListener('transitionend', hide, { once: true });
            setTimeout(hide, 1300); // respaldo si transitionend no dispara
        }
    })();

    /* ============================================================
       BRILLO AMBIENTAL QUE SIGUE AL CURSOR
       ============================================================ */
    if (isFinePointer && !reducedMotion) {
        const glow = document.getElementById('cursorGlow');
        if (glow) {
            let gx = window.innerWidth / 2, gy = window.innerHeight / 2;
            let tx = gx, ty = gy;

            window.addEventListener('mousemove', (e) => {
                tx = e.clientX; ty = e.clientY;
                glow.classList.add('is-active');
            });

            (function animateGlow() {
                gx += (tx - gx) * 0.12;
                gy += (ty - gy) * 0.12;
                glow.style.transform = `translate(${gx}px, ${gy}px)`;
                requestAnimationFrame(animateGlow);
            })();
        }
    }

    /* ============================================================
       BARRA DE PROGRESO DE SCROLL
       ============================================================ */
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
        function onScroll() {
            const doc = document.documentElement;
            const scrollTop = doc.scrollTop || document.body.scrollTop;
            const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            scrollProgress.style.width = progress + '%';
        }
        document.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    /* ============================================================
       REVELADO AL HACER SCROLL (IntersectionObserver)
       ============================================================ */
    const revealEls = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        revealEls.forEach((el) => observer.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is-visible'));
    }
});
