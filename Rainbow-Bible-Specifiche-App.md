# Rainbow Bible — Specifica Completa per lo Sviluppo

---

## 1. Visione del Progetto

**Rainbow Bible** è un'app mobile (Android e iOS) per la lettura e l'esplorazione visuale della Bibbia, incentrata sulla visualizzazione dei collegamenti tra versetti dell'Antico e del Nuovo Testamento. L'app mostra in modo grafico e interattivo come profezie, citazioni e temi attraversino i millenni, collegando autori, libri e epoche diverse in un unico arcobaleno di connessioni.

L'ispirazione visiva è la celebre visualizzazione "Bible Cross-References" di Chris Harrison — un semicerchio di archi colorati che collegano i 66 libri della Bibbia. Rainbow Bible trasforma questa idea in un'esperienza interattiva e didattica.

### Obiettivi principali

- Permettere all'utente di esplorare i collegamenti tra i versetti della Bibbia tramite una visualizzazione ad archi interattiva.
- Per ogni collegamento, mostrare: i due versetti affiancati, gli autori, la distanza temporale tra i testi, il tipo di collegamento (profezia → compimento, saggezza, citazione, inclusione letteraria), e una spiegazione dettagliata di come e perché i testi sono collegati.
- Filtrare i collegamenti per categoria (profezia, saggezza, vangeli, epistole).
- Offrire un'estetica elegante, evocativa, con toni scuri tipo pergamena antica, accenti dorati e tipografia classica.
- Pubblicare su Google Play Store e Apple App Store.

---

## 2. Architettura dell'App — Panoramica

### Stack tecnologico raccomandato

L'app è sviluppata con **React Native + Expo** per garantire un singolo codebase per Android e iOS.

| Componente | Tecnologia |
|---|---|
| Framework | React Native con Expo (Managed Workflow) |
| Linguaggio | TypeScript |
| Navigazione | React Navigation (stack + bottom tabs) |
| Visualizzazione archi | React Native SVG (`react-native-svg`) |
| Gestione stato | Zustand oppure React Context |
| Dati | JSON locale embeddato nell'app (nessun backend necessario nella v1) |
| Animazioni | React Native Reanimated + Gesture Handler |
| Font custom | Google Fonts: Cinzel (titoli), EB Garamond (corpo testo) |
| Build e deploy | EAS Build (Expo Application Services) |
| Store | Google Play Store + Apple App Store |

### Perché React Native + Expo

- Singolo codebase TypeScript per entrambe le piattaforme.
- Expo semplifica enormemente il build, il deploy e la gestione dei certificati per gli store.
- `react-native-svg` supporta nativamente i path SVG necessari per la visualizzazione ad archi.
- Nessun modulo nativo richiesto: tutto è compatibile con Expo Managed Workflow.

---

## 3. Struttura del Progetto

```
rainbow-bible/
├── app/                          # Schermate (Expo Router file-based routing)
│   ├── _layout.tsx               # Layout root con navigazione
│   ├── index.tsx                 # Home — Visualizzazione archi
│   ├── detail/[id].tsx           # Dettaglio collegamento
│   └── settings.tsx              # Impostazioni (lingua, tema)
├── components/
│   ├── ArcVisualization.tsx      # Componente SVG principale con archi
│   ├── BookTimeline.tsx          # Linea base con etichette libri
│   ├── ArcPath.tsx               # Singolo arco SVG
│   ├── FilterBar.tsx             # Barra filtri per tipo di collegamento
│   ├── DetailPanel.tsx           # Pannello dettaglio con versetti e spiegazione
│   ├── VerseBlock.tsx            # Blocco singolo versetto (riferimento + testo)
│   ├── MetaTags.tsx              # Tag autore, periodo, tipo collegamento
│   └── Legend.tsx                # Legenda colori
├── data/
│   ├── books.ts                  # Array dei 66 libri con posizione, testamento, genere
│   ├── connections.ts            # Array dei collegamenti con tutti i metadati
│   └── types.ts                  # Definizioni TypeScript (Book, Connection, FilterType)
├── theme/
│   ├── colors.ts                 # Palette colori (parchment, gold, crimson, arc colors)
│   ├── typography.ts             # Stili tipografici (Cinzel, EB Garamond)
│   └── index.ts                  # Tema unificato
├── utils/
│   ├── arcGeometry.ts            # Calcoli geometrici per posizioni e curve degli archi
│   └── filters.ts                # Logica di filtraggio per tipo
├── assets/
│   ├── icon.png                  # Icona app (Rainbow Bible)
│   ├── splash.png                # Splash screen
│   └── fonts/                    # Font Cinzel e EB Garamond
├── app.json                      # Configurazione Expo
├── package.json
└── tsconfig.json
```

