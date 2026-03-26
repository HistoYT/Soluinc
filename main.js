document.addEventListener('DOMContentLoaded', () => {
    const bgAnimation = document.querySelector('.bg-animation');
    const buttons = document.querySelectorAll('.nav-btn');
    
    // Configuración de la intensidad del movimiento
    const bgFactor = 300; // Aumentado para que el movimiento sea mucho más suave
    const originalBgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg-color');
    
    // Colores distintos para cada botón
    const buttonColors = [
        '#001a33', // Azul profundo brillante (Web)
        '#00334d', // Azul cian oscuro (Comercio)
        '#002244'  // Azul marino intenso (Contabilidad)
    ];

    // --- SISTEMA CORPORATIVO ABSTRACTO ---
    // Generación de formas geométricas flotantes
    const shapeCount = 15; // Número de elementos flotantes
    const minSize = 40;
    const maxSize = 120;

    for (let i = 0; i < shapeCount; i++) {
        const shape = document.createElement('div');
        shape.classList.add('tech-shape');
        
        // Tamaño aleatorio
        const size = Math.random() * (maxSize - minSize) + minSize;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        
        // Posición horizontal aleatoria
        shape.style.left = `${Math.random() * 100}vw`;
        
        // Animación desfasada para naturalidad
        const duration = Math.random() * 15 + 15; // Entre 15 y 30 segundos
        const delay = Math.random() * 20; // Retraso inicial
        
        shape.style.animationDuration = `${duration}s`;
        shape.style.animationDelay = `-${delay}s`; // Negativo para que empiecen ya en movimiento

        bgAnimation.appendChild(shape);
    }

    document.addEventListener('mousemove', (e) => {
        // Calcular la posición del mouse relativa al centro de la pantalla
        const x = (window.innerWidth / 2 - e.pageX);
        const y = (window.innerHeight / 2 - e.pageY);

        // Movimiento del Contenedor (Parallax suave)
        const bgX = x / bgFactor;
        const bgY = y / bgFactor;
        if (bgAnimation) {
            // Usamos rotate para cambiar el ángulo de visión del espacio 3D
            bgAnimation.style.transform = `rotateY(${bgX * 0.02}deg) rotateX(${-bgY * 0.02}deg)`;
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
                e.preventDefault(); 
                // isNavigating = true; // Variable ya no necesaria

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
