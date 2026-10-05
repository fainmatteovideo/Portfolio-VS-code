/* Matteo Fain – fainmatteo.com */
(function () {
  "use strict";

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

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => { menu.hidden = true; }, 400);
    }
  }

  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* --- Link attivo in base alla sezione visibile ------------------------- */
  const links = [...document.querySelectorAll(".site-nav__links a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);

  // attiva l'ultima sezione il cui inizio ha superato il terzo superiore dello schermo
  // (funziona anche per sezioni basse come la fascia dei loghi)
  let ticking = false;
  function updateActive() {
    ticking = false;
    const line = window.innerHeight * 0.35;
    let current = null;
    sections.forEach((s) => { if (s.getBoundingClientRect().top <= line) current = s; });
    // in fondo alla pagina l'ultima sezione (Contact) non arriva in alto: la attivo comunque
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
    links.forEach((a) => a.classList.toggle("is-active", !!current && a.getAttribute("href") === "#" + current.id));
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(updateActive); } }, { passive: true });
  updateActive();

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
  const reelsBox = document.getElementById("reels");
  const intro = document.getElementById("work-intro");
  const filterList = document.querySelector(".filters__list");

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const SOUND = '<span class="video__sound label"><i><b></b></i><em>Sound</em></span>';
  const ARROW = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="${d}"/></svg>`;

  function videoHTML(id, hash, title, poster) {
    return `<div class="video" data-vimeo="${esc(id)}" data-hash="${esc(hash || "")}" role="button" tabindex="0"
              aria-label="${esc(title)}: play with sound">
              ${poster ? `<img class="video__poster" src="${esc(poster)}"${poster.startsWith("assets/posters/")
                ? ` srcset="${esc(poster.replace(".webp", "-800.webp"))} 800w, ${esc(poster)} 1600w" sizes="(max-width: 900px) 100vw, 1120px"` : ""}
                alt="" loading="lazy" decoding="async">` : ""}
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
    const stills = p.stills.map((s, i) =>
      `<div class="stills__item"><img data-src="${esc(s)}" alt="${esc(p.title)} – still ${i + 1}" decoding="async" draggable="false"></div>`).join("");

    return `<article class="project reveal" data-category="${esc(p.category)}" id="project-${esc(p.id)}">
      ${videoHTML(p.vimeo, "", p.title, p.thumbnail)}
      ${p.stills.length ? `<div class="stills">
        <button class="stills__arrow stills__arrow--prev" aria-label="Previous stills" disabled>${ARROW("M15 5l-7 7 7 7")}</button>
        <div class="stills__track">${stills}</div>
        <button class="stills__arrow stills__arrow--next" aria-label="Next stills">${ARROW("M9 5l7 7-7 7")}</button>
      </div>` : ""}
      <div class="project__meta">
        <div class="project__head">
          <span class="project__num label"></span>
          <h3 class="project__title">${esc(p.title)}</h3>
          ${p.subtitle ? `<p class="project__subtitle">${esc(p.subtitle)}</p>` : ""}
          ${logos ? `<div class="project__logos">${logos}</div>` : ""}
        </div>
        <ul class="project__credits">${credits}</ul>
      </div>
    </article>`;
  }

  function reelsHTML(reels, category) {
    const group = (orientation, title) => {
      const items = reels.filter((r) => r.category === category && r.orientation === orientation);
      if (!items.length) return "";
      return `<div class="reels__group">
        <p class="reels__title label">${title}</p>
        <div class="reels__grid reels__grid--${orientation}">
          ${items.map((r) => videoHTML(r.vimeo, r.hash, r.label, r.poster)).join("")}
        </div>
      </div>`;
    };
    return group("horizontal", "Reels — 16:9") + group("vertical", "Reels — 9:16");
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
    iframe.title = el.getAttribute("aria-label").replace(": play with sound", "");
    iframe.tabIndex = -1;
    el.prepend(iframe);

    const state = { player: new Vimeo.Player(iframe), visible: false };
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

  function openPlayer(el) {
    const hash = el.dataset.hash ? `h=${el.dataset.hash}&` : "";
    const title = el.getAttribute("aria-label").replace(": play with sound", "");
    modalFrame.classList.toggle("is-vertical", !!el.closest(".reels__grid--vertical"));
    modalFrame.innerHTML = `<iframe src="https://player.vimeo.com/video/${el.dataset.vimeo}?${hash}autoplay=1&title=0&byline=0&portrait=0&playsinline=1&dnt=1"
      allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${esc(title)}"></iframe>`;
    // i video di sfondo si fermano mentre il player è aperto
    videos.forEach((state) => state.player.pause().catch(() => {}));
    lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    modal.querySelector(".player-modal__close").focus();
  }

  function closePlayer() {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { modal.hidden = true; modalFrame.innerHTML = ""; }, 400);
    videos.forEach((state) => { if (state.visible) state.player.play().catch(() => {}); });
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".player-modal__close")) closePlayer();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePlayer(); });

  // Video: si caricano quando mancano circa mezza schermata
  const videoNearObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      loadVideo(entry.target);
      videoNearObserver.unobserve(entry.target);
    });
  }, { rootMargin: "50% 0px 50% 0px" });

  // Stills (leggere): si caricano con una schermata di anticipo
  const nearObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.querySelectorAll("img[data-src]").forEach((img) => {
        img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      });
      nearObserver.unobserve(el);
    });
  }, { rootMargin: "100% 0px 100% 0px" });

  // Visibile: play muto. Fuori dallo schermo: pausa (e audio spento)
  const playObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting) loadVideo(el);
      const s = videos.get(el);
      if (!s) return;
      s.visible = entry.isIntersecting;
      if (s.visible && modal.hidden) {
        s.player.play().catch(() => {});
      } else {
        s.player.pause().catch(() => {});
      }
    });
  }, { threshold: 0.25 });

  // Comparsa morbida
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -10% 0px" });

  function observe(root) {
    root.querySelectorAll(".video").forEach((v) => { playObserver.observe(v); videoNearObserver.observe(v); });
    root.querySelectorAll(".project").forEach((el) => nearObserver.observe(el));
    root.querySelectorAll(".reveal").forEach((el) => reducedMotion ? el.classList.add("is-visible") : revealObserver.observe(el));
  }

  // Comparsa morbida anche per gli elementi già presenti nella pagina (servizi, step, about)
  document.querySelectorAll(".reveal").forEach((el) => reducedMotion ? el.classList.add("is-visible") : revealObserver.observe(el));

  // Click / tastiera sul video = player completo con audio
  work.addEventListener("click", (e) => {
    const v = e.target.closest(".video");
    if (v) openPlayer(v);
  });
  work.addEventListener("keydown", (e) => {
    const v = e.target.closest(".video");
    if (v && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openPlayer(v); }
  });

  /* --- Stills: trascinamento col mouse e frecce --------------------------- */
  function setupStills(box) {
    const track = box.querySelector(".stills__track");
    const prev = box.querySelector(".stills__arrow--prev");
    const next = box.querySelector(".stills__arrow--next");
    const update = () => {
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    };
    const step = (dir) => track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reducedMotion ? "auto" : "smooth" });
    prev.addEventListener("click", () => step(-1));
    next.addEventListener("click", () => step(1));
    track.addEventListener("scroll", update, { passive: true });
    update();

    let startX = 0, startScroll = 0, dragging = false;
    track.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;   // su touch basta lo swipe nativo
      dragging = true; startX = e.clientX; startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) track.classList.add("is-dragging");
      track.scrollLeft = startScroll - dx;
    });
    const end = () => { dragging = false; track.classList.remove("is-dragging"); };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointercancel", end);
  }

  /* --- Filtri ------------------------------------------------------------ */
  // la linea sotto il filtro attivo scivola fino al nuovo filtro
  function moveIndicator() {
    const bar = filterList.querySelector(".filters__indicator");
    const active = filterList.querySelector('.filter[aria-pressed="true"]');
    if (!bar || !active) return;
    bar.style.transform = `translateX(${active.offsetLeft}px) scaleX(${active.offsetWidth})`;
    // su mobile la barra scorre in modo che il filtro scelto sia tutto visibile
    const left = active.offsetLeft - (filterList.clientWidth - active.offsetWidth) / 2;
    filterList.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? "auto" : "smooth" });
  }
  let data = null;

  function applyFilter(cat, animate) {
    filterList.querySelectorAll(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === cat)));
    moveIndicator();

    const swap = () => {
      let n = 0;
      list.querySelectorAll(".project").forEach((p) => {
        const show = p.dataset.category === cat;
        p.hidden = !show;
        if (show) p.querySelector(".project__num").textContent = String(++n).padStart(2, "0");
      });
      const category = data.categories.find((c) => c.id === cat);
      intro.textContent = category ? category.intro : "";
      reelsBox.innerHTML = reelsHTML(data.reels, cat);
      observe(reelsBox);
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
      window.addEventListener("resize", moveIndicator);
      if (document.fonts) document.fonts.ready.then(moveIndicator);
      filterList.addEventListener("click", (e) => {
        const b = e.target.closest(".filter");
        if (b && b.getAttribute("aria-pressed") !== "true") {
          applyFilter(b.dataset.filter, true);
          history.replaceState(null, "", "#" + b.dataset.filter);
        }
      });

      list.innerHTML = data.projects.map(projectHTML).join("");
      list.querySelectorAll(".stills").forEach(setupStills);
      const projectLogoBase = window.matchMedia("(min-width: 768px)").matches ? 84 : 60;
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
      observe(list);
    })
    .catch(() => {
      list.innerHTML = '<p class="muted">Projects could not be loaded. Please reload the page.</p>';
    });

  /* ======================================================================
     Effetti
     ====================================================================== */

  /* 2. Scorrendo, logo e frase dell'apertura si allontanano e il video si scurisce */
  if (!reducedMotion && hero) {
    let heroTicking = false;
    const updateHero = () => {
      heroTicking = false;
      const p = Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.8)));
      hero.style.setProperty("--hero-p", p.toFixed(3));
    };
    window.addEventListener("scroll", () => {
      if (!heroTicking) { heroTicking = true; requestAnimationFrame(updateHero); }
    }, { passive: true });
    updateHero();
  }

  /* 3. Cursore "Sound" che segue il mouse sopra i video (solo con mouse) */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const cursor = document.createElement("div");
    cursor.className = "sound-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.appendChild(cursor);
    document.body.classList.add("has-sound-cursor");

    // il cerchio è sempre esattamente sotto il puntatore (nessun ritardo, nessuno "spostamento")
    let x = 0, y = 0, current = null;
    const label = () => { if (current) cursor.textContent = "Sound"; };
    // "translate" (e non "transform"): così l'ingrandimento con "scale" non sposta il cerchio
    const place = () => { cursor.style.translate = `${x}px ${y}px`; };
    document.addEventListener("mousemove", (e) => {
      x = e.clientX; y = e.clientY;
      place();
      const v = e.target.closest(".video");
      if (v !== current) {
        current = v;
        cursor.classList.toggle("is-visible", !!v);
        label();
      }
    }, { passive: true });
    document.addEventListener("mouseleave", () => { current = null; cursor.classList.remove("is-visible"); });
    // scorrendo con la rotella il video sotto il puntatore cambia anche senza muovere il mouse
    window.addEventListener("scroll", () => {
      const under = document.elementFromPoint(x, y);
      const v = under && under.closest(".video");
      if (v !== current) { current = v; cursor.classList.toggle("is-visible", !!v); label(); }
    }, { passive: true });
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
