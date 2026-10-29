    // One-finger flicks follow the reference thresholds; scrolling and form controls stay native.
    function adminStudioSwipe(root, onSwipe) {
        let start = null,
            last = null,
            suppress = 0;
        root.addEventListener(
            'touchstart',
            (e) => {
                if (root.id === 'admin-studio-week' && !e.target.closest('.studio-week-toolbar')) return;
                if (e.touches.length !== 1 || e.target.closest('input,textarea,select,dialog,.admin-select-control')) {
                    start = null;
                    return;
                }
                const t = e.touches[0];
                start = { x: t.clientX, y: t.clientY, time: performance.now() };
                last = start;
            },
            { passive: true }
        );
        root.addEventListener(
            'touchmove',
            (e) => {
                if (!start || e.touches.length !== 1) {
                    start = null;
                    return;
                }
                const t = e.touches[0],
                    now = performance.now();
                if (Math.abs(t.clientY - start.y) > 12 && Math.abs(t.clientY - start.y) > Math.abs(t.clientX - start.x)) {
                    start = null;
                    return;
                }
                if (now - last.time > 120) last = { x: t.clientX, y: t.clientY, time: now };
            },
            { passive: true }
        );
        root.addEventListener(
            'touchend',
            (e) => {
                if (!start) return;
                const t = e.changedTouches[0],
                    dx = t.clientX - start.x,
                    dy = t.clientY - start.y,
                    dt = performance.now() - last.time;
                const flick = dt <= 90 && Math.abs(t.clientX - last.x) / Math.max(1, dt) >= 0.45;
                if (
                    (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.25) ||
                    (flick && Math.abs(dx) >= 24 && Math.abs(dx) > Math.abs(dy) * 1.25)
                ) {
                    onSwipe(dx < 0 ? 1 : -1);
                    suppress = performance.now() + 350;
                }
                start = null;
            },
            { passive: true }
        );
        root.addEventListener(
            'touchcancel',
            () => {
                start = null;
            },
            { passive: true }
        );
        root.addEventListener(
            'click',
            (e) => {
                if (performance.now() < suppress) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            },
            true
        );
    }
    document.addEventListener('DOMContentLoaded', () => {
        if(window.LumiReferenceUiActive)return;
        adminStudioSwipe(document.querySelector('.admin-foglalas-nezetvalto'), (direction) => {
            const views = ['lista', 'naptar', 'het'];
            foglalasNezetValtasa(views[Math.max(0, Math.min(2, views.indexOf(allapot.foglalasNezet) + direction))]);
        });
        adminStudioSwipe(document.getElementById('admin-foglalas-lista'), (d) =>
            document.querySelector(d > 0 ? '[data-foglalas-oldal="kovetkezo"]' : '[data-foglalas-oldal="elozo"]')?.click()
        );
        adminStudioSwipe(document.querySelector('.studio-month-main'), (d) =>
            document.querySelector('[data-foglalas-naptar-lepes="' + d + '"]')?.click()
        );
        adminStudioSwipe(document.getElementById('admin-studio-week'), (d) => {
            adminStudioHetEltolas += d;
            adminStudioHetRender();
        });
        adminStudioSwipe(document.querySelector('.studio-schedule-days'), (d) => {
            adminStudioBeosztasHet += d;
            adminStudioBeosztasRender();
        });

        adminStudioSwipe(document.getElementById('admin-cms-root'), (d) => {
            if (document.getElementById('admin-cms-root').dataset.lumiCmsGalleryContext === 'images') {
                document.querySelector(d > 0 ? '[data-lumi-gallery-page="next"]' : '[data-lumi-gallery-page="prev"]')?.click();
                return;
            }
            const tabs = Array.from(document.querySelectorAll('.cms-section-index-button'));
            const index = tabs.findIndex((t) => t.getAttribute('aria-current') === 'true');
            tabs[index + d]?.click();
        });
        const logs = document.getElementById('admin-panel-esemenynaplo');
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.className = 'admin-v2-button';
        copy.textContent = 'Jelentés másolása';
        logs?.querySelector('.admin-v2-page-heading')?.append(copy);
        copy.addEventListener('click', async () => {
            const report = (allapot.esemenynaploElemek || [])
                .map((row) => [row.created_at, row.status, row.title, row.message].filter(Boolean).join(' · '))
                .join('\n');
            try {
                await navigator.clipboard.writeText(report);
                onlineStatusz('A betöltött jelentés másolva.');
            } catch (_) {
                onlineStatusz('A böngésző nem engedte a másolást.', true);
            }
        });
        const week = document.getElementById('admin-studio-week');
        let drag = null,
            hold = null,
            down = null,
            clickUntil = 0;
        week.addEventListener(
            'touchmove',
            (e) => {
                if (drag) e.preventDefault();
            },
            { passive: false }
        );
        week.addEventListener('pointerdown', (e) => {
            const event = e.target.closest('[data-foglalas-naptar-megnyitas]');
            if (!event || e.button !== 0) return;
            down = { x: e.clientX, y: e.clientY };
            const arm = () => {
                drag = { id: event.dataset.foglalasId, x: e.clientX, y: e.clientY };
                event.classList.add('is-dragging');
                week.setPointerCapture(e.pointerId);
            };
            if (e.pointerType === 'touch') hold = setTimeout(arm, 350);
            else arm();
        });
        week.addEventListener('pointermove', (e) => {
            if (!drag) {
                if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) clearTimeout(hold);
                return;
            }
            drag.x = e.clientX;
            drag.y = e.clientY;
        });
        week.addEventListener('pointerup', (e) => {
            clearTimeout(hold);
            week.querySelector('.is-dragging')?.classList.remove('is-dragging');
            if (!drag) return;
            const data = drag;
            drag = null;
            const slot = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-studio-slot]');
            if (!slot) return;
            const item = allapot.foglalasElemek.find((i) => String(i.adat.id) === data.id);
            if (!item) return;
            clickUntil = performance.now() + 350;
            adminStudioRekordMegnyitas(item);
            const card = adminStudioFoglalasKartya(item);
            const start = new Date(slot.dataset.studioSlot + 'T' + slot.dataset.time),
                end = new Date(start.getTime() + (new Date(item.adat.ends_at).getTime() - new Date(item.adat.starts_at).getTime()));
            for (const [name, value] of [
                ['date', slot.dataset.studioSlot],
                ['start_time', idoInputErtek(start)],
                ['end_time', idoInputErtek(end)]
            ]) {
                const input = idopontMezo(card, name);
                if (input) {
                    input.value = value;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            onlineStatusz('Áthelyezés előkészítve. Ellenőrizd, majd mentsd az időpontot.');
        });
        week.addEventListener('pointercancel', () => {
            clearTimeout(hold);
            drag = null;
            week.querySelector('.is-dragging')?.classList.remove('is-dragging');
        });
        week.addEventListener(
            'click',
            (e) => {
                if (performance.now() < clickUntil) {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            },
            true
        );
    });

    let adminStudioHuzottTetel = null;
    function adminStudioSorrendCsere(source, target) {
        if (!source || !target || source === target || source.parentElement !== target.parentElement) return;
        if (source.matches('.cms-gallery-item')) {
            let from = Number(source.dataset.galleryIndex),
                to = Number(target.dataset.galleryIndex);
            while (from !== to) {
                document.querySelector('[data-cms-gallery-move="' + (from > to ? 'up' : 'down') + '"][data-index="' + from + '"]')?.click();
                from += from > to ? -1 : 1;
            }
        } else {
            const list = source.parentElement,
                cards = Array.from(list.children);
            list.insertBefore(source, cards.indexOf(source) < cards.indexOf(target) ? target.nextSibling : target);
            list.querySelectorAll('[data-mezo="sort_order"]').forEach((input, index) => {
                input.closest('.admin-db-kartya').dataset.studioSortDirty = 'true';
                input.value = String((index + 1) * 10);
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
            onlineStatusz('Sorrend módosítva. A Mentés véglegesíti.');
        }
    }
    function adminStudioRendezokFrissitese(root) {
        root.querySelectorAll('.admin-szolgaltatas-kartya,.cms-gallery-item').forEach((card) => {
            if (card.querySelector(':scope > [data-studio-sort]')) return;
            card.classList.add('studio-sortable');
            const handle = document.createElement('button');
            handle.type = 'button';
            handle.className = 'studio-sort-handle';
            handle.dataset.studioSort = '';
            handle.draggable = true;
            handle.setAttribute('aria-label', 'Sorrend módosítása húzással vagy a fel és le nyíllal');
            handle.textContent = '⠿';
            card.prepend(handle);
            handle.addEventListener('keydown', (e) => {
                if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;
                e.preventDefault();
                e.stopPropagation();
                const up = e.key === 'ArrowUp',
                    index = Number(card.dataset.galleryIndex);
                if (card.matches('.admin-szolgaltatas-kartya')) szolgaltatasMozgatasa(card, up ? 'fel' : 'le');
                else card.querySelector(up ? '[data-cms-gallery-move="up"]' : '[data-cms-gallery-move="down"]')?.click();
                if (card.matches('.cms-gallery-item'))
                    requestAnimationFrame(() =>
                        root
                            .querySelector(
                                '.cms-gallery-item[data-gallery-index="' + Math.max(0, index + (up ? -1 : 1)) + '"] [data-studio-sort]'
                            )
                            ?.focus()
                    );
            });
        });
    }
    document.addEventListener('DOMContentLoaded', () => {
        if(window.LumiReferenceUiActive)return;
        const root = document.getElementById('admin-tartalom');
        let touch = null;
        root.addEventListener('dragstart', (e) => {
            const handle = e.target.closest('[data-studio-sort]');
            if (!handle) return;
            adminStudioHuzottTetel = handle.parentElement;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', adminStudioHuzottTetel.dataset.id || adminStudioHuzottTetel.dataset.galleryIndex);
        });
        root.addEventListener('dragover', (e) => {
            const target = e.target.closest('.studio-sortable');
            if (adminStudioHuzottTetel && target && target.parentElement === adminStudioHuzottTetel.parentElement) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            }
        });
        root.addEventListener('drop', (e) => {
            const source = adminStudioHuzottTetel;
            adminStudioHuzottTetel = null;
            if (source) {
                e.preventDefault();
                adminStudioSorrendCsere(source, e.target.closest('.studio-sortable'));
            }
        });
        root.addEventListener('dragend', () => {
            adminStudioHuzottTetel = null;
        });
        const clear = () => {
            root.querySelectorAll('.is-sort-source,.is-sort-target').forEach((card) =>
                card.classList.remove('is-sort-source', 'is-sort-target')
            );
            touch = null;
        };
        root.addEventListener('pointerdown', (e) => {
            const handle = e.target.closest('[data-studio-sort]');
            if (e.pointerType !== 'touch' || !handle) return;
            e.preventDefault();
            touch = { source: handle.parentElement, target: null };
            touch.source.classList.add('is-sort-source');
            if (e.isTrusted) handle.setPointerCapture(e.pointerId);
        });
        root.addEventListener('pointermove', (e) => {
            if (!touch) return;
            e.preventDefault();
            root.querySelector('.is-sort-target')?.classList.remove('is-sort-target');
            const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.studio-sortable');
            touch.target = target && target.parentElement === touch.source.parentElement ? target : null;
            if (touch.target !== touch.source) touch.target?.classList.add('is-sort-target');
        });
        root.addEventListener('pointerup', (e) => {
            if (!touch) return;
            e.preventDefault();
            const data = touch;
            clear();
            adminStudioSorrendCsere(data.source, data.target);
        });
        root.addEventListener('pointercancel', clear);
    });
