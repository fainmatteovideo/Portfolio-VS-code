/* Matteo Fain – fainmatteo.com */
(function () {
  "use strict";

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

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => sectionObserver.observe(s));

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

  const SOUND = '<span class="video__sound label"><i><b></b></i><em>Sound off</em></span>';
  const ARROW = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="${d}"/></svg>`;

  function videoHTML(id, hash, title, poster) {
    return `<div class="video" data-vimeo="${esc(id)}" data-hash="${esc(hash || "")}" role="button" tabindex="0"
              aria-label="${esc(title)}: turn sound on" aria-pressed="false">
              ${poster ? `<img class="video__poster" src="${esc(poster)}" alt="" loading="lazy" decoding="async">` : ""}
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
      `<img src="${esc(l.src)}" alt="${esc(l.alt)}" loading="lazy" decoding="async">`).join("");
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
  function sizeLogo(img, base) {
    const apply = () => {
      const ratio = img.naturalWidth / img.naturalHeight || 1;
      img.style.height = Math.round(Math.min(base * 1.5, Math.max(base * 0.45, base / Math.sqrt(ratio)))) + "px";
    };
    img.complete && img.naturalWidth ? apply() : img.addEventListener("load", apply, { once: true });
  }

  /* --- Video: caricamento pigro, play/pausa allo scroll, audio al click --- */
  const videos = new Map(); // elemento .video -> { player, visible }

  function loadVideo(el) {
    if (videos.has(el) || !window.Vimeo) return;
    const hash = el.dataset.hash ? `h=${el.dataset.hash}&` : "";
    const iframe = document.createElement("iframe");
    iframe.src = `https://player.vimeo.com/video/${el.dataset.vimeo}?${hash}background=1&autoplay=1&loop=1&muted=1&autopause=0&dnt=1`;
    iframe.allow = "autoplay; fullscreen; picture-in-picture";
    iframe.title = el.getAttribute("aria-label").replace(": turn sound on", "");
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

  function setSound(el, on) {
    const state = videos.get(el);
    el.classList.toggle("is-unmuted", on);
    el.setAttribute("aria-pressed", String(on));
    el.setAttribute("aria-label", el.getAttribute("aria-label").replace(/turn sound (on|off)$/, on ? "turn sound off" : "turn sound on"));
    const label = el.querySelector(".video__sound em");
    if (label) label.textContent = on ? "Sound on" : "Sound off";
    if (!state) return;
    state.player.setVolume(on ? 1 : 0).catch(() => {});
    state.player.setMuted(!on).catch(() => {});
  }

  function toggleSound(el) {
    loadVideo(el);
    const on = !el.classList.contains("is-unmuted");
    // un solo video con l'audio alla volta
    if (on) videos.forEach((_, other) => { if (other !== el && other.classList.contains("is-unmuted")) setSound(other, false); });
    setSound(el, on);
    if (on) videos.get(el)?.player.play().catch(() => {});
  }

  // Vicino allo schermo (1 schermata e mezza): carica video e stills
  const nearObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.querySelectorAll(".video").forEach(loadVideo);
      if (el.matches(".video")) loadVideo(el);
      el.querySelectorAll("img[data-src]").forEach((img) => {
        img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
      });
      nearObserver.unobserve(el);
    });
  }, { rootMargin: "150% 0px 150% 0px" });

  // Visibile: play muto. Fuori dallo schermo: pausa (e audio spento)
  const playObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const el = entry.target;
      if (entry.isIntersecting) loadVideo(el);
      const s = videos.get(el);
      if (!s) return;
      s.visible = entry.isIntersecting;
      if (s.visible) {
        s.player.play().catch(() => {});
      } else {
        s.player.pause().catch(() => {});
        if (el.classList.contains("is-unmuted")) setSound(el, false);
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
    root.querySelectorAll(".video").forEach((v) => playObserver.observe(v));
    root.querySelectorAll(".project, .reels .video").forEach((el) => nearObserver.observe(el));
    root.querySelectorAll(".reveal").forEach((el) => reducedMotion ? el.classList.add("is-visible") : revealObserver.observe(el));
  }

  // Click / tastiera sul video = audio
  work.addEventListener("click", (e) => {
    const v = e.target.closest(".video");
    if (v) toggleSound(v);
  });
  work.addEventListener("keydown", (e) => {
    const v = e.target.closest(".video");
    if (v && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleSound(v); }
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
  let data = null;

  function applyFilter(cat, animate) {
    filterList.querySelectorAll(".filter").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === cat)));

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
    const logoBase = window.matchMedia("(min-width: 768px)").matches ? 48 : 36;
    track.querySelectorAll("img").forEach((img) => sizeLogo(img, logoBase));
    // velocità costante (~35 px/s) qualunque sia la larghezza dei loghi
    const setSpeed = () => track.style.setProperty("--marquee-duration", (track.scrollWidth / 2 / 35) + "s");
    window.addEventListener("load", setSpeed);
    // fuori dallo schermo l'animazione si ferma
    new IntersectionObserver(([e]) => track.classList.toggle("is-paused", !e.isIntersecting)).observe(track);
  }

  fetch("projects.json")
    .then((r) => r.json())
    .then((json) => {
      data = json;
      filterList.innerHTML =
        data.categories.map((c) =>
          `<button class="filter label" data-filter="${esc(c.id)}" aria-pressed="false">${esc(c.label)}</button>`).join("");
      filterList.addEventListener("click", (e) => {
        const b = e.target.closest(".filter");
        if (b && b.getAttribute("aria-pressed") !== "true") applyFilter(b.dataset.filter, true);
      });

      list.innerHTML = data.projects.map(projectHTML).join("");
      list.querySelectorAll(".stills").forEach(setupStills);
      const projectLogoBase = window.matchMedia("(min-width: 768px)").matches ? 84 : 60;
      list.querySelectorAll(".project__logos img").forEach((img) => sizeLogo(img, projectLogoBase));
      applyFilter(data.categories[0].id, false);
      observe(list);
    })
    .catch(() => {
      list.innerHTML = '<p class="muted">Projects could not be loaded. Please reload the page.</p>';
    });
})();
