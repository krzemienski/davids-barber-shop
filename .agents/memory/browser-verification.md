---
name: Browser verification with agent-browser
description: How to drive this app in a real browser here (session quirks, Clerk test sign-in, dialogs).
---

- Run `npx -y agent-browser` with `AGENT_BROWSER_EXECUTABLE_PATH=/repl/tools/bin/chromium`.
- Browser state does not survive between separate shell calls: chain open → act → check in ONE command. Use `state save/load <file>` to reuse a signed-in session.
- `find role button --name "Continue"` also matches "Continue with Google"; add `--exact`.
- Admin editors are scrolling dialogs: `scrollintoview "[data-testid=…]"` before clicking or the click is "covered".
- Native selects: `select "[data-testid=…]" "Label"` (find has no select action).
- Cross-origin iframes (e.g. Booksy widget): `frame "<css>"` fails; take `snapshot -i`, then `frame @<ref of the Iframe>`, act, and `frame main` to return.
- `fill <sel> ""` does not clear a React input; click it, `press Control+a`, `press Backspace`.
- Attribution is first-touch in localStorage: when checking several UTM URLs, run `eval "localStorage.clear()"` before `close`, or every page reports the first URL's UTMs.
- Clerk sign-in for checks: create a `+clerk_test@example.com` user via the Clerk API, add it to `admin_users`, sign in with email code `424242`; delete both afterwards.

**Why:** the user forbids test scripts; verification must be the real app driven by hand, and these quirks cost several retries.
**How to apply:** any end-user check of the public site or admin in this project.
