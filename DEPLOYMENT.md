# Interview Compass deployment

Destination: https://github.com/Vipul10708/Interview-Compass

The app is ready for GitHub Pages. It uses relative asset URLs and the included GitHub Actions workflow builds, tests, and publishes `dist`.

1. Upload the source files from `release-upload` to the repository root, including `.github/workflows/pages.yml`.
2. In repository Settings → Pages, select **GitHub Actions** as the source.
3. Open Actions → **Publish study tracker** → **Run workflow** on `main`.
4. After the deployment succeeds, open https://vipul10708.github.io/Interview-Compass/ and verify the calendar, topic checkboxes, and dashboard.

Progress is saved separately in each browser. Use Plan & backup export/import to transfer it between laptops. Hosting does not provide automatic synchronization. No personal progress backup is included in the source package.

Release validation: all 19 automated tests and the production build passed. The home calendar was reset at the user's request to zero completed, partial, and missed days, with October 5, 2026 retained as the start date. This browser-specific setting does not become a public default through deployment.
