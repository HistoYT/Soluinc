document.addEventListener('DOMContentLoaded', () => {
    const bgAnimation = document.querySelector('.bg-animation');
    const buttons = document.querySelectorAll('.nav-btn');
    
    // Configuración de la intensidad del movimiento
    const bgFactor = 100; // Factor para el fondo (parallax)
    const originalBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color');
    
    // Colores distintos para cada botón
    const buttonColors = [
        '#001f33', // Azul oscuro profundo (Web)
        '#00334d', // Cian oscuro (Comercio)
        '#0a1429'  // Azul grisáceo oscuro (Contabilidad)
    ];

    // --- SISTEMA DE ESPACIO 3D (COMPLEJO) ---
    const spaceObjects = [];
    const starCount = 1000; // Más estrellas para mayor impacto
    const planetCount = 2; 
    const galaxyCount = 10; // Nuevas galaxias
    const nebulaCount = 5; // Cantidad de nebulosas
    
    let speed = 2; // Velocidad base aumentada para que se note el movimiento
    let targetSpeed = 2; // Para interpolación de velocidad
    let isNavigating = false; // Bandera para controlar el estado de navegación

    class SpaceObject {
        constructor(type) {
            this.type = type;
            this.element = document.createElement('div');
            this.element.classList.add(type);
            this.reset(true); // true = posición inicial aleatoria en todo el volumen
            
            if (type === 'galaxy') {
                const arms = document.createElement('div');
                arms.classList.add('galaxy-arms');
                this.element.appendChild(arms);
            }
            
            bgAnimation.appendChild(this.element);
        }

        reset(initial = false) {
            // Posición aleatoria en X e Y (ampliada para cubrir pantalla)
            this.x = (Math.random() - 0.5) * window.innerWidth * 3;
            this.y = (Math.random() - 0.5) * window.innerHeight * 3;
            
            // Profundidad Z
            this.z = initial ? Math.random() * 2000 : 2000;

            if (this.type === 'star') {
                const size = Math.random() * 2 + 1;
                this.element.style.width = `${size}px`;
                this.element.style.height = `${size}px`;
                this.element.style.opacity = Math.random();
            } else if (this.type === 'galaxy') {
                const size = Math.random() * 300 + 200; // Galaxias grandes
                this.element.style.width = `${size}px`;
                this.element.style.height = `${size}px`;
                // Inclinación 3D aleatoria para la galaxia
                this.rotateX = Math.random() * 60 + 40;
                this.rotateY = Math.random() * 40 - 20;
                this.element.style.zIndex = -1;
            } else if (this.type === 'planet') {
                const size = Math.random() * 100 + 50; // Planetas entre 50px y 150px
                this.element.style.width = `${size}px`;
                this.element.style.height = `${size}px`;
                // Generar color de planeta aleatorio (Gradientes complejos)
                const hue = Math.random() * 360;
                const color1 = `hsl(${hue}, 70%, 50%)`;
                const color2 = `hsl(${hue + 40}, 80%, 20%)`;
                this.element.style.background = `radial-gradient(circle at 30% 30%, ${color1}, ${color2})`;
                this.element.style.zIndex = Math.floor(Math.random() * 5); // Algunas pasan por delante, otras por detrás
            } else if (this.type === 'nebula') {
                const size = Math.random() * 400 + 300;
                this.element.style.width = `${size}px`;
                this.element.style.height = `${size}px`;
                const hue = Math.random() * 360;
                this.element.style.background = `radial-gradient(circle, hsla(${hue}, 60%, 50%, 0.4), transparent 70%)`;
            }
        }

        update() {
            // Mover hacia la cámara (disminuir Z)
            this.z -= speed;
            
            // Efecto Warp: Estirar estrellas cuando vamos rápido
            if (this.type === 'star' && speed > 5) {
                this.element.style.height = `${Math.min(300, speed * 5)}px`; // Estelas mucho más largas y visibles
            } else if (this.type === 'star') {
                this.element.style.height = this.element.style.width;
            }

            // Si pasa la cámara (z < 0), reiniciar al fondo
            if (this.z < 10) {
                this.reset();
            }

            // Proyección 3D simple
            // scale = focalLength / (focalLength + z) -> pero aquí z es distancia desde cámara
            // Usaremos translate3d directamente
            
            // Efecto de desvanecimiento al fondo
            const opacity = this.type === 'star' ? 1 : Math.min(1, (2000 - this.z) / 500);
            this.element.style.opacity = opacity;

            // Aplicar transformación
            // Invertimos Z para CSS (negativo es lejos) pero nuestra lógica usa positivo como distancia
            const cssZ = 1000 - this.z; 
            
            let transform = `translate3d(${this.x}px, ${this.y}px, ${cssZ}px)`;
            
            if (this.type === 'galaxy') {
                transform += ` rotateX(${this.rotateX}deg) rotateY(${this.rotateY}deg)`;
            }
            
            this.element.style.transform = transform;
        }
    }

    // Inicializar objetos
    for (let i = 0; i < starCount; i++) spaceObjects.push(new SpaceObject('star'));
    for (let i = 0; i < planetCount; i++) spaceObjects.push(new SpaceObject('planet'));
    for (let i = 0; i < galaxyCount; i++) spaceObjects.push(new SpaceObject('galaxy'));
    for (let i = 0; i < nebulaCount; i++) spaceObjects.push(new SpaceObject('nebula'));

    // Generador de estrellas fugaces
    function createShootingStar() {
        const star = document.createElement('div');
        star.classList.add('shooting-star');
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        star.style.transform = `rotate(${Math.random() * 45}deg)`;
        bgAnimation.appendChild(star);
        
        setTimeout(() => { star.remove(); }, 1000);
        
        // Próxima estrella fugaz en tiempo aleatorio
        setTimeout(createShootingStar, Math.random() * 3000 + 1000);
    }
    createShootingStar();

    // Loop de animación
    function animateSpace() {
        // Interpolación suave de velocidad (Efecto aceleración/frenado)
        speed += (targetSpeed - speed) * 0.05;
        
        spaceObjects.forEach(obj => obj.update());
        requestAnimationFrame(animateSpace);
    }
    animateSpace();

    // Control de velocidad con el mouse (Efecto Hiperespacio)
    document.addEventListener('mousedown', () => {
        if (!isNavigating) targetSpeed = 150; // Velocidad Warp mucho más intensa
    }); 
    document.addEventListener('mouseup', () => {
        if (!isNavigating) targetSpeed = 2; // Volver a la nueva velocidad base
    });

    // --- FIN SISTEMA 3D ---

    document.addEventListener('mousemove', (e) => {
        // Calcular la posición del mouse relativa al centro de la pantalla
        const x = (window.innerWidth / 2 - e.pageX);
        const y = (window.innerHeight / 2 - e.pageY);

        // Movimiento del Contenedor (Parallax suave)
        const bgX = x / bgFactor;
        const bgY = y / bgFactor;
        if (bgAnimation) {
            // Usamos rotate para cambiar el ángulo de visión del espacio 3D
            bgAnimation.style.transform = `rotateY(${bgX * 0.1}deg) rotateX(${-bgY * 0.1}deg)`;
        }
    });

    // Eventos para cambiar el color de fondo al tocar los botones
    buttons.forEach((btn, index) => {
        btn.addEventListener('mouseenter', () => {
            const color = buttonColors[index % buttonColors.length];
            document.documentElement.style.setProperty('--bg-color', color);
        });

        btn.addEventListener('mouseleave', () => {
            document.documentElement.style.setProperty('--bg-color', originalBgColor);
            
            // Resetear posición magnética
            btn.style.transform = 'translate(0, 0)';
            const img = btn.querySelector('img');
            if (img) img.style.transform = 'scale(1)';
        });

        // Efecto Magnético: El botón sigue al mouse
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Movemos el botón suavemente hacia el mouse
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.1)`;
        });

        // Efecto de Salto al Hiperespacio al hacer click
        btn.addEventListener('click', (e) => {
            // Verificamos si el botón tiene un enlace (href)
            const link = btn.getAttribute('href') || btn.querySelector('a')?.getAttribute('href');
            
            if (link) {
                e.preventDefault(); // Detenemos la carga inmediata
                isNavigating = true; // Bloqueamos otros cambios de velocidad
                targetSpeed = 500; // Velocidad extrema para la transición

                // Efecto visual: La interfaz se desvanece y hace zoom hacia ti
                const container = document.querySelector('.main-container');
                container.style.transition = 'opacity 1s ease, transform 1s ease-in';
                container.style.opacity = '0';
                container.style.transform = 'scale(4)'; // Sensación de atravesar la interfaz

                // Esperamos 1.5 segundos de "viaje" antes de cambiar de página
                setTimeout(() => {
                    window.location.href = link;
                }, 1500);
            }
        });
    });
});
