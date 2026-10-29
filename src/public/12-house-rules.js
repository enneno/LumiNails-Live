// The build and prerenderer inject the same versioned text used by the server.
const lumiHouseRules = /* build:house-rules */ {};
let houseRulesDialog = null;
let houseRulesReturnFocus = null;

function houseRulesSections(scope) {
    if (scope !== 'cancellation') return lumiHouseRules.sections;
    const section = lumiHouseRules.sections.find(row => row.id === lumiHouseRules.cancellation.sectionId);
    return [{ id: 'lemondas', title: 'Lemondási feltételek', paragraphs: [section.paragraphs[lumiHouseRules.cancellation.paragraphIndex]] }];
}

function houseRulesRender(container, scope = 'booking') {
    const fragment = document.createDocumentFragment();
    const isDialog = container.classList.contains('house-rules-dialog-body');
    for (const row of houseRulesSections(scope)) {
        const section = document.createElement('section');
        section.className = 'house-rules-section';
        section.id = (isDialog ? 'house-rules-dialog-' : 'hazirend-') + row.id;
        const title = document.createElement('h2');
        title.textContent = row.title;
        section.append(title);
        row.paragraphs.forEach((text, index) => {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            if (!isDialog && row.id === lumiHouseRules.cancellation.sectionId && index === lumiHouseRules.cancellation.paragraphIndex) paragraph.id = 'lemondas';
            section.append(paragraph);
        });
        fragment.append(section);
    }
    if (scope !== 'cancellation') {
        const closing = document.createElement('p');
        closing.className = 'house-rules-closing';
        closing.textContent = lumiHouseRules.closing;
        fragment.append(closing);
    }
    container.replaceChildren(fragment);
}

function houseRulesConsent(scope, id) {
    const label = document.createElement('label');
    label.className = 'house-rules-consent';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.name = scope === 'cancellation' ? 'cancellation_rules_accepted' : 'house_rules_accepted';
    checkbox.setAttribute('required', '');
    checkbox.value = lumiHouseRules.version;
    const text = document.createElement('span');
    text.append('Elolvastam és elfogadom a ');
    const link = document.createElement('a');
    link.href = scope === 'cancellation' ? '/hazirend/#lemondas' : '/hazirend/';
    link.target = '_blank';
    link.rel = 'noopener';
    link.dataset.houseRules = scope;
    link.textContent = scope === 'cancellation' ? 'lemondási feltételeket' : 'házirendet';
    text.append(link, '.');
    label.append(checkbox, text);
    return label;
}

function houseRulesOpen(scope, trigger) {
    if (!houseRulesDialog) {
        houseRulesDialog = document.createElement('dialog');
        houseRulesDialog.className = 'house-rules-dialog';
        houseRulesDialog.setAttribute('aria-labelledby', 'house-rules-dialog-title');
        const header = document.createElement('div');
        header.className = 'house-rules-dialog-header';
        const title = document.createElement('h2');
        title.id = 'house-rules-dialog-title';
        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'house-rules-close';
        close.setAttribute('aria-label', 'Házirend bezárása');
        close.textContent = '×';
        close.addEventListener('click', () => houseRulesDialog.close());
        header.append(title, close);
        const body = document.createElement('div');
        body.className = 'house-rules-dialog-body';
        houseRulesDialog.append(header, body);
        houseRulesDialog.addEventListener('close', () => {
            oldalGorgetesZarolasa('house-rules', false);
            houseRulesReturnFocus?.focus({ preventScroll: true });
            houseRulesReturnFocus = null;
        });
        houseRulesDialog.addEventListener('click', event => {
            if (event.target !== houseRulesDialog) return;
            const bounds = houseRulesDialog.getBoundingClientRect();
            if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) houseRulesDialog.close();
        });
        document.body.append(houseRulesDialog);
    }
    if (typeof houseRulesDialog.showModal !== 'function') return false;
    houseRulesDialog.querySelector('#house-rules-dialog-title').textContent = scope === 'cancellation' ? 'Lemondási feltételek' : 'Házirend';
    const content = houseRulesDialog.querySelector('.house-rules-dialog-body');
    houseRulesRender(content, scope);
    houseRulesReturnFocus = trigger;
    if (!houseRulesDialog.open) houseRulesDialog.showModal();
    content.scrollTop = 0;
    oldalGorgetesZarolasa('house-rules', true);
    return true;
}

function houseRulesMount() {
    document.querySelectorAll('[data-house-rules-page]').forEach(element => houseRulesRender(element));
    const form = document.getElementById('foglalas-urlap');
    const actions = form?.querySelector('.foglalas-kuldes-akciok');
    const existingConsent = document.getElementById('foglalas-hazirend');
    if (existingConsent && existingConsent.value !== lumiHouseRules.version) existingConsent.closest('.house-rules-consent').replaceWith(houseRulesConsent('booking', 'foglalas-hazirend'));
    else if (actions && !existingConsent) actions.before(houseRulesConsent('booking', 'foglalas-hazirend'));
    const footer = document.querySelector('.footer-oldalak');
    if (footer && !footer.querySelector('a[href="/hazirend/"]')) {
        const link = document.createElement('a');
        link.href = '/hazirend/';
        link.textContent = 'Házirend';
        footer.append(link);
    }
}

window.LumiHouseRules = Object.freeze({ version: lumiHouseRules.version, createConsent: houseRulesConsent, open: houseRulesOpen });
document.addEventListener('click', event => {
    const link = event.target.closest?.('a[data-house-rules]');
    if (link && houseRulesOpen(link.dataset.houseRules, link)) {
        event.preventDefault();
        event.stopPropagation();
    }
});
document.addEventListener('DOMContentLoaded', houseRulesMount);
document.addEventListener('lumi:tartalom-kesz', houseRulesMount);
