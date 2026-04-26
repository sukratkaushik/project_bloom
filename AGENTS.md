# AI Studio Agent Instructions

These instructions define how the AI shouldn behave while updating the Bloom project.

## Development Workflow Rules

1. **Routing and Refreshes**: The app now utilizes hash-based routing. The root URL (`/` or `#/`) will always return the Landing Page by default. Inside the app, users reside at `/#dashboard`.
2. **Post-Update Navigation**: After making a code edit where the preview iframe refreshes, the app will correctly land back on the beautiful generic Landing Page because hot module reloading natively drops hashes.
3. Whenever the user is set up and logged in, the Landing Page will seamlessly adapt to show a "Go to Dashboard" / "Open Dashboard" button instead of the Google sign-in button.
4. **Logo Protection**: Never overwrite, regenerate, or modify `public/logo.png` or any files in `branding/logos/`. The logo is finalized.
5. **Sentry Initialization**: Never uncomment or re-enable the Sentry initialization in `src/main.tsx` — the DSN is a placeholder.
