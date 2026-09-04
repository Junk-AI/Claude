# Content provenance

## Sources

All flashcards, fill-in-the-blank sentences, drag-and-drop sets and exam questions are
encoded from the supplied topic notes and past papers. Where the supplied material
identified something as coming from student practice work rather than department notes,
it is flagged `supplementary: true` (flashcards) or `studentSourced: true` (questions)
and labelled as such in the UI.

## Questions with no official answer key

Two items were supplied without a full mark scheme. Both are marked in the data and
labelled in the UI so a student does not mistake structural guidance for a marked model:

- `ldq-deathrate` - "To what extent do you agree that a country's standard of living is
  the main factor affecting its death rate? [9]". Carries `noOfficialKey: true`. The
  rubric checks still run; the "model answer" is explicitly structural guidance pointing
  at the birth-rate essay as a template and the death-rate factor table as content.
- `ldq-housing-shortage` - EOY 2025 housing shortage essay. Carries `guidanceOnly: true`
  for the same reason.

## Figures that were not fabricated

See the "Data integrity" section of the README. In short: unsupplied years are `null`,
not interpolated; two figures are presented as described stimuli rather than invented
datasets.

## Known gaps

- The England homelessness series has no 2013 value in the source; the LA County series
  is missing 2013-2015 and 2018. Both are drawn dashed across the gap.
- The China rural population series is entirely approximate readings off the original
  graph, and the marker widens its value tolerance to 12% for it.
- The TFR comparison chart requested in the brief could not be built without inventing
  data, so it is a discussion prompt instead.
