/* Homepage portfolio reuses the gallery page's keyboard, swipe and focus controls. */
let lumiStudio = null;

function fooldalStudioBekotese() {
    const strip = document.querySelector('#galeria-atvezeto .galeria-atvezeto-kepek');
    if (lumiStudio || !strip) return;
    const images = Array.from(strip.querySelectorAll('img'));
    const status = document.querySelector('[data-studio-image-status]');
    let imageRequest = 0;
    const buttons = images.map((image, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'studio-thumbnail';
        button.setAttribute('aria-haspopup', 'dialog');
        const fallback = image.closest('.studio-gallery-item');
        if (fallback) fallback.replaceWith(button);
        else image.before(button);
        button.appendChild(image);
        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            showImage(index);
        }, true);
        return button;
    });

    async function showImage(index) {
        const request = ++imageRequest;
        const image = images[index];
        let timer;
        buttons.forEach(button => button.removeAttribute('aria-busy'));
        buttons[index].setAttribute('aria-busy', 'true');
        if (status) status.textContent = '';
        try {
            const preload = new Image();
            preload.src = image.dataset.fullSrc || image.src;
            await Promise.race([
                preload.decode(),
                new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('image-timeout')), 8000); })
            ]);
            if (request !== imageRequest) return;
            galeriaMegnyitasa(index);
        } catch (_error) {
            if (request === imageRequest && status) status.textContent = 'A kép nem tölthető be. Próbáld újra, vagy nyisd meg a galériát.';
        } finally {
            clearTimeout(timer);
            if (request === imageRequest) buttons[index].removeAttribute('aria-busy');
        }
    }
    lumiStudio = {
        refresh() {
            buttons.forEach((button, index) => {
                const image = images[index];
                button.dataset.src = image.dataset.fullSrc || image.src;
                button.dataset.alt = image.alt;
                button.setAttribute('aria-label', `${index + 1}. munka megnyitása: ${image.alt}`);
            });
            galeriaBekotese();
        }
    };
    lumiStudio.refresh();
}

function fooldalStudioTartalomFrissitese() {
    if (lumiStudio) lumiStudio.refresh();
}
