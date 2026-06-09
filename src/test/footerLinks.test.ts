import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import path from "path";

const root = path.resolve(__dirname, "../..");
const read = (p: string) => readFileSync(path.join(root, p), "utf8");

// Extract all internal <Link to="/..."> paths from the public Footer.
const footerSrc = read("src/components/Footer.tsx");
const linkRegex = /<Link\s+to="(\/[^"]*)"/g;
const footerPaths = Array.from(
  new Set(Array.from(footerSrc.matchAll(linkRegex), (m) => m[1]))
);

// Map known public routes -> page file in src/pages (from src/App.tsx routes).
const routeToPage: Record<string, string> = {
  "/": "src/pages/Index.tsx",
  "/about": "src/pages/About.tsx",
  "/planos": "src/pages/Plans.tsx",
  "/product": "src/pages/Product.tsx",
  "/help": "src/pages/Help.tsx",
  "/updates": "src/pages/Updates.tsx",
  "/status": "src/pages/Status.tsx",
  "/terms": "src/pages/Terms.tsx",
  "/privacy": "src/pages/Privacy.tsx",
  "/lgpd": "src/pages/LGPD.tsx",
  "/cookies": "src/pages/Cookies.tsx",
};

const appSrc = read("src/App.tsx");

describe("Footer links resolve to public pages", () => {
  it("Footer exposes at least one internal link", () => {
    expect(footerPaths.length).toBeGreaterThan(0);
  });

  it.each(footerPaths)("route %s maps to a known public page", (route) => {
    expect(routeToPage[route], `Unknown footer route: ${route}`).toBeDefined();
  });

  it.each(footerPaths)(
    "route %s is NOT wrapped in <ProtectedRoute> inside App.tsx",
    (route) => {
      // Match the <Route path="X" element={...}> block for this exact path.
      const re = new RegExp(
        `<Route\\s+path="${route.replace(/\//g, "\\/")}"[\\s\\S]*?<\\/Route>|<Route\\s+path="${route.replace(/\//g, "\\/")}"[^/]*\\/>`
      );
      const match = appSrc.match(re);
      expect(match, `Route ${route} not declared in App.tsx`).toBeTruthy();
      expect(match![0]).not.toMatch(/ProtectedRoute/);
    }
  );

  it.each(footerPaths)(
    "page for %s does NOT use the authenticated ResponsiveLayout or DashboardSidebar",
    (route) => {
      const pageFile = routeToPage[route];
      if (!pageFile) return;
      const src = read(pageFile);
      expect(src, `${pageFile} should not import ResponsiveLayout`).not.toMatch(
        /ResponsiveLayout/
      );
      expect(src, `${pageFile} should not import DashboardSidebar`).not.toMatch(
        /DashboardSidebar/
      );
    }
  );

  it.each(footerPaths.filter((p) => p !== "/"))(
    "page for %s renders public Navbar and Footer",
    (route) => {
      const pageFile = routeToPage[route];
      if (!pageFile) return;
      const src = read(pageFile);
      expect(src, `${pageFile} should import Navbar`).toMatch(
        /from\s+['"][^'"]*\/components\/Navbar['"]/
      );
      expect(src, `${pageFile} should import Footer`).toMatch(
        /from\s+['"][^'"]*\/components\/Footer['"]/
      );
    }
  );
});