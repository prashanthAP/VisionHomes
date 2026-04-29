# GitHub Actions Workflows

This project uses GitHub Actions for CI/CD automation. The workflows are located in `.github/workflows/`.

## Workflows

### 1. CI Pipeline (`ci.yml`)

**Triggers:** Push to `main`/`develop` branches or Pull Requests

**Actions:**

- Installs dependencies using pnpm
- Builds the project with Vite
- Tests against Node.js 18.x and 20.x
- Uploads build artifacts for 5 days

**Configuration:**

- Uses pnpm for dependency management
- Caches dependencies between runs for faster builds
- Runs on Ubuntu latest

### 2. GitHub Pages Deployment (`deploy.yml`)

**Triggers:** Push to `main` branch or manual workflow dispatch

**Actions:**

- Builds the project
- Uploads artifacts to GitHub Pages
- Deploys to your GitHub Pages site

**Setup Required:**

1. Go to your repository settings → Pages
2. Set "Build and deployment" source to "GitHub Actions"
3. Ensure your `vite.config.ts` has the correct `base` path if deployed to a subdirectory

### 3. CodeQL Security Analysis (`codeql.yml`)

**Triggers:** Push to `main`/`develop` branches, PRs, and weekly schedule

**Actions:**

- Performs static code analysis for security vulnerabilities
- Analyzes TypeScript/JavaScript code
- Reports findings in the Security tab

## Local Development

These workflows mirror your local development:

```bash
pnpm install    # Install dependencies
pnpm build      # Build for production
pnpm dev        # Development server
```

## Customization

### Adding Tests

If you add a test script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

Update `ci.yml` to include:

```yaml
- name: Run tests
  run: pnpm test
```

### Changing Deployment Target

Modify `deploy.yml` to deploy to services like Vercel, Netlify, or AWS instead of GitHub Pages.

### Node Version

Update the `node-version` matrix in `ci.yml` to test different Node versions.

## Status Badges

Add these badges to your README.md:

```markdown
[![CI](https://github.com/YOUR_USERNAME/VisionHomes/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/VisionHomes/actions/workflows/ci.yml)
[![Deploy](https://github.com/YOUR_USERNAME/VisionHomes/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/VisionHomes/actions/workflows/deploy.yml)
```

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Ensure pnpm lock file is up to date
- Verify Node version compatibility

### Deployment Fails

- Enable GitHub Pages in repository settings
- Check the deployment logs in the Actions tab
- Verify the `base` configuration in `vite.config.ts` if using a subdirectory

### Cache Issues

- Clear cache manually from Actions → all workflows → Clear all caches
- Workflows will rebuild the cache on next run
