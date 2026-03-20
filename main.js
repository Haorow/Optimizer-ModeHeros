const REPO = 'Haorow/Optimizer';

/* ===== HAMBURGER ===== */
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('mainNav');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mainNav.classList.toggle('open');
});

function closeMenu() {
    hamburger.classList.remove('open');
    mainNav.classList.remove('open');
}

/* ===== SCROLL ===== */
// Sections pour le snapping et la restauration
const sections = [
    document.getElementById('hero'),
    document.getElementById('features'),
    document.getElementById('points-forts'),
    document.getElementById('download'),
    document.getElementById('tutorial'),
    document.getElementById('faq'),
    document.getElementById('contact'),
].filter(Boolean);

// Smooth scroll sur les ancres — sans hash dans l'URL (évite le scroll auto au rechargement)
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
    });
});

// Restauration de scroll : index de section (pas pixels bruts — évite la dérive)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

let saveTimer = null;
window.addEventListener('scroll', () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        sessionStorage.setItem('scrollY', window.scrollY);
    }, 150);
}, { passive: true });

window.addEventListener('load', () => {
    const navType = performance.getEntriesByType('navigation')[0]?.type;
    const saved   = parseInt(sessionStorage.getItem('scrollY') ?? '0', 10);
    if (navType === 'reload' && saved > 0) {
        window.scrollTo(0, saved);
    } else {
        window.scrollTo(0, 0);
        sessionStorage.removeItem('scrollY');
    }
    // Fade-out de l'overlay après restauration du scroll
    const overlay = document.getElementById('page-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 500);
    }
    // Snapping activé après la restauration
    setTimeout(() => { snapEnabled = true; }, 600);
});

