---
description: Check browser for UI issues or test features
---

// turbo-all

## Steps

1. Verify the dev server is running before opening the browser.
   Check for an active `npm run dev` process:
   ```
   lsof -i :3000 | grep LISTEN
   ```
   If nothing is returned (port 3000 is free), start the server first:
   ```
   cd /Users/loongnh/NextJSProject/coffee-time && npm run dev
   ```
   Wait for the `Ready on http://localhost:3000` message in the terminal before proceeding.

2. Only after confirming port 3000 is open, launch a browser subagent to test the UI.
