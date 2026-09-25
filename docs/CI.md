# RepoThink CI and GitHub Pages

RepoThink uses GitHub Actions to build the Vite frontend and publish the static application to GitHub Pages.

- CI workflow: `.github/workflows/CI.yml`
- Pages deployment occurs on pushes to `main`.
- Build command: `npm install` then `npm run build` in `frontend/`.

The application remains local-first: repository contents are processed in the browser and are not uploaded by the Pages deployment.