// Snap JS : après 220 ms d'inactivité, colle à la section la plus proche
let snapEnabled = false;
let snapTimer   = null;
window.addEventListener('scroll', () => {
    if (!snapEnabled) return;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(() => {
        const vh = window.innerHeight;
        let closest = null, minDist = Infinity;
        sections.forEach(el => {
            const dist = Math.abs(el.getBoundingClientRect().top);
            if (dist < minDist) { minDist = dist; closest = el; }
        });
        if (closest && minDist > 8 && minDist < vh * 0.2) {
            closest.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 220);
}, { passive: true });

/* ===== NAV SCROLLED ===== */
function updateNavState() {
    const nearTop = sections.some(el => Math.abs(el.getBoundingClientRect().top) < 32);
    mainNav.classList.toggle('scrolled', !nearTop);
}

window.addEventListener('scroll', updateNavState, { passive: true });
updateNavState();

/* ===== CAROUSEL ===== */
let slide = 0;
const track = document.getElementById('carouselTrack');
const dots  = document.querySelectorAll('.cdot');
const GAP   = 16; // doit correspondre au gap CSS du carousel-track

function goTo(i) {
    slide = i;
    const cardW = track.firstElementChild.offsetWidth;
    track.style.transform = `translateX(-${i * (cardW + GAP)}px)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
}
dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.i)));

// Touch swipe
let tx = 0;
track.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
track.addEventListener('touchend', e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 45) {
        if (dx > 0 && slide < 3) goTo(slide + 1);
        if (dx < 0 && slide > 0) goTo(slide - 1);
    }
}, { passive: true });

/* ===== REVEAL ON SCROLL ===== */
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ===== TUTORIAL TABS ===== */
const tutTabs   = document.querySelectorAll('.tut-tab');
const tutPanels = document.querySelectorAll('.tut-panel');
const tutPrev   = document.querySelector('.tut-prev');
const tutNext   = document.querySelector('.tut-next');
let tutCurrent  = 0;

function setTutTab(index, scroll = true) {
    tutCurrent = index;
    tutTabs.forEach((t, i) => t.classList.toggle('active', i === index));
    tutPanels.forEach((p, i) => p.classList.toggle('active', i === index));
    // État des boutons prev/next
    tutPrev.disabled = index === 0;
    tutNext.disabled = index === tutTabs.length - 1;
    // Scroll de l'onglet actif dans la zone visible (sauf à l'init)
    if (scroll) tutTabs[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}

tutTabs.forEach((tab, i) => tab.addEventListener('click', () => setTutTab(i)));
tutPrev.addEventListener('click', () => { if (tutCurrent > 0) setTutTab(tutCurrent - 1); });
tutNext.addEventListener('click', () => { if (tutCurrent < tutTabs.length - 1) setTutTab(tutCurrent + 1); });

// Init : désactiver prev au départ (premier onglet actif) — sans scroll
setTutTab(0, false);

/* ===== FAQ ===== */
const faqTabs   = document.querySelectorAll('.faq-tab');
const faqPanels = document.querySelectorAll('.faq-panel');

// Changement d'onglet catégorie
function setFaqTab(index) {
    faqTabs.forEach((t, i)   => t.classList.toggle('active', i === index));
    faqPanels.forEach((p, i) => p.classList.toggle('active', i === index));
    // Fermer tous les items accordion au changement d'onglet
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    // Scroll de l'onglet dans le carousel
    faqTabs[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}
faqTabs.forEach((tab, i) => tab.addEventListener('click', () => setFaqTab(i)));

// Accordion — une seule entrée ouverte à la fois
document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
        const item    = btn.closest('.faq-item');
        const isOpen  = item.classList.contains('open');
        // Fermer tous les items du panel actif
        item.closest('.faq-panel').querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
        // Ouvrir celui cliqué (sauf s'il était déjà ouvert)
        if (!isOpen) item.classList.add('open');
    });
});

/* ===== CONTACT FORM ===== */
const contactForm  = document.getElementById('contactForm');
const formSuccess  = document.getElementById('formSuccess');
const replyCheck  = document.getElementById('contact-reply');
const emailField  = document.getElementById('contact-email');

contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;

    // Champs toujours requis (motif, sujet, message)
    ['contact-motif', 'contact-sujet', 'contact-message'].forEach(id => {
        const field = document.getElementById(id);
        const wrap  = field.closest('.form-select-wrap') ?? field;
        if (!field.value.trim()) {
            wrap.classList.add('error');
            valid = false;
        } else {
            wrap.classList.remove('error');
        }
    });

    // Email requis seulement si checkbox cochée
    if (replyCheck.checked) {
        if (!emailField.value.trim()) {
            emailField.classList.add('error');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
            emailField.classList.add('error');
            valid = false;
        } else {
            emailField.classList.remove('error');
        }
    } else {
        emailField.classList.remove('error');
    }

    if (!valid) return;

    // Envoi via Formspree
    try {
        const res = await fetch(contactForm.action, {
            method: 'POST',
            body: new FormData(contactForm),
            headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
            contactForm.querySelectorAll('input, select, textarea, button').forEach(el => el.disabled = true);
            formSuccess.hidden = false;
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            alert('Une erreur est survenue, merci de réessayer.');
        }
    } catch {
        alert('Impossible d\'envoyer le message. Vérifie ta connexion.');
    }
});

// Retirer l'erreur à la saisie
contactForm.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('input', () => {
        field.classList.remove('error');
        const wrap = field.closest('.form-select-wrap');
        if (wrap) wrap.classList.remove('error');
    });
});

(async () => {
    try {
        const res      = await fetch(`https://api.github.com/repos/${REPO}/releases`);
        const releases = await res.json();
        if (!Array.isArray(releases) || !releases.length) return;

        // Version la plus récente
        const latest  = releases[0];
        const version = latest.tag_name ?? 'v1.0.0';
        document.querySelectorAll('#hero-version, #footer-version').forEach(el => {
            el.textContent = version;
        });

        // Lien de téléchargement direct vers le .zip de la dernière release
        const zipAsset = latest.assets.find(a => a.name.endsWith('.zip'));
        if (zipAsset) {
            document.getElementById('download-btn').href = zipAsset.browser_download_url;
        }

        // Total téléchargements (toutes releases, tous assets)
        let total = 0;
        releases.forEach(r => r.assets.forEach(a => total += a.download_count));
        const dlEl = document.getElementById('dl-count');
        if (dlEl) dlEl.textContent = total.toLocaleString('fr-FR');

    } catch (err) {
        // API indisponible : on masque le badge silencieusement
        const badge = document.querySelector('.dl-badge');
        if (badge) badge.style.display = 'none';
        console.warn('GitHub API:', err);
    }
})();

