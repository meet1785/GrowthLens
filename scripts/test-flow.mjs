/**
 * End-to-end smoke test: register → login → dashboard → analysis → reports
 * Run with: node scripts/test-flow.mjs
 */

const BASE = "http://localhost:3000";

async function req(url, opts = {}) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: r.status, body, headers: r.headers };
}

async function getCsrfToken(cookieJar) {
  const r = await fetch(`${BASE}/api/auth/csrf`, {
    headers: cookieJar.get() ? { cookie: cookieJar.get() } : {},
  });
  cookieJar.set(r.headers.getSetCookie ? r.headers.getSetCookie() : r.headers.get("set-cookie"));
  const data = await r.json();
  return data.csrfToken;
}

// Minimal cookie jar for Node fetch
function createCookieJar() {
  const store = {};
  return {
    get() {
      return Object.entries(store)
        .map(([k, v]) => `${k}=${v}`)
        .join("; ");
    },
    set(headerVal) {
      if (!headerVal) return;
      // getSetCookie() returns an array; get() may return a comma-joined string
      const parts = Array.isArray(headerVal)
        ? headerVal
        : headerVal.split(/,(?=[^;]*=)/); // rough comma-split avoiding max-age etc.
      for (const part of parts) {
        const seg = part.split(";")[0].trim();
        const eq = seg.indexOf("=");
        if (eq === -1) continue;
        store[seg.slice(0, eq).trim()] = seg.slice(eq + 1).trim();
      }
    },
  };
}

function pass(msg) { console.log(`  ✅ ${msg}`); }
function fail(msg) { console.log(`  ❌ ${msg}`); process.exitCode = 1; }

async function run() {
  console.log("\n🧪  GrowthLens End-to-End Smoke Test\n");

  // ── 1. Landing page ─────────────────────────────────────────────────────────
  console.log("1️⃣  Landing page");
  const landing = await req(`${BASE}/`);
  landing.status === 200 ? pass("GET / → 200") : fail(`GET / → ${landing.status}`);

  // ── 2. Sign-up page loads ────────────────────────────────────────────────────
  console.log("\n2️⃣  Sign-Up page");
  const signupPage = await req(`${BASE}/auth/signup`);
  signupPage.status === 200 ? pass("GET /auth/signup → 200") : fail(`→ ${signupPage.status}`);

  // ── 3. Register a fresh user via API ─────────────────────────────────────────
  console.log("\n3️⃣  Register API");
  const ts = Date.now();
  const regRes = await req(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Tester",
      email: `smoke_${ts}@growthlens.app`,
      password: "Smoke@1234",
    }),
  });
  regRes.body?.success ? pass(`Registered smoke_${ts}@growthlens.app`) : fail(JSON.stringify(regRes.body));

  // ── 4. Duplicate-email guard ──────────────────────────────────────────────────
  const dupRes = await req(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Demo", email: "demo@growthlens.app", password: "Demo@1234" }),
  });
  (!dupRes.body?.success && dupRes.status === 409) ? pass("Duplicate email rejected (409)") : fail(`Dup guard: ${JSON.stringify(dupRes.body)}`);

  // ── 5. Credentials sign-in ────────────────────────────────────────────────────
  console.log("\n4️⃣  Sign-In (credentials)");
  const jar = createCookieJar();
  const csrfToken = await getCsrfToken(jar);
  pass(`CSRF token acquired: ${csrfToken.slice(0, 12)}…`);

  const params = new URLSearchParams({
    email: "demo@growthlens.app",
    password: "Demo@1234",
    csrfToken,
    callbackUrl: `${BASE}/dashboard`,
    json: "true",
  });

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      cookie: jar.get(),
    },
    body: params.toString(),
    redirect: "manual",
  });
  jar.set(loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : loginRes.headers.get("set-cookie"));

  const hasCookie =
    jar.get().includes("authjs.session-token") ||
    jar.get().includes("next-auth.session-token");

  hasCookie
    ? pass("Session cookie set – user is authenticated")
    : fail(`No session cookie. Cookies: ${jar.get().slice(0, 120)}`);

  // ── 6. Session endpoint ───────────────────────────────────────────────────────
  console.log("\n5️⃣  Session endpoint");
  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { cookie: jar.get() },
  });
  const sessionBody = await sessionRes.json();
  sessionBody?.user?.email === "demo@growthlens.app"
    ? pass(`Session returns user: ${sessionBody.user.email}`)
    : fail(`Session user mismatch: ${JSON.stringify(sessionBody)}`);

  // ── 7. Protected dashboard ────────────────────────────────────────────────────
  console.log("\n6️⃣  Dashboard (protected)");
  const dashRes = await fetch(`${BASE}/dashboard`, {
    headers: { cookie: jar.get() },
  });
  dashRes.status === 200
    ? pass("GET /dashboard → 200 (authenticated)")
    : fail(`/dashboard → ${dashRes.status}`);

  // ── 8. Analysis list API ──────────────────────────────────────────────────────
  console.log("\n7️⃣  Analysis API");
  const analyses = await fetch(`${BASE}/api/analysis`, {
    headers: { cookie: jar.get() },
  });
  const aBody = await analyses.json().catch(() => null);
  analyses.status === 200
    ? pass(`GET /api/analysis → 200 (${aBody?.data?.length ?? 0} records)`)
    : fail(`/api/analysis → ${analyses.status}`);

  // ── 9. Reports list ───────────────────────────────────────────────────────────
  console.log("\n8️⃣  Reports page");
  const reportsPage = await fetch(`${BASE}/reports`, {
    headers: { cookie: jar.get() },
  });
  reportsPage.status === 200
    ? pass("GET /reports → 200")
    : fail(`/reports → ${reportsPage.status}`);

  // ── Summary ───────────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────");
  if (process.exitCode === 1) {
    console.log("🔴  Some tests FAILED – see above.\n");
  } else {
    console.log("🟢  All smoke tests PASSED!\n");
  }
}

run().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
