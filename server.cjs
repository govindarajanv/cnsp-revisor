var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_google_auth_library = require("google-auth-library");
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
app.use((0, import_cookie_parser.default)());
var clientId = process.env.GOOGLE_CLIENT_ID;
var clientSecret = process.env.GOOGLE_CLIENT_SECRET;
var sessionSecret = process.env.SESSION_SECRET || "default_secret_for_dev_only";
var getRedirectUri = (req) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const base = process.env.APP_URL || `${proto}://${host}`;
  return `${base}/api/auth/callback`;
};
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/auth/url", (req, res) => {
  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Google OAuth credentials not configured." });
  }
  const redirectUri = getRedirectUri(req);
  const oauth2Client = new import_google_auth_library.OAuth2Client(clientId, clientSecret, redirectUri);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ],
    prompt: "consent"
  });
  res.json({ url: authUrl });
});
app.get("/api/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== "string") {
    return res.status(400).send("Invalid code");
  }
  if (!clientId || !clientSecret) {
    return res.status(500).send("OAuth not configured");
  }
  try {
    const redirectUri = getRedirectUri(req);
    const oauth2Client = new import_google_auth_library.OAuth2Client(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    const oauth2 = await oauth2Client.request({ url: "https://www.googleapis.com/oauth2/v2/userinfo" });
    const userData = oauth2.data;
    const token = import_jsonwebtoken.default.sign(userData, sessionSecret, { expiresIn: "7d" });
    res.cookie("token", token, {
      secure: true,
      sameSite: "none",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    });
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("Error during authentication callback:", err);
    res.status(500).send(`Authentication failed: ${err.message}`);
  }
});
app.get("/api/auth/user", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ user: null });
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, sessionSecret);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ user: null });
  }
});
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    secure: true,
    sameSite: "none",
    httpOnly: true
  });
  res.json({ success: true });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