---

## 4. Modello Dati

### 4.1 Book (Libro della Bibbia)

```typescript
interface Book {
  id: string;          // Codice abbreviato, es. "Gen", "Isa", "Mat"
  name: string;        // Nome completo in italiano, es. "Genesi", "Isaia"
  position: number;    // Posizione normalizzata 0-1 sulla linea temporale
  testament: 'OT' | 'NT';
  genre: 'law' | 'history' | 'wisdom' | 'prophecy' | 'gospel' | 'epistle';
}
```

I 66 libri della Bibbia sono distribuiti lungo un asse orizzontale. L'Antico Testamento occupa circa il 72% dello spazio (posizioni 0.03 → 0.72), il Nuovo Testamento il restante 28% (0.76 → 0.97). Ogni libro ha un tick verticale e un'etichetta sotto la linea base.

### 4.2 Connection (Collegamento tra versetti)

```typescript
interface Connection {
  id: number;
  from: string;           // ID libro sorgente (es. "Gen")
  to: string;             // ID libro destinazione (es. "Joh")
  type: 'prophecy' | 'wisdom' | 'gospel' | 'epistle';
  color: string;          // Colore esadecimale dell'arco
  refA: string;           // Riferimento versetto A (es. "Genesi 3:15")
  refB: string;           // Riferimento versetto B (es. "Giovanni 3:16")
  textA: string;          // Testo completo del versetto A in italiano
  textB: string;          // Testo completo del versetto B in italiano
  explanation: string;    // Spiegazione dettagliata del collegamento teologico
  author_a: string;       // Autore e datazione testo A (es. "Mosè (attr.) — XIII sec. a.C.")
  author_b: string;       // Autore e datazione testo B (es. "Giovanni Apostolo — 90-100 d.C.")
  period: string;         // Distanza temporale (es. "~1.500 anni di distanza")
  link_type: string;      // Tipo specifico di collegamento (es. "Profezia → Compimento")
}
```

### 4.3 FilterType

```typescript
type FilterType = 'all' | 'prophecy' | 'wisdom' | 'gospel' | 'epistle';
```

---

## 5. Dettaglio Componenti UI

### 5.1 Schermata Principale — Visualizzazione Archi

La schermata principale è composta da, dall'alto in basso:

**Header**: titolo "RAINBOW BIBLE" in font Cinzel dorato con effetto glow, sottotitolo in corsivo.

**Barra Filtri (FilterBar)**: una riga di pulsanti orizzontali scrollabili con le categorie: "Tutti i collegamenti", "Profezia → Compimento", "Saggezza", "Vangeli", "Epistole". Il pulsante attivo ha bordo dorato e sfondo semi-trasparente. Quando si seleziona un filtro, gli archi non corrispondenti diventano quasi invisibili (opacity 0.08), quelli corrispondenti restano pienamente visibili.

**Visualizzazione SVG (ArcVisualization)**: il cuore dell'app. Un'area SVG con viewBox `0 0 900 340` che mostra:

- Una linea orizzontale dorata ("spina dorsale") a y=290 che rappresenta la sequenza dei libri della Bibbia.
- Tick verticali e etichette per ogni libro sotto la linea. I libri dell'AT sono color ambra, quelli del NT color lavanda.
- Archi parabolici (curve quadratiche SVG tipo `Q`) che collegano i libri. Ogni arco parte dal libro sorgente, si incurva verso l'alto proporzionalmente alla distanza tra i libri, e arriva al libro destinazione. Gli archi hanno colori diversi per tipo di collegamento, opacity 0.45 di default, glow effect tramite filtro SVG.
- Interazione: toccando un arco, questo si illumina (opacity 1, stroke-width 2.5) e tutti gli altri si oscurano. Si apre il pannello dettaglio.

