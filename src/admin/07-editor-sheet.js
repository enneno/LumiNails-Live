    // One native dialog for existing editors. Nodes stay under their original
    // record/root so the established payload readers and delegated events work.
    let adminAktivSzerkesztoPanel = null;
    let adminSzerkesztoPanelSorszam = 0;

    function adminSzerkesztoPanelMegnyitasa({ owner, nodes, title, trigger, saveLabel = 'Módosítások mentése', onSave, onClose }) {
        if(window.LumiReferenceUiActive)return;
        nodes = nodes.map((node) =>
            node.matches?.('select') && node.closest('.admin-select-control') ? node.closest('.admin-select-control') : node
        );
        if (!owner?.isConnected || !nodes.length) return;
        if (adminAktivSzerkesztoPanel?.owner === owner && adminAktivSzerkesztoPanel.dialog.isConnected && adminAktivSzerkesztoPanel.dialog.open)
            return;
        adminAktivSzerkesztoPanel?.finish();
        const dialog = document.createElement('dialog');
        dialog.className = 'admin-editor-sheet';
        dialog.dataset.entering = '';
        const titleId = `admin-editor-title-${++adminSzerkesztoPanelSorszam}`;
        dialog.setAttribute('aria-labelledby', titleId);
        dialog.innerHTML = `<div class="admin-editor-sheet-body">
                <header class="admin-editor-sheet-header">
                    <span class="admin-editor-sheet-handle" aria-hidden="true"></span>
                    <h2 id="${titleId}" tabindex="-1"></h2>
                    <button type="button" class="admin-v2-icon-button" data-editor-close aria-label="Szerkesztő bezárása">${adminV2Ikon('close')}</button>
                </header>
                <div class="admin-editor-sheet-content"></div>
                <footer class="admin-editor-sheet-footer">
                    <p class="admin-editor-sheet-status" role="status" aria-live="polite"></p>
                    <p>A bezárás megtartja a szerkesztett értékeket. A mentés véglegesíti őket.</p>
                    <button type="button" class="admin-v2-button admin-v2-button-primary" data-editor-save></button>
                </footer>
            </div>`;
        dialog.querySelector('h2').textContent = title || 'Szerkesztés';
        const save = dialog.querySelector('[data-editor-save]');
        save.textContent = saveLabel;
        if (!onSave) dialog.querySelector('footer').hidden = true;
        const restore = nodes.map((node) => {
            const marker = document.createComment('editor position');
            node.before(marker);
            const hidden = node.hidden;
            node.hidden = false;
            dialog.querySelector('.admin-editor-sheet-content').append(node);
            return { node, marker, hidden };
        });
        owner.append(dialog);
        const previousOverflow = document.body.style.overflow;
        const workspace = document.querySelector('.admin-workspace-main');
        const previousWorkspaceOverflow = workspace?.style.overflow;
        document.body.style.overflow = 'hidden';
        if (workspace) workspace.style.overflow = 'hidden';
        const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!motion) delete dialog.dataset.entering;
        let closing = false;
        let backdropPointer = false;
        let drag = null;
        const body = dialog.firstElementChild;
        const header = dialog.querySelector('header');
        body.addEventListener(
            'animationend',
            () => {
                delete dialog.dataset.entering;
            },
            { once: true }
        );
        const observer = new MutationObserver(() => {
            if (!dialog.isConnected) finish();
        });
        const statusSource = document.getElementById('admin-online-status');
        const statusMessage = dialog.querySelector('.admin-editor-sheet-status');
        const statusObserver = new MutationObserver(() => {
            statusMessage.textContent = statusSource.textContent;
            statusMessage.classList.toggle('is-error', statusSource.classList.contains('hiba'));
            statusMessage.setAttribute('role', statusSource.classList.contains('hiba') ? 'alert' : 'status');
        });
        if (statusSource)
            statusObserver.observe(statusSource, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class']
            });
        observer.observe(document.body, { childList: true, subtree: true });
        function finish() {
            if (adminAktivSzerkesztoPanel?.dialog !== dialog) return;
            observer.disconnect();
            statusObserver.disconnect();
            adminAktivSzerkesztoPanel = null;
            restore.forEach(({ node, marker, hidden }) => {
                if (marker.parentNode) marker.replaceWith(node);
                node.hidden = hidden;
            });
            dialog.close();
            dialog.remove();
            document.body.style.overflow = previousOverflow;
            if (workspace) workspace.style.overflow = previousWorkspaceOverflow;
            onClose?.();
            if (trigger?.isConnected) trigger.focus({ preventScroll: true });
        }
        function close() {
            if (closing || save.disabled) return;
            closing = true;
            dialog.dataset.closing = '';
            if (!motion) {
                finish();
                return;
            }
            body.animate(
                [
                    { transform: getComputedStyle(body).transform },
                    {
                        transform: window.matchMedia('(min-width: 640px)').matches
                            ? 'translateX(calc(100% + 1rem))'
                            : 'translateY(calc(100% + 1rem))'
                    }
                ],
                { duration: 220, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'forwards' }
            ).finished.then(finish, finish);
        }
        adminAktivSzerkesztoPanel = { owner, dialog, close, finish };
        dialog.addEventListener('cancel', (event) => {
            event.preventDefault();
            close();
        });
        dialog.addEventListener('pointerdown', (event) => {
            backdropPointer = event.target === dialog;
        });
        dialog.addEventListener('click', (event) => {
            if (event.target.closest('[data-editor-close]')) close();
            if (event.target === dialog && backdropPointer) close();
            backdropPointer = false;
        });
        save.addEventListener('click', async () => {
            save.disabled = true;
            save.setAttribute('aria-busy', 'true');
            try {
                await onSave?.();
            } finally {
                save.disabled = false;
                save.removeAttribute('aria-busy');
            }
        });
        header.addEventListener('pointerdown', (event) => {
            if (event.button !== 0 || event.target.closest('button') || window.matchMedia('(min-width: 640px)').matches || closing) return;
            drag = {
                id: event.pointerId,
                y: event.clientY,
                distance: 0,
                time: performance.now()
            };
            delete dialog.dataset.entering;
            header.setPointerCapture(event.pointerId);
            dialog.dataset.dragging = '';
        });
        header.addEventListener('pointermove', (event) => {
            if (!drag || drag.id !== event.pointerId) return;
            drag.distance = Math.max(0, event.clientY - drag.y);
            body.style.transform = `translateY(${drag.distance}px)`;
            dialog.style.setProperty('--sheet-backdrop-opacity', String(0.65 * Math.max(0.15, 1 - drag.distance / body.offsetHeight)));
        });
        const endDrag = (event) => {
            if (!drag || drag.id !== event.pointerId) return;
            const shouldClose =
                event.type !== 'pointercancel' &&
                (drag.distance > 100 || (drag.distance > 35 && drag.distance / Math.max(1, performance.now() - drag.time) > 0.6));
            drag = null;
            if (header.hasPointerCapture(event.pointerId)) header.releasePointerCapture(event.pointerId);
            delete dialog.dataset.dragging;
            dialog.style.removeProperty('--sheet-backdrop-opacity');
            if (shouldClose) close();
            else {
                if (motion)
                    body.animate([{ transform: body.style.transform }, { transform: 'translateY(0)' }], {
                        duration: 220,
                        easing: 'cubic-bezier(.2,.7,.2,1)'
                    });
                body.style.removeProperty('transform');
            }
        };
        header.addEventListener('pointerup', endDrag);
        header.addEventListener('pointercancel', endDrag);
        dialog.showModal();
        dialog.querySelector('h2').focus({ preventScroll: true });
    }

    function adminKartyaPanelMegnyitasa(kartya, booking = false) {
        const nodes = Array.from(
            kartya.querySelectorAll(
                booking
                    ? ':scope > .admin-foglalas-reszletek, :scope > .admin-idopont-szerkeszto, :scope > .admin-db-akciok, [data-foglalas-statusz]'
                    : ':scope > .admin-kompakt-szerkeszto'
            )
        );
        const trigger = kartya.querySelector(booking ? '[data-foglalas-szerkesztes]' : '[data-admin-kartya-toggle]');
        adminSzerkesztoPanelMegnyitasa({
            owner: kartya,
            nodes,
            title: kartya.querySelector('h3')?.textContent || (booking ? 'Időpont szerkesztése' : 'Szerkesztés'),
            trigger,
            onSave: () => lebegoMentes(),
            onClose: () => {
                if (booking) {
                    if (kartya.classList.contains('szerkeszt')) foglalasSzerkesztesKapcsolasa(kartya);
                    if (kartya._studioReturn) {
                        const restore = kartya._studioReturn;
                        delete kartya._studioReturn;
                        restore();
                    }
                } else {
                    kartya.classList.remove('szerkeszt');
                    if (trigger) {
                        trigger.innerHTML = `${adminV2Ikon('edit')}<span>Szerkesztés</span>`;
                        trigger.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        });
    }

    window.LumiAdminSheet = {
        open: adminSzerkesztoPanelMegnyitasa,
        close: () => adminAktivSzerkesztoPanel?.close(),
        resetWithin: (root) => {
            if (root?.contains(adminAktivSzerkesztoPanel?.owner)) adminAktivSzerkesztoPanel.finish();
        }
    };
