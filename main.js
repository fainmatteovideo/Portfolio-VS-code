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
})();
