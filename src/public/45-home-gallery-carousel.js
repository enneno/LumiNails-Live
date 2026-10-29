/* A continuous row of original images, with dragging and shared enlargement. */
let lumiStudio = null;

function fooldalStudioBekotese() {
    const strip = document.querySelector('#galeria-atvezeto .galeria-atvezeto-kepek');
    if (lumiStudio || !strip) return;
    const images = Array.from(strip.querySelectorAll('img'));
    const status = document.querySelector('[data-studio-image-status]');
    const section = strip.closest('#galeria-atvezeto');
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
        image.draggable = false;
        button.addEventListener('click', event => {
            event.preventDefault();
            event.stopImmediatePropagation();
            if (performance.now() < suppressClickUntil) return;
            showImage(index);
        }, true);
        return button;
    });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let step = 0, maximum = 0, frame = 0, lastTime = 0, remainder = 0;
    let inView = false, openingImage = false;
    let pointer = null, touching = false, suppressClickUntil = 0;
    strip.classList.add('is-flowing');

    function applyPosition(position) {
        if (maximum <= 0) return;
        // Recycle the offscreen original instead of cloning images or focusable controls.
        if (maximum > step + 1 && step > 0) {
            while (position < 0) { strip.prepend(strip.lastElementChild); position += step; }
            while (position > maximum) { strip.append(strip.firstElementChild); position -= step; }
        }
        strip.scrollLeft = Math.max(0, Math.min(maximum, position));
    }
    function canAnimate() {
        return inView && !document.hidden && !reducedMotion.matches
            && !pointer && !touching && !openingImage && maximum > step + 1
            && !document.getElementById('galeria-lightbox')?.classList.contains('nyitva');
    }
    function animate(now) {
        frame = 0;
        if (!canAnimate()) { syncMotion(); return; }
        if (lastTime) {
            const distance = Math.min(now - lastTime, 64) * 0.098 + remainder;
            const pixels = Math.floor(distance);
            remainder = distance - pixels;
            if (pixels) applyPosition(strip.scrollLeft - pixels);
        }
        lastTime = now;
        frame = requestAnimationFrame(animate);
    }
    function syncMotion() {
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
        remainder = 0;
        if (!canAnimate()) return;
        frame = requestAnimationFrame(animate);
    }
    function measure() {
        step = (buttons[0]?.getBoundingClientRect().width || strip.clientWidth)
            + (parseFloat(getComputedStyle(strip).columnGap) || 0);
        maximum = strip.scrollWidth - strip.clientWidth;
        syncMotion();
    }
    strip.addEventListener('pointerdown', event => {
        // Touch uses its own stream: iOS can cancel Pointer Events when it starts a gesture.
        if (event.pointerType === 'touch' || !event.isPrimary || event.button !== 0) return;
        pointer = { kind: 'pointer', id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, dragging: false };
        syncMotion();
    });
    function moveDrag(x, y, capture) {
        const dx = x - pointer.x, dy = y - pointer.y;
        if (!pointer.dragging && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
            pointer.dragging = true;
            capture?.();
            strip.classList.add('is-dragging');
        }
        if (pointer.dragging) applyPosition(strip.scrollLeft - (x - pointer.lastX));
        pointer.lastX = x;
        return pointer.dragging;
    }
    strip.addEventListener('pointermove', event => {
        if (pointer?.kind !== 'pointer' || pointer.id !== event.pointerId) return;
        if (moveDrag(event.clientX, event.clientY, () => strip.setPointerCapture(event.pointerId))) event.preventDefault();
    });
    function finishDrag() {
        if (!pointer) { syncMotion(); return; }
        const wasDragging = pointer.dragging;
        const capturedId = pointer.kind === 'pointer' ? pointer.id : null;
        pointer = null;
        strip.classList.remove('is-dragging');
        if (capturedId !== null && strip.hasPointerCapture(capturedId)) strip.releasePointerCapture(capturedId);
        if (wasDragging) suppressClickUntil = performance.now() + 250;
        syncMotion();
    }
    function finishPointer(event) {
        if (pointer?.kind === 'pointer' && pointer.id === event.pointerId) finishDrag();
    }
    strip.addEventListener('pointerup', finishPointer);
    strip.addEventListener('pointercancel', finishPointer);
    strip.addEventListener('lostpointercapture', event => {
        // A descendant's capture change does not end the row's drag.
        if (event.target === strip) finishPointer(event);
    });
    strip.addEventListener('touchstart', event => {
        touching = true;
        if (event.touches.length !== 1) { finishDrag(); return; }
        const touch = event.touches[0];
        pointer = { kind: 'touch', id: touch.identifier, x: touch.clientX, y: touch.clientY, lastX: touch.clientX, dragging: false };
        syncMotion();
    }, { passive: true });
    strip.addEventListener('touchmove', event => {
        if (pointer?.kind !== 'touch') return;
        const touch = Array.from(event.touches).find(touch => touch.identifier === pointer.id);
        if (!touch) return;
        const dx = touch.clientX - pointer.x, dy = touch.clientY - pointer.y;
        // Let a vertical gesture scroll the page, and leave multi-touch zoom to the browser.
        if (!pointer.dragging && Math.abs(dy) > 6 && Math.abs(dy) >= Math.abs(dx)) { finishDrag(); return; }
        if (moveDrag(touch.clientX, touch.clientY) && event.cancelable) event.preventDefault();
    }, { passive: false });
    function finishTouch(event) {
        touching = event.touches.length > 0;
        if (pointer?.kind === 'touch') finishDrag();
        else syncMotion();
    }
    strip.addEventListener('touchend', finishTouch, { passive: true });
    strip.addEventListener('touchcancel', finishTouch, { passive: true });
    strip.addEventListener('wheel', event => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) && !event.shiftKey) return;
        event.preventDefault();
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? strip.clientWidth : 1;
        applyPosition(strip.scrollLeft + (event.deltaX || event.deltaY) * unit);
        syncMotion();
    }, { passive: false });
    strip.addEventListener('keydown', event => {
        if (event.target !== strip || !['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) return;
        event.preventDefault();
        if (event.key !== ' ') applyPosition(strip.scrollLeft + (event.key === 'ArrowLeft' ? -step : step));
        syncMotion();
    });
    section.addEventListener('focusin', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    reducedMotion.addEventListener('change', syncMotion);
    if (typeof ResizeObserver === 'function') new ResizeObserver(measure).observe(strip);
    else window.addEventListener('resize', measure);
    if (typeof IntersectionObserver === 'function') {
        new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncMotion(); }).observe(strip);
    } else inView = true;

    async function showImage(index) {
        const request = ++imageRequest;
        const image = images[index];
        openingImage = true;
        syncMotion();
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
            galeriaBekotese();
            buttons[index].focus({ preventScroll: true });
            galeriaMegnyitasa(Array.from(strip.children).indexOf(buttons[index]));
        } catch (_error) {
            if (request === imageRequest && status) status.textContent = 'A kép nem tölthető be. Próbáld újra, vagy nyisd meg a galériát.';
        } finally {
            clearTimeout(timer);
            if (request === imageRequest) {
                buttons[index].removeAttribute('aria-busy');
                openingImage = false;
                syncMotion();
            }
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
            measure();
        }
    };
    lumiStudio.refresh();
}

function fooldalStudioTartalomFrissitese() {
    if (lumiStudio) lumiStudio.refresh();
}
