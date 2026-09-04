# Geo Revise

A Secondary 2 Geography revision platform covering three topics: **Population Studies**,
**Housing in Cities**, and **Transport Systems in Cities**.

React + Vite, no backend. All progress is kept in `localStorage` on the device.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in dist/
```

## Structure

```
src/
  content/          all seed material - edit here, not in components
    data.js           entry point; components import only from this
    topics.js         topic names and accent colours
    population.js     glossary, flashcards, fill-in-the-blanks, drag-and-drop
    housing.js        "
    transport.js      "
    datasets.js       the DRQ chart data
    questions.js      exam question bank, each with its own mark scheme
    reference.js      GSE method, trend vocabulary, level descriptors, examiner framework
  lib/
    marking.js        the marker
    text.js           text helpers used by the marker
    storage.js        progress persistence and mastery calculation
    deck.js           weighted resurfacing for flashcards
  components/       UI only; no content lives here
```

### Adding content

Append to the arrays in the relevant topic file. Nothing else needs to change.

- **Flashcard**: `{ id, front, back }`
- **Fill in the blank**: `{ id, text: 'Singapore\'s TFR fell to ___ in ___.', blanks: [{ answers: ['1.04'], hint: '2 d.p.' }, ...] }` - one `___` per entry in `blanks`, in order. `answers` is a list of accepted spellings; matching ignores case, commas, `$` and `%`.
- **Drag and drop**: `{ id, type: 'match' | 'sequence' | 'categorise', title, prompt, ... }` - `match` takes `pairs`, `sequence` takes `items` in the correct order, `categorise` takes `categories` and `items`.
- **Question**: add to `QUESTIONS` in `questions.js` with a `marking` object (see below), then reference its `id` from an entry in `EXAM_PAPERS` if it should appear in a paper.

## The marker

Test Mode marks against the **specific mark scheme attached to each question**, never a
generic rubric. Four scheme kinds:

| `marking.kind` | Used for | How it awards |
| --- | --- | --- |
| `gse` | DRQs | Computes the general trend, the steepest segment and the exception directly from the seeded dataset, then checks the answer for period, trend direction and quoted evidence. Cross-checks every figure quoted against the real data and flags misquotes. |
| `points` | Short answers | One mark per scheme point; a point is awarded when every keyword group in its `all` array is matched. |
| `options` | "Explain two factors/ways/strategies" | 1 mark to identify plus 1 to develop, per option, capped at `maxOptions`. Naming the same factor twice cannot score twice. |
| `essay` | 9-mark LDQs | Applies the L1/L2/L3 descriptors: stand, two factors, place-based examples, reasoning chain, two-sided comparison, and an explicit geographical criterion in the conclusion. |

On top of the mark, **Examiner Mode** reports against the six-part framework
(question demand, best argument, precise evidence, reasoning chain, top-band
discriminator, trap avoidance) and names any of the four common weak-answer
patterns the response fell into.

### What the marker is, and is not

It is a **deterministic rubric engine running in the browser**. It reads an answer for
the things the mark scheme actually rewards. It is not a language model: it cannot
credit an unusual but valid phrasing the way a teacher would, and it can be fooled by
keyword-stuffing. Treat a mark from it as a structured self-check, not a grade.

Every model answer in the question bank is regression-tested against its own scheme;
all of them score full marks or within one mark of full.

## Data integrity in the DRQ charts

`content/datasets.js` records **only the values actually stated in the source paper or
answer key**. Years the source did not supply are stored as `null` and drawn as a dashed
bridge with a visible note, rather than interpolated to make the line look smooth.
Values the source itself gave as approximations carry `approx: true`, and the marker
widens its tolerance for them.

Two figures are deliberately **not charted**, because the source describes their shape
but supplies too few anchor points to draw one honestly:

- the world under-5 population figure, presented as a described stimulus instead;
- the TFR comparison (Singapore vs East Asian societies vs Nordic countries), kept as a
  comparative discussion prompt.

Material drawn from student practice papers rather than department notes is flagged in
the UI as student-sourced.

## Exam Mode

Standard 1 h 15 min or extended 1 h 30 min, with the real paper's cover instructions,
a countdown, auto-submit at zero and no feedback until the whole paper is in. Three
papers are defined in `EXAM_PAPERS`, each 32 marks in the 6 + 4 + 4 + 4 + 5 + 9 shape.
The report gives a per-question breakdown, essay level, a weak-area summary by topic,
and an Examiner Mode round-up of recurring traps and missed discriminators.
