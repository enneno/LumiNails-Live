const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { parseHTML } = require("linkedom");

const ROOT = path.resolve(__dirname, "..");
const SITE_ORIGIN = process.env.LUMI_SITE_ORIGIN || "http://127.0.0.1:8102";
const outputIndex = process.argv.indexOf("--out-dir");
const OUTPUT_ROOT = outputIndex >= 0 ? path.resolve(process.argv[outputIndex + 1]) : path.join(ROOT, 'dist');
if (OUTPUT_ROOT !== ROOT && !OUTPUT_ROOT.startsWith(ROOT + path.sep)) throw new Error("Output must stay inside the TEST workspace.");
const PAGE_PATHS = [
  ["index.html", "/"],
  ["404.html", "/404.html"],
  ["adatkezeles/index.html", "/adatkezeles/"],
  ["admin/index.html", "/admin/"],
  ["arlista/index.html", "/arlista/"],
  ["fiokom/index.html", "/fiokom/"],
  ["foglalas/index.html", "/foglalas/"],
  ["galeria/index.html", "/galeria/"],
  ["gel-lakk-tatabanya/index.html", "/gel-lakk-tatabanya/"],
  [
    "korom-diszites-nail-art-tatabanya/index.html",
    "/korom-diszites-nail-art-tatabanya/",
  ],
  ["manikur-tatabanya/index.html", "/manikur-tatabanya/"],
  ["mukorom-epites-toltes/index.html", "/mukorom-epites-toltes/"],
];
const SITEMAP_PATHS = [
  "/",
  "/mukorom-epites-toltes/",
  "/gel-lakk-tatabanya/",
  "/manikur-tatabanya/",
  "/korom-diszites-nail-art-tatabanya/",
  "/arlista/",
  "/galeria/",
  "/foglalas/",
];
const RENDER_SOURCES = [
  "src/public/10-default-content.js",
  "src/public/20-shell-coupons.js",
  "src/public/30-content-rendering.js",
  "src/public/40-footer-forms.js",
];

async function main() {
  const config = readPublicSupabaseConfig();
  const snapshot = await loadSnapshot(config);
  const headerHtml = read("src/html/site-header.html").trim();
  const footerHtml = read("src/html/site-footer.html").trim();
  const renderedFiles = new Map();

  for (const [relativePath, pathname] of PAGE_PATHS) {
    renderedFiles.set(
      relativePath,
      renderPage({
        relativePath,
        pathname,
        headerHtml,
        footerHtml,
        snapshot,
      }),
    );
  }
  for (const [relativePath, content] of renderedFiles) {
    fs.mkdirSync(path.dirname(path.join(OUTPUT_ROOT, relativePath)), { recursive: true });
    fs.writeFileSync(path.join(OUTPUT_ROOT, relativePath), content, "utf8");
  }
  writeSitemap();
  fs.writeFileSync(path.join(OUTPUT_ROOT, "adatok.json"), JSON.stringify(snapshot) + "\n");
  fs.writeFileSync(path.join(OUTPUT_ROOT, "deployment.json"), JSON.stringify({
    schemaVersion: 1, contentHash: snapshot.contentFingerprint,
    environment: process.env.LUMI_DEPLOY_ENV || "test", origin: SITE_ORIGIN,
    codeRevision: process.env.CF_PAGES_COMMIT_SHA || process.env.WORKERS_CI_COMMIT_SHA || "local",
    builtAt: new Date().toISOString(),
  }) + "\n");

  console.log(
    `PRERENDERED ${PAGE_PATHS.length} HTML oldal, ${snapshot.services.length} aktív szolgáltatás.`,
  );
}

function writeSitemap() {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = SITEMAP_PATHS.map(
    (pathname) => `    <url>\n        <loc>${SITE_ORIGIN}${pathname}</loc>\n        <lastmod>${lastmod}</lastmod>\n    </url>`,
  ).join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  fs.writeFileSync(path.join(OUTPUT_ROOT, "sitemap.xml"), sitemap, "utf8");
}