**Pannello Dettaglio (DetailPanel)**: appare con animazione slide-up quando si tocca un arco. Contiene:

- Griglia a 3 colonne: Versetto A | Connettore visuale (linea + simbolo ⟷) | Versetto B.
- Ogni versetto mostra il riferimento biblico (es. "GENESI 3:15") in Cinzel dorato maiuscolo e il testo in corsivo EB Garamond.
- Sotto i versetti: sezione "ANALISI DEL COLLEGAMENTO" con la spiegazione dettagliata del legame teologico tra i testi.
- Sotto la spiegazione: meta-tag con: autore A (icona ✍), autore B (icona ✍), distanza temporale (icona ⏱), tipo di collegamento (icona 🔗). Ogni tag ha bordo colorato e stile diverso.

**Legenda**: in basso, una riga di pallini colorati con etichette: AT→AT (blu), Legge→Profezia (ambra), Profezia→Vangeli (verde), Vangeli→Epistole (rosso), AT→NT (viola), Saggezza (giallo).

### 5.2 Palette Colori

```typescript
const COLORS = {
  parchment: '#1a1208',      // Sfondo principale — pergamena scura
  gold: '#c9a84c',            // Accento primario — oro
  goldLight: '#e8c97a',       // Oro chiaro per hover/active
  crimson: '#8b1a1a',         // Rosso cremisi (accento secondario)
  ink: '#f0e6cc',             // Testo primario — inchiostro chiaro su fondo scuro
  inkDim: '#a89060',          // Testo secondario — ambra attenuata
  panelBg: '#0d0b06',         // Sfondo pannello dettaglio

  // Colori archi per tipo di collegamento
  arcOT: '#7ab3d4',           // Collegamento AT → AT (blu)
  arcLaw: '#d4a77a',          // Legge → Profezia (ambra)
  arcProphet: '#7ad4a7',      // Profezia → Vangeli (verde acqua)
  arcGospel: '#d47a7a',       // Vangeli → Epistole (rosso)
  arcEpistle: '#a77ad4',      // AT → NT generico (viola)
  arcWisdom: '#d4d47a',       // Saggezza (giallo)
};
```

### 5.3 Tipografia

