/**
 * cPanel/Passenger-friendly startup file.
 *
 * cPanel "Setup Node.js App" runs `node <startup_file>` and expects the server
 * to listen on process.env.PORT.
 */

// Ensure Next.js resolves `.next`, `public/`, etc from the app root.
process.chdir(__dirname);

const fs = require("fs");
const path = require("path");

const standaloneServer = path.join(__dirname, ".next", "standalone", "server.js");

if (fs.existsSync(standaloneServer)) {
  // In standalone builds, Next provides its own server entry.
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(standaloneServer);
  return;
}

const http = require("http");
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    http
      .createServer((req, res) => handle(req, res))
      .listen(port, hostname, () => {
        // eslint-disable-next-line no-console
        console.log(`> Ready on http://${hostname}:${port}`);
      });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("Failed to start server", err);
    process.exit(1);
  });