function renderPage({
  relativePath,
  pathname,
  headerHtml,
  footerHtml,
  snapshot,
}) {
  const source = read(relativePath);
  const { document, window } = parseHTML(source);
  const location = new URL(pathname, SITE_ORIGIN);
  Object.defineProperty(window, "location", {
    value: location,
    configurable: true,
  });

  const headerSlot = document.getElementById("fejlec-helye");
  const footerSlot = document.getElementById("lablec-helye");
  if (!headerSlot || !footerSlot) {
    throw new Error(
      `${relativePath}: hiányzik a közös fejléc vagy lábléc helye.`,
    );
  }
  headerSlot.innerHTML = headerHtml;
  headerSlot.dataset.prerenderedShell = "true";
  footerSlot.innerHTML = footerHtml;
  footerSlot.dataset.prerenderedShell = "true";

  const context = vm.createContext({
    window,
    document,
    CustomEvent: window.CustomEvent,
    Element: window.Element,
    NodeFilter: { SHOW_TEXT: 4 },
    URL,
    console,
    setTimeout,
    clearTimeout,
  });
  for (const sourcePath of RENDER_SOURCES) {
    vm.runInContext(read(sourcePath), context, { filename: sourcePath });
  }

  const defaults = context.lumiAlapOldalAdatok();
  const content = context.oldalAdatokNormalizalasa(
    context.melyOsszefesules(defaults, snapshot.siteContent),
    defaults,
  );
  if (snapshot.phoneVisible !== null) {
    content.kapcsolat.telefonLathato = snapshot.phoneVisible;
  }
  context.oldalAdatokAlkalmazasa(content);

  if (pathname === "/arlista/") {
    context.arlistaSzolgaltatasokRenderelese(
      snapshot.services.map(context.szolgaltatasArNormalizalasa),
    );
    context.arlistaErvenyessegMegjelenitese(snapshot.priceEffectiveAt);
    addPriceListStructuredData(document, snapshot.services);
  }

  syncSerializableImageAttributes(document);
  syncPortableAssetUrls(document);
  syncStructuredData(document, content, context.foglalasiIdorendSzovege);
  document.documentElement.dataset.lumiContentUpdatedAt =
    snapshot.contentUpdatedAt;
  document.documentElement.dataset.lumiContentFingerprint =
    snapshot.contentFingerprint;
  return `${document
    .toString()
    .trim()
    .replace(/[ \t]+$/gm, "")}\n`;
}

function syncPortableAssetUrls(document) {
  const absolutePrefix = `${SITE_ORIGIN}/`;
  document.querySelectorAll("[style]").forEach((element) => {
    const style = element.getAttribute("style") || "";
    if (style.includes(absolutePrefix)) {
      element.setAttribute("style", style.replaceAll(absolutePrefix, "/"));
    }
  });
}

function syncSerializableImageAttributes(document) {
  document.querySelectorAll(".galeria-racs img").forEach((image, index) => {
    image.setAttribute("loading", index < 3 ? "eager" : "lazy");
    image.setAttribute("decoding", "async");
    if (index === 0) image.setAttribute("fetchpriority", "high");
    else image.removeAttribute("fetchpriority");
  });
}

