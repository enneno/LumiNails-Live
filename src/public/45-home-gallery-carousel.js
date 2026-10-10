/* Studio photographs. Page sections remain visible with and without JavaScript. */
let lumiStudio = null;

function fooldalStudioBekotese() {
    const heroImage = document.querySelector('#hero .hero-kep');
    const hero = document.getElementById('hero');
    const strip = document.querySelector('#galeria-atvezeto .galeria-atvezeto-kepek');
    if (lumiStudio || !heroImage || !strip) return;
    const thumbnails = Array.from(strip.querySelectorAll('img'));
    let selectedImage = -1;
    let imageRequest = 0;
    let swipeStart = null;
    let openingImage = { src: heroImage.src, alt: heroImage.alt };
    const status = document.querySelector('[data-studio-image-status]');

    const thumbnailButtons = thumbnails.map((image, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'studio-thumbnail';
        button.setAttribute('aria-label', `${index + 1}. munka megjelenítése: ${image.alt}`);
        button.setAttribute('aria-pressed', 'false');
        image.before(button);
        button.appendChild(image);
        button.addEventListener('click', () => showImage(index));
        return button;
    });

    function markImage(index) {
        selectedImage = index;
        hero.classList.toggle('studio-gallery-image', index >= 0);
        thumbnailButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
        if (status) status.textContent = index < 0 ? 'Lumi Nails nyitókép' : `${index + 1}. munka, összesen ${thumbnails.length}`;
    }

    async function showImage(index) {
        const request = ++imageRequest;
        const image = index < 0 ? openingImage : {
            src: thumbnails[index].dataset.fullSrc || thumbnails[index].src,
            alt: thumbnails[index].alt
        };
        let timer;
        hero.setAttribute('aria-busy', 'true');
        try {
            const preload = new Image();
            preload.src = image.src;
            await Promise.race([
                preload.decode(),
                new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('image-timeout')), 8000); })
            ]);
            if (request !== imageRequest) return;
            heroImage.src = image.src;
            heroImage.alt = image.alt;
            markImage(index);
        } catch (_error) {
            if (request === imageRequest && status) status.textContent = 'A kép nem tölthető be. Próbáld újra, vagy nyisd meg a galériát.';
        } finally {
            clearTimeout(timer);
            if (request === imageRequest) hero.removeAttribute('aria-busy');
        }
    }

    function step(direction) {
        const next = ((selectedImage + 1 + direction + thumbnails.length + 1) % (thumbnails.length + 1)) - 1;
        showImage(next);
    }
    document.querySelectorAll('[data-studio-image-step]').forEach(button => {
        button.hidden = false;
        button.addEventListener('click', () => step(Number(button.dataset.studioImageStep)));
    });
    const visual = hero.querySelector('.hero-visual');
    visual.addEventListener('pointerdown', event => {
        if (event.isPrimary && event.button === 0) swipeStart = event.clientX;
    });
    visual.addEventListener('pointerup', event => {
        if (swipeStart === null) return;
        const distance = event.clientX - swipeStart;
        swipeStart = null;
        if (Math.abs(distance) > 42) step(distance > 0 ? -1 : 1);
    });
    visual.addEventListener('pointercancel', () => { swipeStart = null; });

    lumiStudio = {
        refreshOpening() {
            openingImage = { src: heroImage.src, alt: heroImage.alt };
            if (selectedImage >= 0) showImage(selectedImage);
            thumbnailButtons.forEach((button, index) => button.setAttribute('aria-label', `${index + 1}. munka megjelenítése: ${thumbnails[index].alt}`));
        }
    };
    document.body.classList.add('studio-enhanced');
}

function fooldalStudioTartalomFrissitese() {
    if (lumiStudio) lumiStudio.refreshOpening();
}
