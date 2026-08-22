document.addEventListener('DOMContentLoaded', () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    /* ============================================================
       PRELOADER — un barco navega su ruta mientras carga la
       página; al llegar a puerto, el logo se inserta en pantalla
       (misma mecánica de salida que el resto del sitio)
       ============================================================ */
    (function initPreloader() {
        const preloader = document.getElementById('preloader');
        const fill = document.getElementById('preloaderFill');
        const percentLabel = document.getElementById('preloaderPercent');
        const shipWrap = document.getElementById('shipWrap');
        if (!preloader) return;

        if (reducedMotion) {
            finish();
            return;
        }

        const DURATION = 3400; // deja respirar la travesía del barco + el logo
        const start = performance.now();
        let finished = false;

        function tick(now) {
            const t = Math.min(1, (now - start) / DURATION);
            const eased = 1 - Math.pow(1 - t, 3);
            const percent = Math.round(eased * 100);
            fill.style.width = percent + '%';
            percentLabel.textContent = percent + '%';
            // El barco recorre la ruta al mismo ritmo que la carga real
            if (shipWrap) shipWrap.style.left = Math.min(100, Math.max(0, percent)) + '%';
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
       BARRA DE PROGRESO DE SCROLL + HEADER SÓLIDO AL BAJAR
       ============================================================ */
    const scrollProgress = document.getElementById('scrollProgress');
    const nav = document.getElementById('main-nav');

    function onScroll() {
        const doc = document.documentElement;
        const scrollTop = doc.scrollTop || document.body.scrollTop;
        const scrollHeight = (doc.scrollHeight || document.body.scrollHeight) - doc.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        if (scrollProgress) scrollProgress.style.width = progress + '%';
        if (nav) nav.classList.toggle('scrolled', scrollTop > 40);
    }
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ============================================================
       MENÚ MÓVIL
       ============================================================ */
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('is-open');
            navToggle.classList.toggle('is-open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });

        navMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('is-open');
                navToggle.classList.remove('is-open');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
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

    /* ============================================================
       TARJETAS CON INCLINACIÓN 3D + SPOTLIGHT
       ============================================================ */
    if (isFinePointer && !reducedMotion) {
        document.querySelectorAll('[data-tilt]').forEach((card) => {
            const strength = 7;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const rotateX = ((y / rect.height) - 0.5) * -strength;
                const rotateY = ((x / rect.width) - 0.5) * strength;

                card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
                card.style.setProperty('--mx', (x / rect.width) * 100 + '%');
                card.style.setProperty('--my', (y / rect.height) * 100 + '%');
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    /* ============================================================
       RED DE PARTÍCULAS — fondo del hero
       ============================================================ */
    (function initParticles() {
        const canvas = document.getElementById('particles');
        if (!canvas || reducedMotion) return;

        const ctx = canvas.getContext('2d');
        const hero = canvas.closest('.hero');
        let width, height, dpr;
        let particles = [];
        let mouse = { x: null, y: null };

        const PALETTE = ['rgba(127,212,244,', 'rgba(43,180,236,', 'rgba(28,143,201,'];

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = hero.offsetWidth;
            height = hero.offsetHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const count = Math.min(70, Math.round((width * height) / 20000));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                r: Math.random() * 1.6 + 0.6,
                c: PALETTE[Math.floor(Math.random() * PALETTE.length)]
            }));
        }

        function step() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                if (mouse.x !== null) {
                    const dx = p.x - mouse.x, dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        const force = (140 - dist) / 140 * 0.03;
                        p.x += dx * force;
                        p.y += dy * force;
                    }
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.c + '0.75)';
                ctx.fill();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(43, 180, 236, ${0.14 * (1 - dist / 130)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
        }

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

        let visible = true;
        document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 200);
        });

        resize();
        requestAnimationFrame(function loop() {
            if (visible) step();
            requestAnimationFrame(loop);
        });
    })();

    /* ============================================================
       AÑO DINÁMICO EN EL FOOTER
       ============================================================ */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});
