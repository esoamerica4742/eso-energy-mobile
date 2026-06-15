# ESO Monitoring — Maestro smoke flows

Requires [Maestro](https://maestro.mobile.dev/) and a dev client or Expo Go build.

```bash
maestro test .maestro/monitoring-smoke.yaml
```

For signed-in E2E (add site, link device, export report), run against a production EAS build with test credentials configured in your CI secrets.
