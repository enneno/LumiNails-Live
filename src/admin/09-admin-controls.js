    const adminStudioSelectVezerlok = new Set();
    let adminStudioVezerloFrissitesVar = false;

    document.addEventListener('DOMContentLoaded', () => {
        if(window.LumiReferenceUiActive)return;
        const root = document.getElementById('admin-tartalom');
        if (!root) return;
        adminStudioMeretAlkalmazasa();
        adminStudioMeretValaszto();
        const settings = document.getElementById('admin-panel-beallitasok');
        const theme = document.createElement('label');
        theme.className = 'admin-mezo studio-density-setting';
        theme.innerHTML =
            'Megjelenés<select data-studio-theme aria-label="Megjelenés"><option value="auto">Automatikus</option><option value="light">Világos</option><option value="dark">Sötét</option></select>';
        const choice = theme.querySelector('select');
        try {
            choice.value = localStorage.getItem('lumi-admin-theme') || 'auto';
        } catch (_) {}
        choice.addEventListener('change', () => adminV2TemaAlkalmazasa(choice.value, true));
        settings?.append(theme);
        const old = settings?.querySelector('[data-admin-v2-dark-mode]');
        if (old) old.closest('label').hidden = true;
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (choice.value === 'auto') adminV2TemaAlkalmazasa('auto');
        });
        adminV2TemaAlkalmazasa(choice.value);
        adminStudioVezerlokFrissitese();
        new MutationObserver(() => {
            if (adminStudioVezerloFrissitesVar) return;
            adminStudioVezerloFrissitesVar = true;
            requestAnimationFrame(() => {
                adminStudioVezerloFrissitesVar = false;
                adminStudioVezerlokFrissitese();
            });
        }).observe(root, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled']
        });
        root.addEventListener('input', (event) => {
            if (event.target.matches('textarea')) adminStudioSzovegMeret(event.target);
            if (event.target.matches('input[type="date"],input[type="time"],input[type="month"]')) adminStudioIdoFelirat(event.target);
        });
        root.addEventListener('change', (event) => {
            if (event.target.matches('select')) adminStudioSelectFelirat(event.target);
            if (event.target.matches('[data-foglalas-statusz]')) adminStudioStatuszJelzes(event.target.closest('.admin-foglalas-kartya'));
            if (event.target.matches('input[type="date"],input[type="time"],input[type="month"]')) adminStudioIdoFelirat(event.target);
            adminStudioMentesJelzes();
        });
        root.addEventListener('input', (event) => {
            event.target.dataset.studioChanged = 'true';
            adminStudioMentesJelzes();
        });
        root.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && event.target.matches('[data-idopont-mezo="paid_amount"]')) {
                event.preventDefault();
                event.target.blur();
            }
        });
        window.addEventListener('beforeunload', (event) => {
            if (!['foglalasok', 'szovegek', 'szolgaltatasok', 'kuponok', 'idosavok', 'tiltasok', 'beallitasok'].some(adminStudioVanPiszkozat))
                return;
            event.preventDefault();
            event.returnValue = '';
        });
    });

    function adminStudioMeretAlkalmazasa(value) {
        let size = value;
        if (!size) {
            try {
                size = localStorage.getItem('lumi-admin-size');
            } catch (_) {}
        }
        document.documentElement.dataset.adminSize = ['compact', 'normal', 'large', 'auto'].includes(size) ? size : 'compact';
        if (value) {
            try {
                localStorage.setItem('lumi-admin-size', value);
            } catch (_) {}
        }
    }

    function adminStudioMeretValaszto() {
        const panel = document.getElementById('admin-panel-beallitasok');
        if (!panel || panel.querySelector('[data-admin-size]')) return;
        const label = document.createElement('label');
        label.className = 'admin-mezo studio-density-setting';
        label.innerHTML =
            'Felület mérete<select data-admin-size aria-label="Felület mérete"><option value="compact">Kompakt</option><option value="normal">Normál</option><option value="large">Nagy</option><option value="auto">Automatikus</option></select>';
        label.querySelector('select').value = document.documentElement.dataset.adminSize;
        label.querySelector('select').addEventListener('change', (event) => adminStudioMeretAlkalmazasa(event.target.value));
        (panel.querySelector('.admin-v2-card-body') || panel).append(label);
    }

    function adminStudioVezerlokFrissitese() {
        const root = document.getElementById('admin-tartalom');
        if (!root) return;
        root.querySelectorAll('select:not([data-studio-native-select])').forEach(adminStudioSelectLetrehozas);
        root.querySelectorAll('input[type="date"],input[type="time"],input[type="month"]').forEach((input) => {
            if (!input.closest('.admin-temporal-control')) {
                const wrapper = document.createElement('span');
                wrapper.className = 'admin-temporal-control';
                const text = document.createElement('span');
                text.className = 'admin-temporal-value';
                text.setAttribute('aria-hidden', 'true');
                input.before(wrapper);
                wrapper.append(input, text);
            }
            adminStudioIdoFelirat(input);
        });
        root.querySelectorAll('textarea').forEach(adminStudioSzovegMeret);
        adminStudioRendezokFrissitese(root);
        for (const select of adminStudioSelectVezerlok) {
            if (!select.isConnected) adminStudioSelectVezerlok.delete(select);
            else adminStudioSelectFelirat(select);
        }
    }

    function adminStudioIdoFelirat(input) {
        const target = input.parentElement.querySelector('.admin-temporal-value');
        if (!target) return;
        let text = input.value;
        if (input.type === 'date' && text)
            text = new Date(text + 'T12:00:00').toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        if (input.type === 'month' && text)
            text = new Date(text + '-01T12:00:00').toLocaleDateString('hu-HU', {
                year: 'numeric',
                month: 'long'
            });
        if (!text) text = input.type === 'time' ? '--:--' : input.type === 'month' ? 'Hónap választása' : 'Dátum választása';
        if (target.textContent !== text) target.textContent = text;
        input.parentElement.classList.toggle('is-disabled', input.disabled);
    }

    function adminStudioSzovegMeret(input) {
        if (!input.isConnected || !input.getClientRects().length) return;
        input.style.height = 'auto';
        const line = parseFloat(getComputedStyle(input).lineHeight) || 20;
        input.style.height = Math.max(line * 2 + 12, Math.min(input.scrollHeight + 2, line * 8 + 16)) + 'px';
        input.style.overflowY = input.scrollHeight > line * 8 + 16 ? 'auto' : 'hidden';
    }

    function adminStudioSelectLetrehozas(select) {
        select.dataset.studioNativeSelect = 'true';
        select.hidden = true;
        select.tabIndex = -1;
        select.setAttribute('aria-hidden', 'true');
        const wrapper = document.createElement('span');
        wrapper.className = 'admin-select-control';
        select.before(wrapper);
        wrapper.append(select);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'admin-select-trigger';
        if (select.matches('[data-foglalas-statusz]')) button.classList.add('admin-select-trigger--status');
        button.setAttribute('role', 'combobox');
        button.setAttribute('aria-haspopup', 'listbox');
        button.setAttribute('aria-expanded', 'false');
        const id = select.id || 'admin-select-' + Math.random().toString(36).slice(2);
        const popup = document.createElement('div');
        popup.className = 'admin-select-popup';
        popup.id = id + '-options';
        popup.setAttribute('popover', 'auto');
        popup.setAttribute('role', 'listbox');
        button.setAttribute('aria-controls', popup.id);
        const label = select.getAttribute('aria-label') || select.closest('label')?.childNodes[0]?.textContent.trim() || 'Választás';
        button.setAttribute('aria-label', label);
        wrapper.append(button, popup);
        select._studioSelect = { button, popup };
        adminStudioSelectVezerlok.add(select);
        const open = () => {
            if (select.disabled) return;
            popup.replaceChildren();
            for (const option of select.options) {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'admin-select-option';
                item.setAttribute('role', 'option');
                item.setAttribute('aria-selected', String(option.selected));
                item.textContent = option.label;
                item.disabled = option.disabled;
                item.addEventListener('click', () => {
                    select.value = option.value;
                    select.dispatchEvent(new Event('input', { bubbles: true }));
                    select.dispatchEvent(new Event('change', { bubbles: true }));
                    popup.hidePopover();
                    button.focus();
                });
                popup.append(item);
            }
            const rect = button.getBoundingClientRect();
            const width = Math.min(Math.max(rect.width, 160), innerWidth - 24);
            popup.style.width = width + 'px';
            popup.style.left = Math.max(12, Math.min(rect.left, innerWidth - width - 12)) + 'px';
            popup.style.top = Math.min(rect.bottom + 5, innerHeight - 100) + 'px';
            popup.style.maxHeight = Math.max(80, Math.min(280, innerHeight - rect.bottom - 16)) + 'px';
            popup.showPopover();
            button.setAttribute('aria-expanded', 'true');
            (popup.querySelector('[aria-selected="true"]:not(:disabled)') || popup.querySelector('button:not(:disabled)'))?.focus({
                preventScroll: true
            });
        };
        button.addEventListener('click', () => (popup.matches(':popover-open') ? popup.hidePopover() : open()));
        button.addEventListener('keydown', (event) => {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
                event.preventDefault();
                open();
            }
        });
        popup.addEventListener('toggle', () => button.setAttribute('aria-expanded', String(popup.matches(':popover-open'))));
        popup.addEventListener('keydown', (event) => {
            const options = Array.from(popup.querySelectorAll('button:not(:disabled)'));
            const index = options.indexOf(document.activeElement);
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
                event.preventDefault();
                const next =
                    event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? options.length - 1
                          : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
                options[next]?.focus();
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                popup.hidePopover();
                button.focus();
            }
            if (event.key === 'Tab') popup.hidePopover();
        });
        adminStudioSelectFelirat(select);
    }

    function adminStudioSelectFelirat(select) {
        const ui = select._studioSelect;
        if (!ui) return;
        const text = select.selectedOptions[0]?.label || 'Választás';
        if (ui.button.textContent !== text) ui.button.textContent = text;
        if (ui.button.disabled !== select.disabled) ui.button.disabled = select.disabled;
        ui.button.setAttribute(
            'aria-label',
            (select.getAttribute('aria-label') || select.closest('label')?.childNodes[0]?.textContent.trim() || 'Választás') + ': ' + text
        );
    }

    function adminStudioMezoModosult(input) {
        if (
            input.matches('[data-admin-size],[data-studio-theme],[data-admin-v2-dark-mode],input[type="search"],[data-studio-filter]') ||
            input.closest('.admin-kereses-mezo,.admin-oldalmeret,.studio-revenue-picker,.studio-section-heading')
        )
            return false;
        if (input.type === 'checkbox' || input.type === 'radio') return input.checked !== input.defaultChecked;
        if (input.tagName === 'SELECT') {
            const original = Array.from(input.options).find((option) => option.defaultSelected) || input.options[0];
            return String(input.value) !== String(original?.value || '');
        }
        return input.value !== input.defaultValue;
    }

    function adminStudioVanPiszkozat(tab = allapot.aktivTab) {
        if (tab === 'szovegek') return Boolean(window.LumiAdminCms?.isDirty());
        const panel = document.getElementById('admin-panel-' + tab);
        if (!panel) return false;
        if (tab === 'foglalasok')
            return Array.from(adminStudioFoglalasKartyak.values()).some((card) => {
                const paid = fizetettOsszegAdatok(card);
                return (
                    !paid.hiba &&
                    foglalasKartyaModosult(card, {
                        status: card.querySelector('[data-foglalas-statusz]')?.value,
                        paid_amount: paid.ertek,
                        reason: idopontMezo(card, 'reason')?.value
                    })
                );
            });
        return (
            (tab === 'idosavok' && allapot.naptarKijelolesek.size > 0) ||
            Array.from(panel.querySelectorAll('[data-studio-changed]')).some(adminStudioMezoModosult) ||
            Boolean(panel.querySelector('[data-draft-new],[data-draft-delete],[data-studio-sort-dirty]'))
        );
    }

    function adminStudioMentesJelzes() {
        const button = document.querySelector('[data-studio-save]');
        if (!button) return;
        button.classList.toggle('has-draft', adminStudioVanPiszkozat());
        if (allapot.aktivTab === 'foglalasok') button.hidden = !adminStudioVanPiszkozat();
        button.setAttribute('aria-label', adminStudioVanPiszkozat() ? 'Mentetlen módosítások mentése' : 'Mentés');
    }

    function adminStudioStatuszJelzes(card) {
        if (!card) return;
        const select = card.querySelector('[data-foglalas-statusz]');
        if (!select) return;
        let tag = card.querySelector('.studio-booking-draft');
        if (!tag) {
            tag = document.createElement('small');
            tag.className = 'studio-booking-draft';
            card.querySelector('.studio-booking-meta')?.append(tag);
        }
        tag.textContent = select.value !== card.dataset.eredetiStatusz ? 'Mentésre vár' : '';
        tag.hidden = !tag.textContent;
        adminStudioSelectFelirat(select);
        adminStudioMentesJelzes();
    }
