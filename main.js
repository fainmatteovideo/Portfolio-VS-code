/* Matteo Fain – fainmatteo.com */
(function () {
  "use strict";

  /* --- Un solo ciclo per scroll e ridimensionamento ------------------------ */
  // Tutti gli effetti legati allo scroll si aggiornano insieme, una volta per fotogramma.
  const frameTasks = [];
  let frameQueued = false;
  function onFrame(task) { frameTasks.push(task); task(); }
  function queueFrame() {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(() => { frameQueued = false; frameTasks.forEach((t) => t()); });
  }
  window.addEventListener("scroll", queueFrame, { passive: true });
  window.addEventListener("resize", queueFrame);

  /* --- Anno nel footer ---------------------------------------------------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* --- Menu: fondo leggero quando si lascia l'apertura ------------------- */
  const nav = document.getElementById("site-nav");
  const hero = document.getElementById("top");

  new IntersectionObserver(([entry]) => {
    nav.classList.toggle("is-scrolled", !entry.isIntersecting);
  }, { rootMargin: "-80px 0px 0px 0px" }).observe(hero);

  /* --- Menu mobile ------------------------------------------------------- */
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");

  const navdrop = document.getElementById("navdrop");
  const navLabel = navdrop.querySelector(".navdrop__label");
  // con mouse e schermo largo: tendina; altrimenti menu a tutto schermo
  const dropMQ = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
  let currentLabel = "Menu";

  function setLabel(text) {
    if (text === navLabel.textContent) return;
    navLabel.classList.remove("is-rolling");
    void navLabel.offsetWidth; // riavvia l'animazione
    navLabel.textContent = text;
    navLabel.classList.add("is-rolling");
  }

  function setDrop(open) {
    navdrop.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-menu-open", open);
    setLabel(open ? "Close" : currentLabel);
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => { menu.hidden = true; }, 400);
    }
  }

  toggle.addEventListener("click", () => {
    if (dropMQ.matches) setDrop(!navdrop.classList.contains("is-open"));
    else setMenu(menu.hidden);
  });
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!menu.hidden) setMenu(false);
    if (navdrop.classList.contains("is-open")) { setDrop(false); toggle.focus(); }
  });
  // la tendina si chiude dopo la scelta (e resta chiusa finché il mouse non esce)
  navdrop.addEventListener("click", (e) => {
    if (!e.target.closest(".navdrop__panel a")) return;
    setDrop(false);
    navdrop.classList.add("is-chosen");
    document.activeElement.blur();
  });
  navdrop.addEventListener("mouseleave", () => { navdrop.classList.remove("is-chosen"); setDrop(false); });
  document.addEventListener("click", (e) => { if (!navdrop.contains(e.target)) setDrop(false); });

  /* --- Link interni: scorrono alla posizione vera della sezione ------------ */
  // Lavori e pannello rosso restano fermi (sticky) durante le transizioni: il browser
  // calcolerebbe la destinazione dalla loro posizione del momento. Qui la misuro senza sticky.
  function sectionY(el) {
    const root = document.documentElement;
    root.classList.add("is-measuring");
    const y = el.getBoundingClientRect().top + window.scrollY;
    root.classList.remove("is-measuring");
    return y - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    const id = a.getAttribute("href").slice(1);
    const target = id === "top" ? document.body : document.getElementById(id);
    if (!target || (data && data.categories.some((c) => c.id === id))) return; // i filtri usano l'hash
    e.preventDefault();
    const y = id === "top" ? 0 : sectionY(target);
    window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
  });

  /* --- Link attivo in base alla sezione visibile ------------------------- */
  const links = [...document.querySelectorAll(".site-nav__links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  // attiva l'ultima sezione il cui inizio ha superato il terzo superiore dello schermo
  // (funziona anche per sezioni basse come la fascia dei loghi)
  function updateActive() {
    const line = window.innerHeight * 0.35;
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= line) current = s; });
    // in fondo alla pagina l'ultima sezione (Contact) non arriva in alto: la attivo comunque
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    links.forEach((a) => a.classList.toggle("is-active", !!current && a.getAttribute("href") === "#" + current.id));
    // nella pillola: il nome della sezione corrente
    const link = current && links.find((a) => a.getAttribute("href") === "#" + current.id);
    currentLabel = link ? link.textContent.trim() : "Menu";
    if (menu.hidden) setLabel(currentLabel);
  }
  onFrame(updateActive);

  /* --- Showreel: compare in dissolvenza quando parte davvero -------------- */
  const heroVideo = document.querySelector(".hero__video");
  const heroIframe = heroVideo && heroVideo.querySelector("iframe");

  // Il video resta nascosto finché non scorre davvero (niente spinner di Vimeo):
  // se Vimeo non risponde, restano il muro da studio e il logo.
  window.addEventListener("load", () => {
    if (!heroIframe || !window.Vimeo) return;
    const player = new Vimeo.Player(heroIframe);
    player.on("timeupdate", function reveal(data) {
      if (data.seconds > 0.1) {
        heroVideo.classList.add("is-playing");
        player.off("timeupdate", reveal);
      }
    });

    // fuori dallo schermo lo showreel si mette in pausa
    new IntersectionObserver(([entry]) => {
      (entry.isIntersecting ? player.play() : player.pause()).catch(() => {});
    }).observe(heroVideo);
  });

  /* ======================================================================
     Lavori (generati da projects.json)
     ====================================================================== */
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const work = document.getElementById("work");
  const list = document.getElementById("work-list");
  const intro = document.getElementById("work-intro");
  const filterList = document.querySelector(".filters__list");

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // pulsante audio: 4 barre ferme con audio spento, in movimento con audio acceso
  const SOUND = '<button class="video__sound" type="button" aria-label="Turn sound on" aria-pressed="false"><i><b></b><b></b><b></b><b></b></i></button>';
  const ARROW = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="${d}"/></svg>`;

  function videoHTML(id, hash, title, poster) {
    return `<div class="video" data-vimeo="${esc(id)}" data-hash="${esc(hash || "")}" data-title="${esc(title)}">
              <button class="video__open" type="button" aria-label="${esc(title)}: open the video with sound"></button>
              ${poster ? `<img class="video__poster" data-src="${esc(poster)}"${poster.startsWith("assets/posters/")
                ? ` data-srcset="${esc(poster.replace(".webp", "-800.webp"))} 800w, ${esc(poster)} 1600w" sizes="(max-width: 1023px) 100vw, 1000px"` : ""}
                alt="" decoding="async">` : ""}
              ${SOUND}
            </div>`;
  }

  function projectHTML(p) {
    const credits = p.credits.map((c) => {
      const i = c.indexOf(":");
      return i > 0
        ? `<li><span>${esc(c.slice(0, i))}</span>${esc(c.slice(i + 1).trim())}</li>`
        : `<li>${esc(c)}</li>`;
    }).join("");
    const logos = p.logos.map((l) =>
      `<img data-src="${esc(l.src)}" alt="${esc(l.alt)}" decoding="async">`).join("");

    return `<article class="project slide" data-category="${esc(p.category)}" data-name="${esc(p.title)}" id="project-${esc(p.id)}">
      ${videoHTML(p.vimeo, "", p.title, p.thumbnail)}
      <div class="project__meta">
        <div class="project__head">
          <span class="project__num slide__num label"></span>
          <h3 class="project__title">${esc(p.title)}</h3>
          ${p.subtitle ? `<p class="project__subtitle">${esc(p.subtitle)}</p>` : ""}
          ${logos ? `<div class="project__logos">${logos}</div>` : ""}
        </div>
        <ul class="project__credits">${credits}</ul>
      </div>
    </article>`;
  }

  // Reel come slide dello showcase (dopo i progetti della stessa categoria): una pagina con
  // tutti gli orizzontali e una con tutti i verticali. Colonne e file dipendono da quanti sono.
  function reelSlidesHTML(reels, categories) {
    const slide = (category, group, name, items, kind) => {
      const n = items.length;
      const many = kind === "h" ? n > 8 : n > 6;
      const cols = kind === "h" ? [many ? 3 : 2, many ? 5 : 4] : [many ? 4 : 3, many ? 8 : 5];
      return `<article class="slide slide--reels" data-category="${esc(category)}" data-group="${group}" data-name="${name}">
        <p class="slide__num label"></p>
        <div class="slide__grid slide__grid--${kind}" style="--cm:${cols[0]};--cd:${cols[1]};--rd:${Math.ceil(n / cols[1])}">
          ${items.map((r) => videoHTML(r.vimeo, r.hash, r.label, r.poster)).join("")}
        </div>
      </article>`;
    };
    return categories.map(({ id: category }) => {
      const of = (o) => reels.filter((r) => r.category === category && r.orientation === o);
      const h = of("horizontal");
      const v = of("vertical");
      return (h.length ? slide(category, "16:9", "Horizontal reels", h, "h") : "") +
        (v.length ? slide(category, "9:16", "Vertical reels", v, "v") : "");
    }).join("");
  }

  /* --- Loghi: stessa altezza "visiva" a prescindere dalle proporzioni ----- */
  // Un logo molto largo con la stessa altezza di uno quadrato sembra enorme:
  // l'altezza scala con la radice delle proporzioni.
  function sizeLogo(img, base, maxFactor = 1.5) {
    const apply = () => {
      const ratio = img.naturalWidth / img.naturalHeight || 1;
      img.style.height = Math.round(Math.min(base * maxFactor, Math.max(base * 0.45, base / Math.sqrt(ratio)))) + "px";
    };
    img.complete && img.naturalWidth ? apply() : img.addEventListener("load", apply, { once: true });
  }

  /* --- Video: caricamento pigro, play/pausa allo scroll, audio al click --- */
  // Tutti i video stanno nello showcase: suona solo la slide attiva (vedi syncPlayback)
  let showcaseInView = false;
  let workCovered = false; // il pannello di Services copre del tutto i lavori
  const videos = new Map(); // elemento .video -> { player, visible }

  // I video dei progetti non partono finché la pagina (e lo showreel) non ha finito di
  // caricarsi: così non rubano banda all'apertura. Un click li carica comunque subito.
  let pageReady = false;
  const pending = new Set();
  window.addEventListener("load", () => setTimeout(() => {
    pageReady = true;
    pending.forEach((el) => loadVideo(el));
    pending.clear();
  }, 1200));

  function loadVideo(el, force = false) {
    if (videos.has(el) || !window.Vimeo) return;
    if (!pageReady && !force) { pending.add(el); return; }
    const hash = el.dataset.hash ? `h=${el.dataset.hash}&` : "";
    const iframe = document.createElement("iframe");
    iframe.src = `https://player.vimeo.com/video/${el.dataset.vimeo}?${hash}background=1&autoplay=1&loop=1&muted=1&autopause=0&playsinline=1&dnt=1`;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.title = el.dataset.title;
    iframe.tabIndex = -1;
    el.prepend(iframe);

    const visible = !!el.closest(".slide.is-active") && showcaseInView && !workCovered && modal.hidden;
    const state = { player: new Vimeo.Player(iframe), visible };
    videos.set(el, state);
    state.player.on("timeupdate", function reveal(d) {
      if (d.seconds > 0.1) { el.classList.add("is-playing"); state.player.off("timeupdate", reveal); }
    });
    // con background=1 il video parte da solo: se intanto è uscito dallo schermo, lo fermo
    state.player.on("play", () => { if (!state.visible) state.player.pause().catch(() => {}); });
  }

  /* --- Player completo: al click il video si apre con audio e controlli ---- */
  const modal = document.createElement("div");
  modal.className = "player-modal";
  modal.hidden = true;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", "Video player");
  modal.innerHTML = `<button class="player-modal__close label" type="button">Close
      <svg class="arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6"/></svg></button>
    <div class="player-modal__frame"></div>`;
  document.body.appendChild(modal);
  const modalFrame = modal.querySelector(".player-modal__frame");
  let lastFocus = null;

  // Animazione "FLIP": il riquadro del player parte esattamente da dove sta il video
  // nella pagina e si allarga fino alla sua posizione finale (o il contrario in chiusura)
  let openedFrom = null;
  function flip(el, opening) {
    if (reducedMotion) return;
    const from = el.getBoundingClientRect();
    modalFrame.style.transition = "none";
    modalFrame.style.transform = "";
    const to = modalFrame.getBoundingClientRect();
    const t = `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})`;
    if (opening) {
      modalFrame.style.transform = t;
      modalFrame.getBoundingClientRect(); // applica subito la posizione di partenza
      modalFrame.style.transition = "";
      modalFrame.style.transform = "";
    } else {
      modalFrame.style.transition = "";
      modalFrame.style.transform = t;
    }
  }

  function openPlayer(el) {
    const hash = el.dataset.hash ? `h=${el.dataset.hash}&` : "";
    const title = el.dataset.title;
    modalFrame.classList.toggle("is-vertical", !!el.closest(".reels__grid--vertical, .slide__grid--v"));
    // la miniatura fa da sfondo al riquadro mentre il player si carica (continuità visiva)
    const poster = el.querySelector(".video__poster");
    modalFrame.style.backgroundImage = poster ? `url("${poster.currentSrc || poster.src}")` : "";
    openedFrom = el;
    modalFrame.innerHTML = `<iframe src="https://player.vimeo.com/video/${el.dataset.vimeo}?${hash}autoplay=1&title=0&byline=0&portrait=0&playsinline=1&dnt=1"
      allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${esc(title)}"></iframe>`;
    // i video di sfondo si fermano mentre il player è aperto
    videos.forEach((state, v) => { state.player.pause().catch(() => {}); setSound(v, false); });
    lastFocus = document.activeElement;
    modal.hidden = false;
    flip(el, true);
    requestAnimationFrame(() => modal.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    modal.querySelector(".player-modal__close").focus();
  }

  function closePlayer() {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    if (openedFrom && document.body.contains(openedFrom)) flip(openedFrom, false);
    setTimeout(() => { modal.hidden = true; modalFrame.innerHTML = ""; modalFrame.style.transform = ""; }, 550);
    videos.forEach((state) => { if (state.visible) state.player.play().catch(() => {}); });
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".player-modal__close")) closePlayer();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePlayer(); });

  // immagini pigre: data-src (e data-srcset) diventano src quando servono
  function loadImages(root) {
    root.querySelectorAll("img[data-src]").forEach((img) => {
      img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
      if (img.dataset.srcset) { img.srcset = img.dataset.srcset; img.removeAttribute("data-srcset"); }
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    });
  }

  /* --- Audio sul posto: il pulsante con le barre accende/spegne l'audio ---- */
  function setSound(el, on) {
    el.classList.toggle("is-unmuted", on);
    const btn = el.querySelector(".video__sound");
    if (btn) {
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
    }
    const state = videos.get(el);
    if (!state) return;
    state.player.setVolume(on ? 1 : 0).catch(() => {});
    state.player.setMuted(!on).catch(() => {});
  }

  function toggleSound(el) {
    loadVideo(el, true);
    const on = !el.classList.contains("is-unmuted");
    if (on) videos.forEach((_, other) => { if (other !== el) setSound(other, false); });
    setSound(el, on);
    if (on) videos.get(el)?.player.play().catch(() => {});
  }

  // Comparsa morbida
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  // servizi, step, about…
  document.querySelectorAll(".reveal").forEach((el) => reducedMotion ? el.classList.add("is-visible") : revealObserver.observe(el));

  // Social: il reel ingrandito dalla lente cresce verso l'interno della griglia (non esce dai bordi)
  work.addEventListener("pointerover", (e) => {
    const v = e.target.closest('.slide[data-category="social"] .slide__grid .video');
    if (!v || e.pointerType !== "mouse") return;
    const g = v.parentElement.getBoundingClientRect();
    const r = v.getBoundingClientRect();
    const edge = (a, b) => (a < 8 ? "0%" : b < 8 ? "100%" : "50%");
    v.style.transformOrigin = `${edge(r.left - g.left, g.right - r.right)} ${edge(r.top - g.top, g.bottom - r.bottom)}`;
  });

  // Click sul pulsante con le barre = audio sul posto; click sul resto del video = player completo
  work.addEventListener("click", (e) => {
    const v = e.target.closest(".video");
    if (!v) return;
    if (e.target.closest(".video__sound")) toggleSound(v);
    else openPlayer(v);
  });

  /* --- Showcase dei lavori ----------------------------------------------- */
  // Desktop (da 1024 px): la sezione resta ferma e scorrendo la pagina cambia il progetto,
  // con i pallini verticali a sinistra. Telefono e tablet: i progetti scorrono in orizzontale
  // con lo swipe, pallini in orizzontale.
  const desktopMQ = window.matchMedia("(min-width: 1024px)");
  // scorrimento per slide, in altezze di schermo (più corto quando le slide sono tante)
  const stepFor = (n) => (n > 8 ? 0.5 : 0.8);
  let showcase = null, stage = null, dotsNav = null, items = [], activeIndex = -1;
  let stageTop = 0, stageH = 0;

  function setupShowcase() {
    showcase = list.querySelector(".showcase");
    stage = list.querySelector(".showcase__stage");
    dotsNav = list.querySelector(".showcase__dots");

    dotsNav.addEventListener("click", (e) => {
      const dot = e.target.closest(".showcase__dot");
      if (dot) goToProject(Number(dot.dataset.index));
    });
    stage.addEventListener("scroll", () => {
      if (desktopMQ.matches) return;
      const i = items.findIndex((p) => Math.abs(p.offsetLeft - stage.scrollLeft) < stage.clientWidth / 2);
      setActive(i);
    }, { passive: true });

    onFrame(updateFromScroll);
    // desktop: quando lo scroll si ferma a metà fra due progetti, la pagina si assesta
    // dolcemente sul progetto più vicino (niente slide "a metà")
    let settleTimer = 0, settling = false;
    window.addEventListener("scroll", () => {
      clearTimeout(settleTimer);
      if (settling || reducedMotion || !desktopMQ.matches || items.length < 2) return;
      settleTimer = setTimeout(settle, 220);
    }, { passive: true });
    function settle() {
      const total = list.offsetHeight - stageH;
      const listTop = list.getBoundingClientRect().top + window.scrollY - stageTop;
      const y = window.scrollY - listTop;
      if (y <= 0 || y >= total) return; // fuori dallo showcase
      const slot = total / items.length;
      const target = listTop + (Math.min(items.length - 1, Math.floor(y / slot)) + 0.5) * slot;
      if (Math.abs(target - window.scrollY) < 4 || Math.abs(target - window.scrollY) > slot * 0.45) return;
      settling = true;
      window.scrollTo({ top: target, behavior: "smooth" });
      setTimeout(() => { settling = false; }, 700);
    }
    window.addEventListener("resize", layoutShowcase);
    desktopMQ.addEventListener("change", () => { layoutShowcase(); activeIndex = -1; setActive(0); updateFromScroll(); });

    // video in pausa quando lo showcase non è sullo schermo
    new IntersectionObserver(([e]) => { showcaseInView = e.isIntersecting; syncPlayback(); }, { threshold: 0.2 }).observe(showcase);
  }

  function buildShowcase() {
    items = [...stage.querySelectorAll(".slide:not([hidden])")];
    list.hidden = items.length === 0;
    // numerazione e pallini per gruppo (progetti, reel 16:9, reel 9:16)
    const groups = {};
    items.forEach((p) => { const g = p.dataset.group || ""; (groups[g] = groups[g] || []).push(p); });
    const pad = (x) => String(x).padStart(2, "0");
    dotsNav.innerHTML = items.map((p, i) => {
      const g = p.dataset.group || "";
      const k = groups[g].indexOf(p);
      const count = groups[g].length > 1 ? `${pad(k + 1)} / ${pad(groups[g].length)}` : "";
      p.querySelector(".slide__num").textContent = [g, count].filter(Boolean).join(" — ");
      const cls = g === "9:16" ? " showcase__dot--tall" : "";
      const first = k === 0 && i > 0 ? " is-group-start" : "";
      return `<button class="showcase__dot${cls}${first}" type="button" data-index="${i}" aria-label="${esc(p.dataset.name)} (${i + 1} of ${items.length})"></button>`;
    }).join("");
    stage.scrollLeft = 0;
    if (slideResize) { slideResize.disconnect(); items.forEach((p) => slideResize.observe(p)); }
    layoutShowcase();
    activeIndex = -1;
    setActive(0);
  }

  function layoutShowcase() {
    if (!showcase) return;
    if (desktopMQ.matches && items.length) {
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) || 90;
      stageTop = navH - 1 + document.getElementById("filters").offsetHeight;
      stageH = window.innerHeight - stageTop;
      work.style.setProperty("--stage-top", stageTop + "px");
      work.style.setProperty("--stage-h", stageH + "px");
      list.style.height = stageH + (items.length - 1) * window.innerHeight * stepFor(items.length) + "px";
      stage.style.height = "";
    } else {
      list.style.height = "";
      fitStage();
    }
  }

  function updateFromScroll() {
    if (!desktopMQ.matches || !items.length) return;
    const total = list.offsetHeight - stageH;
    if (total <= 0) { setActive(0); return; }
    const p = Math.min(0.9999, Math.max(0, (stageTop - list.getBoundingClientRect().top) / total));
    setActive(Math.floor(p * items.length));
  }

  function goToProject(i) {
    const behavior = reducedMotion ? "auto" : "smooth";
    if (desktopMQ.matches) {
      const total = list.offsetHeight - stageH;
      const listTop = list.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: listTop - stageTop + ((i + 0.5) / items.length) * total, behavior });
    } else {
      stage.scrollTo({ left: items[i].offsetLeft, behavior });
    }
  }

  // telefono: lo stage è alto quanto la slide più alta della categoria e non cambia durante
  // lo swipe (un'altezza che cambia faceva saltare la pagina e scorrere il carosello in verticale)
  function fitStage() {
    if (desktopMQ.matches || !items.length) return;
    stage.style.height = Math.max(...items.map((p) => p.offsetHeight)) + "px";
  }
  // le slide cambiano altezza quando arrivano loghi e font: lo stage le segue
  const slideResize = "ResizeObserver" in window ? new ResizeObserver(() => fitStage()) : null;

  function setActive(i) {
    if (!items.length) {
      // categoria senza slide (Photo): nessun progetto attivo, tutti i video in pausa
      activeIndex = -1;
      stage.querySelectorAll(".slide.is-active").forEach((p) => p.classList.remove("is-active"));
      videos.forEach((s) => { s.visible = false; s.player.pause().catch(() => {}); });
      return;
    }
    i = Math.max(0, Math.min(items.length - 1, i));
    if (i === activeIndex) return;
    activeIndex = i;
    // anche le slide nascoste (altre categorie) perdono lo stato attivo: niente schede sovrapposte
    stage.querySelectorAll(".slide").forEach((p) => p.classList.toggle("is-active", p === items[i]));
    dotsNav.querySelectorAll(".showcase__dot").forEach((d, j) => d.setAttribute("aria-current", String(j === i)));
    // immagini del progetto attivo e del successivo
    loadImages(items[i]);
    if (items[i + 1]) loadImages(items[i + 1]);
    syncPlayback();
  }

  // solo il video del progetto attivo è in riproduzione; il successivo si prepara
  function syncPlayback() {
    items.forEach((p, j) => p.querySelectorAll(".video").forEach((v) => {
      const play = j === activeIndex && showcaseInView && !workCovered && modal.hidden;
      if (play || j === activeIndex + 1) loadVideo(v);
      const s = videos.get(v);
      if (!s) return;
      s.visible = play;
      if (play) s.player.play().catch(() => {});
      else {
        s.player.pause().catch(() => {});
        if (v.classList.contains("is-unmuted")) setSound(v, false);
      }
    }));
  }

  /* --- Filtri ------------------------------------------------------------ */
  // la linea sotto il filtro attivo scivola fino al nuovo filtro
  // center = true solo quando si sceglie un filtro: la barra scorre per mostrarlo al centro.
  // Al ridimensionamento (anche la barra degli indirizzi del telefono che compare/scompare
  // mentre si scorre) si sposta solo la linea, senza far saltare la barra sotto il dito.
  function moveIndicator(center) {
    const bar = filterList.querySelector(".filters__indicator");
    const active = filterList.querySelector('.filter[aria-pressed="true"]');
    if (!bar || !active) return;
    bar.style.width = active.offsetWidth + "px";
    bar.style.height = active.offsetHeight + "px";
    bar.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    if (center !== true) return;
    const left = active.offsetLeft - (filterList.clientWidth - active.offsetWidth) / 2;
    filterList.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? "auto" : "smooth" });
  }
  let data = null;

  function applyFilter(cat, animate) {
    filterList.querySelectorAll(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === cat)));
    moveIndicator(true);

    const swap = () => {
      list.querySelectorAll(".slide").forEach((p) => { p.hidden = p.dataset.category !== cat; });
      buildShowcase();
      const category = data.categories.find((c) => c.id === cat);
      intro.textContent = category ? category.intro : "";
      if (photoBox) photoBox.hidden = cat !== "photo";
    };

    if (!animate || reducedMotion) { swap(); return; }
    work.classList.add("is-filtering");
    setTimeout(() => {
      swap();
      // se si era già scesi nella lista, riparto dall'inizio dei lavori filtrati
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"));
      const listTop = work.querySelector(".section-head").getBoundingClientRect().bottom + window.scrollY + 24 - navH;
      if (window.scrollY > listTop) window.scrollTo({ top: listTop, behavior: "auto" });
      requestAnimationFrame(() => work.classList.remove("is-filtering"));
    }, 450);
  }

  /* --- Foto e stills: tre file che scorrono in orizzontale con la pagina -- */
  const photoBox = document.getElementById("photo-box");
  const photoWall = document.getElementById("photo-wall");
  const ROWS = 3;

  function buildPhotoWall(photos) {
    if (!photoWall || !photos.length) return;
    const rows = Array.from({ length: ROWS }, () => []);
    photos.forEach((ph, i) => rows[i % ROWS].push(
      `<button class="photo__item" type="button" data-index="${i}" aria-label="${esc(ph.project)}: view larger">
        <img data-src="${esc(ph.src)}" width="${ph.size[0]}" height="${ph.size[1]}" alt="${esc(ph.project)} – still" decoding="async" draggable="false">
        <span class="photo__caption label">${esc(ph.project)}</span>
      </button>`));
    photoWall.innerHTML = rows.map((r) => `<div class="photo__row">${r.join("")}</div>`).join("");
    if (reducedMotion) photoWall.classList.add("is-static");

    // le immagini si scaricano quando la sezione si avvicina
    const near = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      near.disconnect();
      loadImages(photoWall);
    }, { rootMargin: "100% 0px 100% 0px" });
    near.observe(photoWall);

    // file alterne: una verso sinistra, una verso destra, a velocità più bassa dello scroll
    const rowEls = [...photoWall.querySelectorAll(".photo__row")];
    let wallInView = false;
    const drift = () => {
      if (!wallInView) return;
      const r = photoWall.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
      rowEls.forEach((row, i) => {
        const travel = Math.min(Math.max(0, row.scrollWidth - photoWall.clientWidth), (vh + r.height) * 0.45);
        const x = i % 2 ? -travel * (1 - p) : -travel * p;
        row.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      });
    };
    if (!reducedMotion) {
      new IntersectionObserver(([e]) => { wallInView = e.isIntersecting; drift(); }).observe(photoWall);
      onFrame(drift);
    }

    photoWall.addEventListener("click", (e) => {
      const item = e.target.closest(".photo__item");
      if (item) openLightbox(photos, Number(item.dataset.index));
    });
  }

  /* --- Visualizzatore foto (lightbox) ------------------------------------ */
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Photo viewer");
  lightbox.innerHTML = `<button class="lightbox__close label" type="button">Close
      <svg class="arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6"/></svg></button>
    <button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous photo">${ARROW("M15 5l-7 7 7 7")}</button>
    <figure class="lightbox__figure"><img alt=""><figcaption class="lightbox__caption label"></figcaption></figure>
    <button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next photo">${ARROW("M9 5l7 7-7 7")}</button>`;
  document.body.appendChild(lightbox);
  const lbImg = lightbox.querySelector("img");
  const lbCaption = lightbox.querySelector(".lightbox__caption");
  let lbPhotos = [], lbIndex = 0, lbFocus = null;

  function showPhoto(i) {
    const n = lbPhotos.length;
    lbIndex = (i + n) % n;
    const ph = lbPhotos[lbIndex];
    lbImg.classList.remove("is-loaded");
    lbImg.onload = () => lbImg.classList.add("is-loaded");
    lbImg.src = ph.src;
    lbImg.alt = `${ph.project} – still`;
    lbCaption.textContent = `${ph.project} — ${String(lbIndex + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`;
    // la foto successiva è già pronta
    new Image().src = lbPhotos[(lbIndex + 1) % n].src;
  }

  function openLightbox(photos, i) {
    lbPhotos = photos;
    lbFocus = document.activeElement;
    showPhoto(i);
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox__close").focus();
  }

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { lightbox.hidden = true; }, 400);
    if (lbFocus) lbFocus.focus({ preventScroll: true });
  }

  lightbox.addEventListener("click", (e) => {
    if (e.target.closest(".lightbox__nav--prev")) showPhoto(lbIndex - 1);
    else if (e.target.closest(".lightbox__nav--next")) showPhoto(lbIndex + 1);
    else if (!e.target.closest(".lightbox__figure img")) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
    if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
  });
  // swipe sul telefono
  let swipeX = null;
  lightbox.addEventListener("pointerdown", (e) => { swipeX = e.clientX; });
  lightbox.addEventListener("pointerup", (e) => {
    if (swipeX === null) return;
    const dx = e.clientX - swipeX;
    swipeX = null;
    if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
  });

  /* --- Carosello loghi clienti ------------------------------------------ */
  const track = document.querySelector(".clients__track");
  if (track) {
    // seconda copia della fila: con translateX(-50%) lo scorrimento è continuo
    [...track.children].forEach((li) => {
      const copy = li.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.querySelector("img").alt = "";
      track.appendChild(copy);
    });
    const logoBase = window.matchMedia("(min-width: 768px)").matches ? 70 : 50;
    // fascia sottile: anche i loghi verticali non superano ~1,1 volte la base
    track.querySelectorAll("img").forEach((img) => sizeLogo(img, logoBase, 1.1));
    // seconda fila: stessi loghi in un ordine mescolato (fisso, così nessuna coppia di vicini
    // si ripete rispetto alla prima fila) e scorre nel verso opposto
    const originals = [...track.children].filter((li) => !li.hasAttribute("aria-hidden"));
    const SHUFFLE = [7, 2, 12, 0, 10, 5, 14, 3, 9, 1, 13, 6, 11, 4, 8];
    const order = SHUFFLE.filter((i) => i < originals.length);
    originals.forEach((_, i) => { if (!order.includes(i)) order.push(i); });
    const reverse = document.createElement("ul");
    reverse.className = "clients__track clients__track--reverse";
    reverse.setAttribute("aria-hidden", "true");
    [...order, ...order].forEach((i) => {
      const li = originals[i].cloneNode(true);
      const img = li.querySelector("img");
      img.alt = "";
      img.style.height = "";
      sizeLogo(img, logoBase, 1.1);
      reverse.appendChild(li);
    });
    track.after(reverse);
    const tracks = [track, reverse];
    // velocità costante (~35 px/s) qualunque sia la larghezza dei loghi
    const setSpeed = () => tracks.forEach((t) => t.style.setProperty("--marquee-duration", (t.scrollWidth / 2 / 35) + "s"));
    // i loghi si scaricano solo quando la fascia si avvicina; poi si ricalcola la velocità
    const logosObserver = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      logosObserver.disconnect();
      const imgs = tracks.flatMap((t) => [...t.querySelectorAll("img[data-src]")]);
      Promise.all(imgs.map((img) => new Promise((done) => {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      }))).then(setSpeed);
    }, { rootMargin: "100% 0px 100% 0px" });
    logosObserver.observe(track);
    // fuori dallo schermo l'animazione si ferma
    new IntersectionObserver(([e]) => tracks.forEach((t) => t.classList.toggle("is-paused", !e.isIntersecting))).observe(track);
  }

  /* --- Form "Send brief": compone l'email nell'app di posta ------------- */
  // Nessun servizio esterno: i dati non lasciano il browser finché il visitatore
  // non invia l'email dalla propria posta.
  // Invio diretto con Web3Forms: incollare qui la chiave gratuita ricevuta da web3forms.com.
  // Finché è vuota, il form apre l'app di posta del visitatore con il messaggio già scritto.
  const WEB3FORMS_KEY = "";

  const brief = document.getElementById("brief-form");
  if (brief) {
    const status = document.getElementById("brief-status");
    brief.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = brief.elements;
      const checks = [
        [f.name, f.name.value.trim() !== ""],
        [f.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())],
        [f.message, f.message.value.trim() !== ""],
        [f.consent.closest("label"), f.consent.checked],
      ];
      checks.forEach(([el, ok]) => el.classList.toggle("is-invalid", !ok));
      const firstBad = checks.find(([, ok]) => !ok);
      if (firstBad) {
        status.textContent = "Please fill in your name, a valid email, your project and accept the privacy policy.";
        (firstBad[0].matches("label") ? f.consent : firstBad[0]).focus();
        return;
      }
      const v = (k) => f[k].value.trim();
      const subject = `Project brief${v("company") ? " – " + v("company") : ""}${v("service") ? " (" + v("service") + ")" : ""}`;
      // le righe facoltative vuote vengono saltate; la riga vuota separa i dati dal messaggio
      const body = [
        `Name: ${v("name")}`,
        `Email: ${v("email")}`,
        v("company") ? `Company / brand: ${v("company")}` : null,
        v("service") ? `What I need: ${v("service")}` : null,
        "",
        v("message"),
      ].filter((line) => line !== null).join("\n");
      const mailto = () => {
        window.location.href = `mailto:fainmatteo.video@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        status.textContent = "Your email app should open with the brief ready to send. If nothing happens, write to fainmatteo.video@gmail.com.";
      };
      if (!WEB3FORMS_KEY) { mailto(); return; }

      // invio diretto
      const button = brief.querySelector(".brief__submit");
      button.disabled = true;
      button.textContent = "Sending…";
      status.textContent = "";
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject,
          from_name: v("name"),
          email: v("email"),
          company: v("company"),
          service: v("service"),
          message: v("message"),
          botcheck: f.botcheck.checked,
        }),
      })
        .then((r) => r.json())
        .then((res) => {
          if (!res.success) throw new Error(res.message);
          brief.reset();
          markEmpty();
          status.textContent = "Thanks! Your brief has been sent. I'll get back to you soon.";
        })
        .catch(() => {
          status.textContent = "Sending failed. Your email app will open instead.";
          mailto();
        })
        .finally(() => {
          button.disabled = false;
          button.textContent = "Send brief";
        });
    });
    const service = brief.elements.service;
    const markEmpty = () => service.classList.toggle("is-empty", service.value === "");
    service.addEventListener("change", markEmpty);
    markEmpty();
    // l'errore sparisce appena il campo viene corretto
    brief.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
    brief.addEventListener("change", (e) => { if (e.target.name === "consent") e.target.closest("label").classList.remove("is-invalid"); });
  }

  fetch("projects.json")
    .then((r) => r.json())
    .then((json) => {
      data = json;
      filterList.innerHTML =
        data.categories.map((c) =>
          `<button class="filter label" data-filter="${esc(c.id)}" aria-pressed="false">${esc(c.label)}</button>`).join("");
      const indicator = document.createElement("span");
      indicator.className = "filters__indicator";
      indicator.setAttribute("aria-hidden", "true");
      filterList.appendChild(indicator);
      filterList.classList.add("has-indicator");
      // solo i cambi di larghezza contano (la barra degli indirizzi cambia solo l'altezza)
      let lastWidth = window.innerWidth;
      window.addEventListener("resize", () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        moveIndicator();
      });
      if (document.fonts) document.fonts.ready.then(() => moveIndicator());
      // sfumatura ai bordi quando ci sono altre categorie oltre lo schermo
      const fadeEdges = () => {
        const max = filterList.scrollWidth - filterList.clientWidth;
        filterList.classList.toggle("is-cut-left", filterList.scrollLeft > 4);
        filterList.classList.toggle("is-cut-right", filterList.scrollLeft < max - 4);
      };
      filterList.addEventListener("scroll", fadeEdges, { passive: true });
      window.addEventListener("resize", fadeEdges);
      fadeEdges();
      // telefono: la prima volta che la barra compare scorre un attimo e torna indietro,
      // per far capire che ci sono altre categorie con lo swipe
      if (!reducedMotion && window.matchMedia("(hover: none), (max-width: 767px)").matches) {
        let touched = false;
        filterList.addEventListener("pointerdown", () => { touched = true; }, { once: true });
        const peek = new IntersectionObserver(([e]) => {
          if (!e.isIntersecting) return;
          peek.disconnect();
          const start = filterList.scrollLeft;
          if (filterList.scrollWidth - filterList.clientWidth < 40) return;
          setTimeout(() => {
            if (touched) return;
            filterList.scrollTo({ left: start + 90, behavior: "smooth" });
            setTimeout(() => { if (!touched) filterList.scrollTo({ left: start, behavior: "smooth" }); }, 750);
          }, 700);
        }, { threshold: 1 });
        peek.observe(filterList);
      }
      filterList.addEventListener("click", (e) => {
        const b = e.target.closest(".filter");
        if (b && b.getAttribute("aria-pressed") !== "true") {
          applyFilter(b.dataset.filter, true);
          history.replaceState(null, "", "#" + b.dataset.filter);
        }
      });

      list.innerHTML = `<div class="showcase">
          <nav class="showcase__dots" aria-label="Projects"></nav>
          <div class="showcase__stage">${data.projects.map(projectHTML).join("")}${reelSlidesHTML(data.reels, data.categories)}</div>
        </div>`;
      setupShowcase();
      buildPhotoWall(data.photos || []);
      const projectLogoBase = window.matchMedia("(min-width: 768px)").matches ? 60 : 40;
      list.querySelectorAll(".project__logos img").forEach((img) => sizeLogo(img, projectLogoBase));
      // un indirizzo come fainmatteo.com/#documentary apre i lavori con quel filtro attivo
      const isCategory = (id) => data.categories.some((c) => c.id === id);
      const goToWork = () => requestAnimationFrame(() => work.scrollIntoView({ behavior: "auto" }));
      const fromHash = location.hash.slice(1);
      applyFilter(isCategory(fromHash) ? fromHash : data.categories[0].id, false);
      if (isCategory(fromHash)) goToWork();
      window.addEventListener("hashchange", () => {
        const id = location.hash.slice(1);
        if (!isCategory(id)) return;
        applyFilter(id, true);
        goToWork();
      });
    })
    .catch(() => {
      list.innerHTML = '<p class="muted">Projects could not be loaded. Please reload the page.</p>';
    });

  /* ======================================================================
     Effetti
     ====================================================================== */

  /* 2. Scorrendo, logo e frase dell'apertura si allontanano e il video si scurisce */
  if (!reducedMotion && hero) {
    onFrame(() => {
      const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.8)));
      hero.style.setProperty("--hero-p", p.toFixed(3));
    });
  }

  /* 3. Bagliore caldo (lens flare) che si sposta appena lungo il bordo sinistro mentre si scorre */
  const flare = document.querySelector(".flare");
  if (flare && !reducedMotion) {
    onFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      // scende appena con la pagina e ondeggia di pochissimo, restando vicino al bordo
      flare.style.setProperty("--flare-y", (p * 18).toFixed(2) + "vh");
      flare.style.setProperty("--flare-x", (Math.sin(p * Math.PI * 2) * 2.5 - 1.5).toFixed(2) + "vw");
      flare.style.setProperty("--flare-r", (p * 12 - 8).toFixed(1) + "deg");
    });
  }

  /* 5. Pannello di Services/How I work: i lavori restano fermi e il pannello ci sale sopra;
        il bordo diagonale si raddrizza mentre sale */
  const act = document.getElementById("act");
  // i lavori si fermano quando il loro fondo tocca il fondo dello schermo
  const pinWork = () => work.style.setProperty("--work-top", Math.min(0, window.innerHeight - work.offsetHeight) + "px");
  if ("ResizeObserver" in window) new ResizeObserver(pinWork).observe(work);
  window.addEventListener("resize", pinWork);
  pinWork();
  if (act) {
    // quando il pannello copre tutto, i lavori sotto si nascondono e i video si fermano
    onFrame(() => {
      const covered = act.getBoundingClientRect().top <= 0;
      if (covered === workCovered) return;
      workCovered = covered;
      work.classList.toggle("is-covered", covered);
      syncPlayback();
    });
  }
  // il pannello si ferma a sua volta quando il suo fondo tocca lo schermo, e About ci sale sopra
  const about = document.getElementById("about");
  // stessa condizione del CSS: con mouse e schermo largo lavori e pannello restano agganciati
  const pinnedMQ = window.matchMedia("(min-width: 1024px) and (hover: hover)");
  const pinAct = () => act && act.style.setProperty("--act-top", Math.min(0, window.innerHeight - act.offsetHeight) + "px");
  if (act && "ResizeObserver" in window) new ResizeObserver(pinAct).observe(act);
  window.addEventListener("resize", pinAct);
  pinAct();
  if (act && about) {
    // taglio diagonale di un bordo che sale: ripido quando entra dal basso, dritto quando arriva in cima
    const slantFor = (top, vh) => {
      if (reducedMotion) return 0;
      const p = Math.min(1, Math.max(0, 1 - top / vh));
      // desktop: da ripido a dritto. Telefono/tablet: resta sempre un po' obliquo, entro la
      // sovrapposizione delle sezioni (14vh)
      return pinnedMQ.matches ? (1 - p) * vh * 0.24 : vh * (0.04 + 0.1 * (1 - p));
    };
    const setEdge = (el, slant, top, vh, width) => {
      el.style.setProperty("--slant", slant.toFixed(1) + "px");
      el.style.setProperty("--angle", (-Math.atan2(slant, width) * 180 / Math.PI).toFixed(3) + "deg");
      el.style.setProperty("--edge", (0.3 + 0.7 * Math.min(1, Math.max(0, top / vh))).toFixed(2));
    };
    onFrame(() => {
      // prima tutte le letture, poi le scritture (niente ricalcoli del layout a metà)
      const vh = window.innerHeight;
      const width = act.offsetWidth;
      const actTop = act.getBoundingClientRect().top;
      const aboutTop = about.getBoundingClientRect().top;
      const navH = nav.offsetHeight;
      setEdge(act, slantFor(actTop, vh), actTop, vh, width);
      setEdge(about, slantFor(aboutTop, vh), aboutTop, vh, width);
      act.classList.toggle("is-covered", aboutTop <= 0);
      // il menu prende il colore del pannello rosso quando ci sta sopra
      nav.classList.toggle("is-red", actTop < navH && aboutTop > navH);
    });
  }

  /* 7. Collaborazioni: la sezione si ferma e le foto salgono dal basso una alla volta;
        il testo di chi è in primo piano compare in dissolvenza */
  const partners = document.querySelector(".partners");
  if (partners && !reducedMotion) {
    const cards = [...partners.querySelectorAll(".partner")];
    const n = cards.length;
    partners.style.setProperty("--count", n);
    partners.classList.add("is-pinned");
    const imgs = cards.map((c) => c.querySelector(".partner__img"));
    // lo scroll dà la posizione "obiettivo"; le foto la raggiungono con un'inerzia morbida
    // (niente scatti con la rotella del mouse)
    const target = cards.map(() => 0);
    const shown = cards.map(() => 0);
    let current = -1, gliding = false;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const glide = () => {
      let moving = false;
      shown.forEach((v, i) => {
        const d = target[i] - v;
        shown[i] = Math.abs(d) < 0.001 ? target[i] : v + d * 0.11;
        if (shown[i] !== target[i]) moving = true;
        imgs[i].style.setProperty("--e", ease(shown[i]).toFixed(4));
      });
      gliding = moving;
      if (moving) requestAnimationFrame(glide);
    };
    onFrame(() => {
      const r = partners.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -vh || r.top > vh * 2) return;
      // la prima foto inizia a entrare quando la sezione è a metà schermo
      const total = partners.offsetHeight - vh + vh * 0.5;
      const p = Math.min(1, Math.max(0, (vh * 0.5 - r.top) / total));
      let now = 0;
      cards.forEach((c, i) => {
        target[i] = Math.min(1, Math.max(0, (p * n - i) / 0.7));
        if (target[i] > 0.5) now = i;
      });
      if (now !== current) {
        current = now;
        cards.forEach((c, i) => c.classList.toggle("is-current", i === current));
      }
      if (!gliding) { gliding = true; requestAnimationFrame(glide); }
    });
  }

  /* 4. Titoli delle sezioni che salgono da una maschera */
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-title-in");
      titleObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -12% 0px" });
  document.querySelectorAll(".section-head h2, .partners__title").forEach((title) => {
    title.innerHTML = `<span class="title-mask"><span>${title.innerHTML}</span></span>`;
    titleObserver.observe(title);
  });
})();
