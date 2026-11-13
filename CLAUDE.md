# Portfolio Matteo Fain – fainmatteo.com

## Contesto
- Portfolio di Matteo Fain, videomaker ed editor freelance con base a Zurigo (corporate, eventi, contenuti social).
- Sito statico pubblicato con GitHub Pages dal branch `main` (cartella root) sul dominio fainmatteo.com.
- I video sono ospitati su Vimeo.
- Il restyling si fa SOLO sul branch `redesign`. Non fare mai commit o push su `main` senza che io lo chieda esplicitamente. Non usare mai `push --force`.

## Obiettivo del restyling
Sostituire il sito attuale (index / work / about / contact separati) con **un'unica pagina a scorrimento** (`index.html`), con filtri per categoria sui lavori, senza cambiare pagina.

## Decisioni prese
- Lingua del sito: **inglese** (come il vecchio sito). Questo file è in italiano, ma tutti i testi del sito sono in inglese.
- Progetti: **tenere tutti i progetti** presenti nell'attuale `work.html`, nello stesso ordine.
- Filtri: **le stesse categorie del vecchio sito** (Corporate, Start-up, Social, ecc.: ricavarle dall'attuale `work.html`).
- Testi: **riprendere i testi del vecchio sito** (index, work, about, contact), adattandoli alla nuova struttura senza riscriverli.
- Funzioni: **le stesse del vecchio sito**, in particolare:
  - i video partono in autoplay muto quando sono visibili;
  - **al click su un video si attiva l'audio**;
  - i video fuori dallo schermo vengono messi in pausa e quelli lontani non vengono caricati (ottimizzazione).
- **Carosello dei loghi clienti**: mantenerlo (cartella `logos clients`), migliorandolo nell'aspetto (scorrimento continuo e fluido, loghi tutti bianchi e della stessa altezza visiva).

## Struttura della pagina (dall'alto in basso)
1. **Apertura (hero)**: video a tutto schermo in autoplay, muto e in loop, con il logo MF grande e centrato sopra. Menu minimale con link interni alle sezioni (Lavori, Come lavoro, About, Contatti). Showreel provvisorio: usare il primo video presente nell'attuale `index.html` come segnaposto, facile da sostituire.
2. **Lavori**: barra filtri per categoria (es. Tutti / Corporate / Eventi / Social: ricava le categorie esistenti dall'attuale `work.html`). La barra resta visibile (sticky) mentre si scorre i lavori. Filtrare nasconde/mostra i progetti nella stessa pagina, con una transizione morbida, senza ricaricare. Ogni progetto: video Vimeo che parte in autoplay muto quando entra nello schermo e si ferma quando esce; sotto, un carosello di stills del progetto (scorrevole con swipe su mobile e frecce/trascinamento su desktop, come nel vecchio sito); poi titolo, breve descrizione e logo del cliente. Le stills si caricano solo quando il progetto si avvicina allo schermo (lazy loading), per non appesantire la pagina.
3. **Come lavoro**: 3-4 step numerati (01, 02, 03…), ciascuno con titolo breve, una frase e 2-3 punti elenco. Testi in `_brief/come-lavoro.md`.
4. **About**: breve presentazione e foto (`assets/prof-pic.webp`).
5. **Contatti**: email, Instagram, Vimeo, eventualmente un form semplice.

## Dati dei progetti
- Tutti i progetti stanno in `projects.json` (titolo, cliente, categoria, ID Vimeo, descrizione, file logo, miniatura, lista delle stills). La griglia viene generata da questo file via JavaScript.
- Aggiungere un progetto = aggiungere un oggetto a `projects.json`. Niente blocchi HTML ripetuti a mano.
- Miniature come immagini statiche in `assets/`, non richieste a Vimeo dal browser.

## Estetica
- Dal branch `nuova-estetica`: aspetto da videomaker/studio creativo, non da sito tech. Cambiano forme, colori e font; impaginazione, struttura e funzioni restano quelle già costruite.
- Riferimento per palette, font e grafica dei pulsanti: 1stdecember.com. Riferimento per le foto dei collaboratori: le polaroid di paragonproductions.co. Prendere lo *stile*, non copiare codice, testi o asset.
- Palette (variabili in `style.css`): nero caldo `#151412` (fondo principale; niente grigi freddi o bluastri), crema `#F1EDE4` (testi sul fondo scuro e fondo delle sezioni chiare), giallo `#FFC800` (accento: pulsanti, categoria attiva, etichette di sezione), verde salvia `#6BA368` (solo piccoli dettagli).
- Sul giallo e sul verde solo testo scuro. Mai testo giallo o verde sul crema (contrasto insufficiente).
- Riquadri sul fondo scuro (form di contatto, scheda del progetto): crema pieno con testo scuro, come le polaroid, mai scuro su scuro.
- Colori pieni: niente pannelli trasparenti o sfocati (`backdrop-filter`), niente sfumature di sfondo. Unica texture: una grana leggera tipo carta, solo sui fondi (non su riquadri, schede e polaroid).
- Forme squadrate: nessun `border-radius` (pulsanti, campi, pannelli e schede sono rettangoli).
- Sezioni alternate: apertura, Lavori, Collaboration, Clienti e Contatti sul fondo scuro; Services/How I work e About su crema.
- Font (self-hosted): Anton per i titoli (maiuscolo, stretto e pesante, sullo stile dei titoli di paragonproductions.co), Albert Sans per testi, pulsanti ed etichette (queste in maiuscolo grassetto), come alternativa libera al Roobert di Paragon.
- Foto dei collaboratori: polaroid con cornice crema, inclinate e sparse una sull'altra, con il nome scritto a mano (font Reenie Beanie, self-hosted, usato solo lì).
- Pulsante principale: rettangolo giallo pieno con un quadratino davanti al testo.
- Menu (riferimento: weisslameraner.com): barra in alto con logo a sinistra, voci in fila al centro e "Let's talk" a destra; sotto la barra una linea che avanza con lo scorrimento. Su telefono e tablet le voci sono nel menu a tutto schermo.
- Carosello loghi: i loghi sfumano ai due bordi laterali.
- Dal vecchio sito mantenere: autoplay dei video, carosello di stills, descrizioni e loghi clienti.
- Logo: `assets/logo/mf-logo-white.webp` (bianco; sulle sezioni chiare viene scurito via CSS). Grande nell'apertura e piccolo nel menu.

## Qualità del design
- Il sito è il mio biglietto da visita come videomaker: deve sembrare fatto da uno studio, non da un template.
- Cura tipografia (gerarchie chiare, spaziature generose, maiuscole/tracking dove serve), ritmo verticale e allineamenti.
- Animazioni sobrie e cinematografiche: comparse morbide allo scroll, transizioni lente. Niente effetti vistosi. Rispetta `prefers-reduced-motion`.
- Prima di costruire una sezione, proponimi la direzione visiva a parole (o 2 alternative). Dopo averla costruita, fai uno screenshot desktop e mobile, valuta tu stesso cosa non funziona e correggilo prima di mostrarmela.

## Privacy (Svizzera / UE)
- Embed Vimeo sempre con il parametro `dnt=1` (niente cookie di tracciamento Vimeo).
- Font self-hosted nella repo (cartella `assets/fonts/`), non caricati da Google Fonts, così il browser del visitatore non contatta Google.
- Nessun analytics e nessun cookie di terze parti, quindi niente banner cookie.
- Aggiungere una pagina `privacy.html` semplice (in inglese) linkata nel footer; il testo lo fornisco io in `_brief/privacy.md`.
- Nel footer: nome, città ed email di contatto.

## Regole tecniche
- HTML + CSS + JavaScript semplici. Niente framework, niente step di build, niente Tailwind CDN.
- Un solo file CSS (`style.css`), con colori e font definiti come variabili.
- Mobile first: deve funzionare bene da telefono.
- Immagini: mai aggiungere PNG originali pesanti alla repo. Solo versioni compresse (WebP o JPG, lato lungo max ~2000 px). Gli originali restano fuori dalla repo.
- La cartella `_brief/` contiene materiale di riferimento, non fa parte del sito.
- Prima di modifiche grandi, proponi un piano e aspetta la mia conferma.
- Lavora a passi piccoli e committa sul branch `redesign` dopo ogni passo, con messaggi chiari in italiano.
