# Overhoor

Een minimalistische web-app om woordenlijsten te maken en jezelf te overhoren.
Standaard in het Nederlands, Engels beschikbaar, met donkere en lichte modus.

A minimalistic web app to create word lists and test yourself.
Dutch by default, English available, with dark and light mode.

## Features

- Woordenlijsten maken en bewerken / Create and edit word lists
- Overhoren door te typen / Typing-based self-tests
- Flashcards
- Voortgang bijhouden (lokaal opgeslagen) / Progress tracking (stored locally)
- Lijsten delen via export/import / Share lists via export/import
- Nederlands (standaard) en Engels / Dutch (default) and English
- Donkere en lichte modus / Dark and light mode

## Development

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

```bash
npm run build
npm run deploy
```

Or build via GitHub Actions (see `.github/workflows/deploy.yml`) — the site is
served from the `gh-pages` branch at <https://snowy5233.github.io/Overhoor/>.
