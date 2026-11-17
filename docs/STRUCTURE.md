# job-sarthi-web - proposed structure

```
job-sarthi-web/
  proxy.conf.json                 /api -> http://localhost:5000
  src/
    environments/                 apiBaseUrl, useMock
    assets/mock/                  sources, jobs, applications, profile, rules, saved-answers, settings (JSON)
    app/
      app.config.ts / app.routes.ts / app.component.*
      core/
        models/                   TS interfaces mirroring API DTOs
        services/                 one HttpClient service per feature
        interceptors/             api-error
        utils/ist-date.ts         UTC -> IST formatter (Intl, Asia/Kolkata)
      shared/
        pipes/ist-date.pipe.ts    all dates go through this
        components/               capability-badge, status-chip
      features/
        resume-profile/   (screen 1)   job-sources/ (2)   rules/ (3)   saved-answers/ (4)
        shortlist/ (5)    applications/ (6, + application-detail)    settings/ (7)
```

Routes: /profile, /sources, /rules, /saved-answers, /shortlist, /applications, /settings.
Timezone rule: API returns UTC ISO strings; only `istDate` pipe / `formatIst()` convert for display.