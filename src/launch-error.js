/**
 * Playwright reports a browser that won't start as a multi-line ASCII banner
 * (F-27). This maps the message to one line that names the fix; the caller
 * prints the raw text only under --debug. Returns null for anything that is
 * not a browser failure. Lives outside cli.js, which parses argv on import,
 * so tests can feed it Playwright's own messages.
 */
export function launchErrorLine(msg, version) {
  // Checked first: this banner's own fix, `npx playwright install-deps`,
  // also matches the "playwright install" test below.
  // The loader line covers a launch where Playwright skipped its own check
  // (a restored browser cache can carry its "validated" marker).
  if (/Host system is missing dependencies to run browsers|error while loading shared libraries/.test(msg)) {
    // No sudo prefix: install-deps elevates itself, and `sudo npx` loses an
    // nvm-installed npx from PATH.
    return `Error: this system is missing libraries the headless browser needs. Install them with: npx playwright@${version} install-deps chromium`;
  }
  // Windows says "dependencies!" and names its own fix (the Visual C++
  // redistributable, Media Foundation), which install-deps does not cover:
  // the caller prints Playwright's text as is.
  if (/Host system is missing dependencies!/.test(msg)) return null;
  if (/Executable doesn't exist|playwright install/i.test(msg)) {
    return `Error: could not launch the headless browser. Install it with: npx playwright@${version} install chromium`;
  }
  if (/browserType\.launch|Failed to launch|Target page, context or browser has been closed/i.test(msg)) {
    const first = msg.split("\n").find((l) => l.trim()).trim();
    return `Error: the headless browser failed (${first}). Run with --debug for the full log.`;
  }
  return null;
}