function syncStructuredData(document, content, hoursLabel) {
  const serviceKey = document.body?.dataset.szolgaltatasOldal;
  const serviceContent = serviceKey
    ? content.szolgaltatasOldalak?.[serviceKey]
    : null;

  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    let data;
    try {
      data = JSON.parse(script.textContent);
    } catch (_error) {
      continue;
    }

    if (serviceContent && Array.isArray(data["@graph"])) {
      const service = data["@graph"].find(
        (item) => item?.["@type"] === "Service",
      );
      const breadcrumb = data["@graph"].find(
        (item) => item?.["@type"] === "BreadcrumbList",
      );
      if (service) {
        service.name = serviceContent.cim;
        service.description = serviceContent.seoLeiras || serviceContent.leiras;
        if (serviceContent.kep)
          service.image = new URL(serviceContent.kep, SITE_ORIGIN).href;
      }
      if (breadcrumb?.itemListElement?.[1]) {
        breadcrumb.itemListElement[1].name = serviceContent.cim;
      }
      script.textContent = JSON.stringify(data, null, 2);
      continue;
    }

    const types = Array.isArray(data["@type"])
      ? data["@type"]
      : [data["@type"]];
    if (types.includes("NailSalon") || types.includes("BeautySalon")) {
      data.name = content.marka?.nev || data.name;
      data.description =
        content.seo?.fooldalLeiras ||
        content.marka?.rovidLeiras ||
        data.description;
      const hours = content.kapcsolat?.nyitvatartas;
      if (hours) {
        data.openingHoursSpecification = {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
          ],
          opens: hours.kezdes,
          closes: hours.vege,
        };
        data.description = [data.description, hoursLabel(hours), hours.megjegyzes]
          .filter(Boolean).join(" ");
      }
      if (content.seo?.megosztasiKep)
        data.image = new URL(content.seo.megosztasiKep, SITE_ORIGIN).href;
      if (data.address && content.kapcsolat?.cim)
        data.address.streetAddress = content.kapcsolat.cim;
      data.sameAs = [
        content.kapcsolat?.instagram,
        content.kapcsolat?.facebook,
      ].filter(Boolean);
      script.textContent = JSON.stringify(data, null, 2);
    }
  }
}

function addPriceListStructuredData(document, services) {
  document.getElementById("lumi-price-list-data")?.remove();
  const script = document.createElement("script");
  script.id = "lumi-price-list-data";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Lumi Nails árlista",
      itemListElement: services.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Service",
          name: service.name,
          description: [
            service.description,
            service.price_text,
            durationLabel(service.duration_minutes),
          ]
            .filter(Boolean)
            .join(" · "),
          provider: { "@id": `${SITE_ORIGIN}/#lumi-nails` },
          ...(buildServiceOffer(service) ? {
            offers: buildServiceOffer(service),
          } : {}),
          ...(Number(service.duration_minutes) > 0 ? {
            additionalProperty: [{
              "@type": "PropertyValue",
              name: "Időtartam",
              value: durationLabel(service.duration_minutes),
            }],
          } : {}),
        },
      })),
    },
    null,
    2,
  );
  document.head.appendChild(script);
}

function buildServiceOffer(service) {
  const amount = Number(service.price_amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const unit = String(service.price_unit || "").trim();
  const isUnitPrice = /^Ft\//i.test(unit);
  const offer = {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
  };

  if (isUnitPrice) {
    offer.priceSpecification = {
      "@type": "UnitPriceSpecification",
      price: amount,
      priceCurrency: "HUF",
      unitText: unit.replace(/^Ft\//i, ""),
    };
  } else {
    offer.price = amount;
    offer.priceCurrency = "HUF";
  }

  return offer;
}

function durationLabel(value) {
  const minutes = Number(value) || 0;
  if (minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours && remainder) return `${hours} óra ${remainder} perc`;
  if (hours) return `${hours} óra`;
  return `${remainder} perc`;
}

async function loadSnapshot(config) {
  const { loadPublicSnapshot, contentFingerprint } = await import('../supabase/functions/_shared/public-snapshot.mjs');
  const fixtureIndex = process.argv.indexOf('--snapshot');
  const snapshot = fixtureIndex >= 0
    ? JSON.parse(fs.readFileSync(process.argv[fixtureIndex + 1], 'utf8'))
    : await loadPublicSnapshot({ url: config.url, key: config.publishableKey });
  snapshot.contentFingerprint = await contentFingerprint(snapshot);
  return snapshot;
}

function readPublicSupabaseConfig() {
  const source = read("supabase-config.js");
  const url = source.match(/url:\s*'([^']+)'/)?.[1];
  const publishableKey = source.match(/publishableKey:\s*'([^']+)'/)?.[1];
  if (!url || !publishableKey)
    throw new Error("Hiányos nyilvános Supabase-konfiguráció.");
  return { url, publishableKey };
}

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

main().catch((error) => {
  console.error(`PRERENDER FAILED: ${error.stack || error.message}`);
  process.exitCode = 1;
});
