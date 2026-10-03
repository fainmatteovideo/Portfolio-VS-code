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
- Riferimento principale per apertura, uso del logo e tipografia: synkron.xyz (screenshot in `_brief/references/`). Prendere lo *stile*, non copiare codice, testi o asset.
- NON prendere da synkron.xyz la resa della griglia video sotto l'apertura.
- Riferimento per la sezione "Come lavoro": amazeproduction.ch (step numerati con titolo, frase e punti elenco).
- Dal vecchio sito mantenere: autoplay dei video, carosello di stills sotto ogni video, descrizioni e loghi clienti.
- Dal vecchio sito eliminare: carosello in homepage.
- Palette: bianco per logo e testi su sfondo scuro. Sobria, cinematografica.
- Sfondo: NON nero piatto. Gradiente scuro "da studio" (nero profondo al centro, zone grigio antracite più chiare e sfumate verso i bordi, come un muro da studio fotografico). Riferimento: `_brief/references/sfondo.jpg`. Ricrearlo in CSS (gradienti radiali/lineari sovrapposti), senza usare l'immagine come file. Deve restare fisso o muoversi pochissimo durante lo scroll, così la pagina sembra un unico ambiente.
- Logo: `assets/logo/MF-logo-bianco.svg` (bianco, vettoriale). Usarlo grande nell'apertura e piccolo nel menu; usarlo anche per generare la favicon.
- Tipografia: [da definire: font simili a quelli di synkron.xyz, da Google Fonts o self-hosted].

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