/* ===== LIGHTBOX — images du guide d'utilisation (mobile) ===== */
const lightbox    = document.createElement('div');
lightbox.className = 'lightbox-overlay';
const lbImg        = document.createElement('img');
lightbox.appendChild(lbImg);
document.body.appendChild(lightbox);

document.querySelectorAll('.tut-visual img').forEach(img => {
    img.addEventListener('click', () => {
        if (window.innerWidth >= 1024) return; // desktop : pas de lightbox
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
});

lightbox.addEventListener('click', () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
});

/* ===== PANNEAU LÉGAL ===== */
const legalPanel     = document.getElementById('legalPanel');
const legalPanelTitle = document.getElementById('legalPanelTitle');
const legalPanelBody  = document.getElementById('legalPanelBody');
const legalPanelClose = document.getElementById('legalPanelClose');

const LEGAL_CONTENT = {
    mentions: {
        title: 'Mentions légales',
        html: `
            <h2>Éditeur</h2>
            <p>Ce site est édité par <strong>Haorow</strong>, à titre personnel.</p>
            <p>Contact : via le <a href="#contact">formulaire de contact</a> du site.</p>

            <h2>Hébergeur</h2>
            <p>GitHub Pages — GitHub, Inc. (Microsoft)<br>88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis</p>

            <h2>Propriété intellectuelle</h2>
            <p>Dofus est un MMORPG édité par Ankama Games. Optimizer est un projet non-officiel sans aucun lien avec Ankama. Certaines illustrations présentes sur ce site sont la propriété d'Ankama Studio — tous droits réservés.</p>
            <p>Le code source d'Optimizer est distribué librement sous licence <a href="https://github.com/Haorow/Optimizer/blob/master/LICENSE" target="_blank" rel="noopener">GPL v3</a>.</p>
        `
    },
    confidentialite: {
        title: 'Politique de confidentialité',
        html: `
            <h2>Données collectées</h2>
            <p>Le seul traitement de données personnelles sur ce site s'effectue via le formulaire de contact. Les informations saisies (sujet, message, et adresse e-mail si renseignée) sont transmises à <strong>Formspree</strong>, qui les achemine vers l'adresse e-mail de l'éditeur. Formspree est soumis à sa propre <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noopener">politique de confidentialité</a>.</p>

            <h2>Cookies et traceurs</h2>
            <p>Ce site n'utilise aucun cookie et aucun outil de suivi analytique. Une donnée temporaire (position de défilement) est stockée dans la mémoire de session du navigateur (<em>sessionStorage</em>) et supprimée automatiquement à la fermeture de l'onglet.</p>

            <h2>Vos droits</h2>
            <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour l'exercer, contactez l'éditeur via le <a href="#contact">formulaire de contact</a>.</p>
        `
    }
};

let currentLegalPanel = null;

function openLegalPanel(key) {
    const content = LEGAL_CONTENT[key];
    if (!content) return;
    legalPanelTitle.textContent = content.title;
    legalPanelBody.innerHTML    = content.html;
    legalPanel.classList.add('open');
    legalPanel.setAttribute('aria-hidden', 'false');
    legalPanel.removeAttribute('inert');
    currentLegalPanel = key;
}

function closeLegalPanel() {
    legalPanel.classList.remove('open');
    legalPanel.setAttribute('aria-hidden', 'true');
    legalPanel.setAttribute('inert', '');
    currentLegalPanel = null;
}

document.querySelectorAll('.legal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentLegalPanel === btn.dataset.panel) {
            closeLegalPanel();
        } else {
            openLegalPanel(btn.dataset.panel);
        }
    });
});
legalPanelClose.addEventListener('click', closeLegalPanel);

// Liens internes (#contact etc.) dans le panneau légal : fermer le panneau puis scroller
legalPanelBody.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    e.preventDefault();
    const targetId = link.getAttribute('href').slice(1);
    closeLegalPanel();
    setTimeout(() => {
        const target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    }, 420);
});