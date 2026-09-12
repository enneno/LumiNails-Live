const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const { parseHTML } = require("linkedom");

const ROOT = path.resolve(__dirname, "..");
const SITE_ORIGIN = "https://luminails.hu";
const PAGE_PATHS = [
  ["index.html", "/"],
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
    fs.writeFileSync(path.join(ROOT, relativePath), content, "utf8");
  }

  console.log(
    `PRERENDERED ${PAGE_PATHS.length} HTML oldal, ${snapshot.services.length} aktív szolgáltatás.`,
  );
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
  syncStructuredData(document, content);
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

function syncStructuredData(document, content) {
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
            service.price_text,
            durationLabel(service.duration_minutes),
          ]
            .filter(Boolean)
            .join(" · "),
          provider: { "@id": `${SITE_ORIGIN}/#lumi-nails` },
        },
      })),
    },
    null,
    2,
  );
  document.head.appendChild(script);
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
  const serviceColumns =
    "name,description,price_text,price_amount,price_unit,price_suffix,duration_minutes,active,sort_order";
  const [services, settings] = await Promise.all([
    rest(config, "services", {
      select: serviceColumns,
      active: "eq.true",
      order: "sort_order.asc",
    }),
    rest(config, "site_settings", {
      select: "key,value,updated_at",
      key: "in.(site_content,arlista_ervenyesseg,telefon_lathato)",
    }),
  ]);

  if (!Array.isArray(services) || services.length === 0) {
    throw new Error(
      "A Supabase nem adott vissza aktív szolgáltatást; a korábbi oldal marad közzétéve.",
    );
  }
  const siteContent = row(settings, "site_content");
  if (!siteContent?.value || typeof siteContent.value !== "object") {
    throw new Error(
      "A site_content nem érhető el; a korábbi oldal marad közzétéve.",
    );
  }
  const priceEffective = row(settings, "arlista_ervenyesseg");
  const phoneSetting = row(settings, "telefon_lathato");

  return {
    services,
    siteContent: siteContent.value,
    contentUpdatedAt: siteContent.updated_at || new Date(0).toISOString(),
    priceEffectiveAt:
      priceEffective?.value?.effective_since ||
      priceEffective?.updated_at ||
      null,
    phoneVisible:
      typeof phoneSetting?.value?.visible === "boolean"
        ? phoneSetting.value.visible
        : null,
    contentFingerprint: crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          services,
          siteContent: siteContent.value,
          priceEffective: priceEffective?.value || null,
          phoneVisible: phoneSetting?.value?.visible ?? null,
        }),
      )
      .digest("hex")
      .slice(0, 20),
  };
}

function row(settings, key) {
  return Array.isArray(settings)
    ? settings.find((item) => item?.key === key)
    : null;
}

async function rest(config, table, query) {
  const url = new URL(`/rest/v1/${table}`, config.url);
  Object.entries(query).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  const response = await fetch(url, {
    headers: {
      apikey: config.publishableKey,
      Authorization: `Bearer ${config.publishableKey}`,
    },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) {
    throw new Error(
      `Supabase ${table} lekérés sikertelen (${response.status}).`,
    );
  }
  return response.json();
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
