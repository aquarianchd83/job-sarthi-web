# job-sarthi-web

Angular 18 frontend for Job Sarthi (talks to `job-sarthi-api`). Setup, secrets, server install: see the API repo, `docs/SETUP.md`.

## Run

```bash
npm install
npm start          # http://localhost:4200  (API expected at http://localhost:5000)
npm run build      # production build in dist/job-sarthi-web/browser, calls the API at /api (same address)
```

Development API address: `src/environments/environment.ts`. The production build swaps in `environment.prod.ts`.

## Screens

Shortlist, Applications, Job Sources, Rules, Saved Answers, Resume & Profile, Skill Gap, Settings.
All dates arrive from the API as UTC and are shown in IST through the `istDate` pipe.
Screen designs: `docs/design-mockups/`. Layout: `docs/STRUCTURE.md`.
