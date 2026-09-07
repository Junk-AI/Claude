# Validation Notes

## Convene shared-link check — 2026-08-13

The Convene page loaded successfully with an `event` query parameter. The upcoming-event card, registration action, and past-event **Event Photos** action rendered after data loading completed. The inspected URL used event ID `1`, which did not correspond to the current upcoming event, so no detail modal was expected to open. The targeted unit tests cover valid event-ID parsing and stable share-link construction.

## Live shared-event validation — 2026-08-13

The live upcoming event ID was confirmed as `120002`. Opening `/convene?event=120002` immediately opened the **Network of Deeds by Kids September Webinar** detail modal, including its **Register for Event** action. This verifies the Admin CMS share-link format opens the intended detail and registration flow.

## Keyboard-accessible event details — 2026-08-13

The upcoming event title is now exposed as a semantic button with an explicit “View details” label. Activating it opens the event-detail modal and exposes the registration action, ensuring the same flow is available to keyboard and pointer users.

## Cross-page public UI review — 2026-08-13

The Connect page rendered its directory filters, member-card actions, labeled consent controls, and responsive card grid correctly. The Collaborate page rendered its public opportunities, member events, and collaboration form correctly, but two records with empty date values displayed **“Invalid Date – Invalid Date.”** This display defect will be corrected by rendering a neutral date label when either date is absent.

## Collaborate and Create verification — 2026-08-13

After the safe date-formatting fix, the Collaborate page shows **“Dates to be confirmed”** for opportunities without valid dates, with no residual “Invalid Date” text. The Create page rendered its search field, resource-type filters, resource cards, detail actions, and resource-sharing call to action with consistent hierarchy and reachable controls.