| Elemento | Font | Peso | Dimensione | Stile |
|---|---|---|---|---|
| Titolo app | Cinzel | 900 | 28-48px (responsive) | Maiuscolo, letter-spacing 0.15em, glow dorato |
| Sottotitolo | EB Garamond | 400 | 16px | Corsivo |
| Filtri | Cinzel | 400 | 10-11px | Maiuscolo, letter-spacing 0.1em |
| Etichette libri | Cinzel | 400 | 5px (nell'SVG) | Maiuscolo |
| Riferimento versetto | Cinzel | 600 | 11px | Maiuscolo, letter-spacing 0.1em |
| Testo versetto | EB Garamond | 400 | 16-17px | Corsivo, line-height 1.7 |
| Spiegazione | EB Garamond | 400 | 16px | Normale, line-height 1.8 |
| Meta-tag | Cinzel | 400 | 10px | Maiuscolo |

---

## 6. Geometria degli Archi — Algoritmo

Ogni arco è una curva quadratica SVG (Bézier con un punto di controllo). La formula:

```typescript
function calculateArc(fromBook: Book, toBook: Book): string {
  const W = 900;              // Larghezza viewBox
  const BASELINE = 290;       // Y della linea base
  const MARGIN_L = 20;        // Margine sinistro
  const USABLE = 860;         // Larghezza utile

  const x1 = MARGIN_L + fromBook.position * USABLE;
  const x2 = MARGIN_L + toBook.position * USABLE;
  const midX = (x1 + x2) / 2;
  const span = Math.abs(x2 - x1);
  const height = Math.min(span * 0.55, 250);  // Altezza proporzionale alla distanza, max 250
  const controlY = BASELINE - height;

  return `M${x1},${BASELINE} Q${midX},${controlY} ${x2},${BASELINE}`;
}
```

L'altezza dell'arco è proporzionale alla distanza tra i libri: un collegamento Genesi→Apocalisse produce un arco altissimo che attraversa tutto il semicerchio, mentre un collegamento tra libri vicini produce un arco basso. Il cap a 250px evita che gli archi escano dal viewBox.

---

## 7. Dati dei Collegamenti — Prototipo Attuale

L'HTML prototipo contiene **12 collegamenti** già completi con tutti i metadati. Eccone l'elenco:

1. **Genesi 3:15 → Giovanni 3:16** — Il "protovangelo": prima promessa messianica → compimento nel Figlio di Dio. ~1.500 anni.
2. **Isaia 7:14 → Matteo 1:23** — La vergine partorirà l'Emmanuele. ~750 anni.
3. **Salmo 22:1 → Matteo 27:46** — "Dio mio, perché mi hai abbandonato?" — Davide → la croce. ~1.000 anni.
4. **Genesi 2:9 → Apocalisse 22:2** — L'albero della vita: dall'Eden alla Nuova Gerusalemme. ~1.400 anni.
5. **Deuteronomio 18:15 → Matteo 17:5** — "Un profeta come me" → la Trasfigurazione. ~1.300 anni.
6. **Giobbe 25:4 → Romani 3:23** — "Come può un uomo essere giusto?" → "Tutti hanno peccato". ~600-1.000 anni.
7. **Isaia 61:1 → Luca 4:18** — Lo Spirito del Signore → Gesù a Nazaret. ~750 anni.
8. **Michea 5:1 → Matteo 2:6** — La profezia su Betlemme. ~750 anni.
9. **Salmo 2:9 → Apocalisse 19:15** — Lo scettro di ferro: regalità messianica. ~1.050 anni.
10. **Genesi 12:3 → Matteo 1:1** — Promessa ad Abramo → genealogia di Gesù. ~1.300 anni.
11. **Ezechiele 1:4-10 → Apocalisse 4:6-8** — I quattro esseri viventi. ~650 anni.
12. **Esodo 12:46 → Giovanni 19:36** — "Non gli sarà spezzato alcun osso" — Pasqua → crocifissione. ~1.300 anni.

Per la versione completa dell'app, il dataset andrà espanso significativamente. Il file `connections.ts` può crescere a centinaia di voci. L'HTML contiene già tutti i testi dei versetti, le spiegazioni e i metadati per queste 12 connessioni.

---

## 8. Interazioni e Comportamenti

### Tocco su arco

1. L'arco selezionato si illumina: opacity → 1, stroke-width → 2.5.
2. Tutti gli altri archi si oscurano: opacity → 0.08 (classe "dimmed").
3. Il pannello dettaglio appare dal basso con animazione ease (translateY 12px → 0, fade in 350ms).
4. Lo schermo scrolla automaticamente per mostrare il pannello.

### Chiusura pannello

1. Pulsante ✕ in alto a destra nel pannello.
2. Tutti gli archi tornano all'opacity di default (0.45).
3. Il pannello scompare.

### Filtraggio

1. L'utente tocca un pulsante filtro.
2. Il pannello dettaglio si chiude se aperto.
3. Solo gli archi del tipo selezionato restano visibili; gli altri vanno a opacity 0.08.
4. Il pulsante attivo cambia stile (bordo dorato, sfondo semi-trasparente).
5. "Tutti i collegamenti" riporta tutti gli archi alla visibilità piena.

### Effetti visivi

- Grain overlay: una texture frattale SVG sovrapposta a tutto lo schermo (opacity 0.4) che simula la grana della pergamena.
- Glow sugli archi: filtro SVG `feGaussianBlur` con stdDeviation 2.
- Background gradient: radiale dal centro-basso (tono caldo) ai bordi (pergamena scura).

---

## 9. Requisiti per lo Sviluppo con Claude Code

### 9.1 Setup iniziale

```bash
# Installa Expo CLI
npx create-expo-app rainbow-bible --template blank-typescript

# Installa dipendenze core
npx expo install react-native-svg
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @react-navigation/native @react-navigation/stack
npx expo install expo-font
npx expo install expo-splash-screen
```

### 9.2 Priorità di sviluppo (ordine suggerito)

**Fase 1 — Core funzionante**
- Setup progetto Expo con TypeScript.
- Definire i tipi in `data/types.ts`.
- Creare `data/books.ts` con tutti i 66 libri.
- Creare `data/connections.ts` con i 12 collegamenti del prototipo.
- Implementare `ArcVisualization.tsx` con react-native-svg.
- Implementare `BookTimeline.tsx` con linea base e etichette.
- Implementare `ArcPath.tsx` con geometria Bézier e colori.
- Gestire touch su arco per selezionarlo.

**Fase 2 — Dettaglio e filtri**
- Implementare `DetailPanel.tsx` con i versetti affiancati e la spiegazione.
- Implementare `FilterBar.tsx` con i pulsanti filtro.
- Animazioni di ingresso pannello e dimming archi.
- Legenda colori.

**Fase 3 — Polish e design**
- Caricare e applicare font Cinzel e EB Garamond.
- Implementare la palette colori completa.
- Grain overlay e effetti glow.
- Responsive layout per diversi schermi.
- Splash screen e icona app.

**Fase 4 — Espansione contenuti**
- Aggiungere decine/centinaia di nuovi collegamenti.
- Ricerca testuale dei versetti.
- Navigazione libro per libro.
- Segnalibri o preferiti.

**Fase 5 — Pubblicazione**
- Configurare EAS Build per Android e iOS.
- Creare account Google Play Console e Apple Developer.
- Screenshot e descrizioni per gli store.
- Build di produzione e submit.

### 9.3 Istruzioni per Claude Code

Quando lavori con Claude Code su VS Code, puoi dare queste istruzioni:

**Prompt iniziale suggerito:**

> Crea un'app React Native con Expo in TypeScript chiamata "Rainbow Bible". L'app visualizza i collegamenti tra versetti dell'Antico e Nuovo Testamento usando archi colorati SVG. Usa react-native-svg per il rendering. Il tema è scuro (sfondo #1a1208, accenti dorati #c9a84c, testo #f0e6cc). Font: Cinzel per i titoli, EB Garamond per il corpo. I dati (libri e connessioni) sono file JSON/TS locali. La schermata principale mostra un SVG con viewBox 900x340, una linea base a y=290 con i 66 libri, e archi parabolici tra i libri collegati. Toccando un arco si apre un pannello con i due versetti, la spiegazione e i metadati (autore, periodo, tipo). Ci sono filtri per tipo di collegamento. Segui la specifica nel file Rainbow-Bible-Specifiche-App.md.

### 9.4 Requisiti tecnici minimi

- Node.js 18+
- Expo SDK 52+
- React Native 0.76+
- Account Apple Developer (€99/anno) per pubblicazione iOS
- Account Google Play Console ($25 una tantum) per pubblicazione Android
- EAS Build per creare i binari .apk/.aab (Android) e .ipa (iOS)

---

## 10. Codice Sorgente del Prototipo HTML

Il file `bible-crossref.html` allegato contiene il prototipo funzionante completo che serve da riferimento per l'app nativa. Il prototipo è un singolo file HTML con CSS e JavaScript inline che implementa tutte le funzionalità core: la visualizzazione SVG ad archi, i filtri, il pannello dettaglio e i 12 collegamenti con dati completi. Questo file deve essere usato come reference per replicare fedelmente l'esperienza visiva e interattiva nell'app React Native.

---

## 11. Roadmap Futura

- **Ricerca globale**: cercare versetti per testo o riferimento e vedere i collegamenti.
- **Modalità lettura**: leggere capitoli interi con i collegamenti evidenziati nel testo.
- **Multilingua**: supporto inglese, spagnolo, portoghese oltre all'italiano.
- **Dati offline**: tutti i dati sono già locali, ma in futuro si potrebbe aggiungere un backend per aggiornamenti dei contenuti.
- **Condivisione**: condividere un collegamento specifico come immagine o card sui social.
- **Dark/Light mode**: attualmente solo dark, aggiungere opzione light.
- **Audio**: ascoltare i versetti letti ad alta voce.
- **Notifica giornaliera**: un collegamento al giorno come notifica push devozionale.

---

*Documento generato come specifica di sviluppo per Rainbow Bible. Da usare come riferimento per Claude Code in VS Code.*
