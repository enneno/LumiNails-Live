const { test, expect } = require("playwright/test");
const { installSupabaseBoundaryMock } = require("./helpers/admin-reference-boundary");

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

async function openAdmin(page, tab) {
  await page.route("https://**/*", (route) => route.abort("blockedbyclient"));
  await installSupabaseBoundaryMock(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/admin/?tab=" + tab);
  await expect(page.locator("[data-admin-shell]")).toBeVisible();
  await expect(page.getByText("Adatok betöltése…", { exact: true })).toHaveCount(0);
}

test("gallery upload locks the native editor and preserves its draft and generated preview", async ({ page }) => {
  await openAdmin(page, "gallery");
  await page.getByRole("button", { name: "+ Kép", exact: true }).click();
  const dialog = page.locator("dialog[open]");
  const description = dialog.getByRole("textbox", { name: "Képleírás / alternatív szöveg", exact: true });
  await description.fill("Feltöltés előtt szerkesztett képleírás");
  await dialog.getByRole("switch", { name: "Magas kép", exact: true }).check();
  const selectionsBefore = await page.evaluate(() => {
    const content = window.LumiAdminBackend.snapshot().cms.content;
    return {
      home: content.fooldal.galeriaAtvezeto.kivalasztottKepek,
      nail: content.szolgaltatasOldalak.nailArt.kivalasztottKepek,
    };
  });
  await page.evaluate(() => {
    const original = window.LumiAdminBackend.upload;
    window.LumiAdminBackend.upload = async (...args) => {
      window.__galleryUploadCount = (window.__galleryUploadCount || 0) + 1;
      await new Promise((resolve) => { window.__releaseGalleryReviewUpload = resolve; });
      return original(...args);
    };
  });
  const file = dialog.locator('input[type="file"]');
  await file.setInputFiles({
    name: "sample.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6u4sAAAAASUVORK5CYII=", "base64"),
  });
  await page.waitForFunction(() => window.__galleryUploadCount === 1);
  await expect(description).toBeDisabled();
  await expect(file).toBeDisabled();
  await expect(dialog.getByLabel("Kép URL vagy fájlútvonal")).toBeDisabled();
  await expect(dialog.getByRole("switch", { name: "Magas kép", exact: true })).toBeDisabled();
  await expect(dialog.getByRole("button", { name: "Kép törlése", exact: true })).toBeDisabled();
  await page.evaluate(() => window.__releaseGalleryReviewUpload());
  await expect(dialog.getByLabel("Kép URL vagy fájlútvonal")).toHaveValue(/^https:\/\/images.example.test\/.+-full.webp$/);
  await expect(description).toBeEnabled();
  await expect(description).toHaveValue("Feltöltés előtt szerkesztett képleírás");
  await expect(dialog.getByRole("switch", { name: "Magas kép", exact: true })).toBeChecked();
  await description.fill("Feltöltés után mentett képleírás");
  await dialog.getByRole("button", { name: "Panel bezárása", exact: true }).click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  await page.locator("[data-admin-save]").click();
  await expect(page.locator("[data-admin-save]")).toHaveCount(0);
  const stored = await page.evaluate(() => {
    const content = window.__referenceSeed().site_settings.find((row) => row.key === "site_content").value;
    return {
      image: content.galeria.elemek.find((row) => row.kepAlt === "Feltöltés után mentett képleírás"),
      home: content.fooldal.galeriaAtvezeto.kivalasztottKepek,
      nail: content.szolgaltatasOldalak.nailArt.kivalasztottKepek,
      uploads: window.__galleryUploadCount,
    };
  });
  expect(stored.image.kep).toMatch(/-full.webp$/);
  expect(stored.image.eloKep).toMatch(/-preview.webp$/);
  expect(stored.image.magas).toBe(true);
  expect(stored.home).toEqual(selectionsBefore.home);
  expect(stored.nail).toEqual(selectionsBefore.nail);
  expect(stored.uploads).toBe(1);
});

test("content editor omits the obsolete booking lookup menu label without deleting stored content", async ({ page }) => {
  await openAdmin(page, "content");
  await expect(page.getByLabel("Foglalásom menüpont", { exact: true })).toHaveCount(0);
  const previous = await page.evaluate(() => window.LumiAdminBackend.snapshot().cms.content.navigacio.foglalasom);
  expect(previous).toBeTruthy();
  await page.getByLabel("Kezdőlap menüpont", { exact: true }).fill("Kezdőlap teszt");
  await page.locator("[data-admin-save]").click();
  await expect(page.locator("[data-admin-save]")).toHaveCount(0);
  const stored = await page.evaluate(() => window.__referenceSeed().site_settings.find((row) => row.key === "site_content").value.navigacio);
  expect(stored.foglalasom).toBe(previous);
  expect(stored.kezdolap).toBe("Kezdőlap teszt");
});
