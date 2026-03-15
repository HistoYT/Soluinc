// quote.js

document.addEventListener('DOMContentLoaded', () => {
    const quoteForm = document.getElementById('quoteForm');
    if (!quoteForm) return; // Salir si el formulario no existe

    // Elementos para mostrar los precios
    const basePriceDisplay = document.getElementById('basePriceDisplay');
    const featuresPriceDisplay = document.getElementById('featuresPriceDisplay');
    const additionalPagesPriceDisplay = document.getElementById('additionalPagesPriceDisplay');
    const maintenancePriceDisplay = document.getElementById('maintenancePriceDisplay');
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    
    const whatsappBtn = document.getElementById('whatsappBtn');
    const emailBtn = document.getElementById('emailBtn');
    const emailFormFields = document.getElementById('emailFormFields');

    // Función auxiliar para formatear moneda a COP
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0, // Sin decimales para COP
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Función para animar el cambio de precio
    const animateValue = (element) => {
        element.classList.remove('price-update');
        // Truco para reiniciar la animación: void offsetWidth fuerza un reflow
        void element.offsetWidth; 
        element.classList.add('price-update');
    };

    // Función para actualizar estilos visuales de las tarjetas seleccionadas
    const updateCardStyles = () => {
        const cards = quoteForm.querySelectorAll('.option-card');
        cards.forEach(card => {
            const input = card.querySelector('input');
            if (input && input.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    };

    // Función para generar el mensaje de WhatsApp y actualizar el enlace
    const updateSubmissionActions = (data) => {
        const {
            basePrice,
            websiteTypeText,
            featuresByGroup,
            additionalPagesCount,
            additionalPagesPrice,
            maintenanceText,
            total
        } = data;

        // Construir texto de características
        let featuresText = '';
        for (const [label, items] of Object.entries(featuresByGroup)) {
            featuresText += `\n\n*${label}:*\n${items.join('\n')}`;
        }

        // Construir texto de páginas adicionales
        let additionalPagesText = '';
        if (additionalPagesCount > 0) {
            additionalPagesText = `\n\n*Páginas Adicionales:* ${additionalPagesCount} (${formatCurrency(additionalPagesPrice)})`;
        }

        // Construir el mensaje final
        const message = `¡Hola Soluinc! 👋\n\nQuisiera solicitar una cotización basada en la siguiente configuración:\n\n*Plan Seleccionado:*\n- ${websiteTypeText} (${formatCurrency(basePrice)})${featuresText}${additionalPagesText}\n\n*Plan de Mantenimiento:*\n- ${maintenanceText}\n\n------------------------\n*TOTAL ESTIMADO: ${formatCurrency(total)}*\n------------------------\n\nQuedo atento a su contacto. ¡Gracias!`;

        // Actualizar el enlace del botón de WhatsApp
        if (whatsappBtn) {
            const whatsappNumber = '573054497967';
            const encodedMessage = encodeURIComponent(message);
            whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        }
    };

    const calculateQuote = () => {
        let basePrice = 0;
        let featuresPrice = 0;
        let additionalPagesPrice = 0;
        let maintenancePrice = 0;

        // --- Recopilación de datos para el mensaje ---
        let websiteTypeText = 'N/A';
        const featuresByGroup = {};
        let additionalPagesCount = 0;
        let maintenanceText = 'N/A';
        // --- Fin de recopilación de datos ---

        // 1. Obtener el precio del Plan base
        const selectedWebsiteType = quoteForm.querySelector('input[name="website_type"]:checked');
        if (selectedWebsiteType) {
            basePrice = parseInt(selectedWebsiteType.dataset.price || '0');
            websiteTypeText = selectedWebsiteType.closest('.option-card').querySelector('.opt-title').textContent;
        }

        // 2. Obtener el precio y texto de las Funcionalidades
        const selectedFeatures = quoteForm.querySelectorAll('input[name="features"]:checked');
        selectedFeatures.forEach(feature => {
            featuresPrice += parseInt(feature.dataset.price || '0');
            
            const group = feature.closest('.input-group');
            if (group) {
                const groupLabel = group.querySelector('.group-label')?.textContent.replace(':', '').trim() || 'Adicionales';
                if (!featuresByGroup[groupLabel]) {
                    featuresByGroup[groupLabel] = [];
                }
                const card = feature.closest('.option-card');
                const title = card.querySelector('.opt-title')?.textContent || 'Opción';
                const price = card.querySelector('.opt-price')?.textContent || '';
                featuresByGroup[groupLabel].push(`- ${title} (${price.replace('+ ', '')})`);
            }
        });

        // 3. Obtener el precio de las Páginas Adicionales
        const additionalPagesInput = quoteForm.querySelector('#additional_pages');
        if (additionalPagesInput) {
            additionalPagesCount = parseInt(additionalPagesInput.value) || 0;
            const pricePerPage = parseInt(additionalPagesInput.dataset.price || '0');
            additionalPagesPrice = additionalPagesCount * pricePerPage;
        }

        // 4. Obtener el precio del Plan de Mantenimiento
        const selectedMaintenance = quoteForm.querySelector('#maintenance_plan');
        if (selectedMaintenance) {
            const selectedOption = selectedMaintenance.options[selectedMaintenance.selectedIndex];
            maintenancePrice = parseInt(selectedOption.dataset.price || '0');
            maintenanceText = selectedOption.text;
        }

        // Calcular el Total
        const total = basePrice + featuresPrice + additionalPagesPrice + maintenancePrice;

        // Actualizar la visualización en la UI
        basePriceDisplay.textContent = formatCurrency(basePrice);
        featuresPriceDisplay.textContent = formatCurrency(featuresPrice);
        additionalPagesPriceDisplay.textContent = formatCurrency(additionalPagesPrice);
        maintenancePriceDisplay.textContent = formatCurrency(maintenancePrice);
        totalPriceDisplay.textContent = formatCurrency(total);
        
        // Disparar animaciones de precio
        animateValue(basePriceDisplay);
        animateValue(featuresPriceDisplay);
        animateValue(additionalPagesPriceDisplay);
        animateValue(maintenancePriceDisplay);
        animateValue(totalPriceDisplay);

        // Actualizar estilos visuales de las tarjetas
        updateCardStyles();

        // Actualizar acciones de envío (WhatsApp) con todos los datos recopilados
        updateSubmissionActions({
            basePrice,
            websiteTypeText,
            featuresByGroup,
            additionalPagesCount,
            additionalPagesPrice,
            maintenanceText,
            total
        });
    };

    // Añadir event listeners a todos los inputs relevantes
    quoteForm.querySelectorAll('input[name="website_type"]').forEach(input => {
        input.addEventListener('change', calculateQuote);
    });

    quoteForm.querySelectorAll('input[name="features"]').forEach(input => {
        input.addEventListener('change', calculateQuote);
    });

    quoteForm.querySelector('#additional_pages').addEventListener('input', calculateQuote);

    quoteForm.querySelector('#maintenance_plan').addEventListener('change', calculateQuote);

    // Event listener para el botón de mostrar formulario de correo
    if (emailBtn && emailFormFields) {
        emailBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isVisible = emailFormFields.classList.toggle('visible');
            const btnText = emailBtn.querySelector('span');

            if (btnText) {
                btnText.textContent = isVisible ? 'Ocultar Formulario' : 'Enviar por Correo';
            }
        });
    }

    // Realizar el cálculo inicial cuando la página carga
    calculateQuote();
});