const { test, expect } = require("playwright/test");
const {
  installSupabaseBoundaryMock,
  fixtures,
} = require("./helpers/admin-reference-boundary");

async function openAdmin(page, tab = "bookings", overrides = {}) {
  await page.route("https://*.supabase.co/**", (route) =>
    route.abort("blockedbyclient"),
  );
  await installSupabaseBoundaryMock(page, overrides);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/admin/?tab=" + tab);
  await expect(
    page.locator("#admin-reference-root [data-admin-shell]"),
  ).toBeVisible();
  await expect(
    page.getByText("Adatok betöltése…", { exact: true }),
  ).toHaveCount(0);
}

test("reference UI boot, own data, copied cards and controls", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page);
  await expect(page.locator("#admin-reference-root main article")).toHaveCount(
    6,
  );
  await page.screenshot({
    path: ".impeccable/review/reference-actual-cards-390.png",
  });
  expect(errors).toEqual([]);
});

async function choose(page, label, option) {
  await page.getByRole("button", { name: label }).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}
async function closeEditor(page) {
  await page
    .locator("dialog[open]")
    .getByRole("button", { name: "Panel bezárása" })
    .click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
}
async function save(page) {
  await page.locator("[data-admin-save]").click();
  await expect(page.locator("[data-admin-save]")).toHaveCount(0);
}
async function navigate(page, name) {
  await page
    .getByRole("navigation", { name: "Admin menü", exact: true })
    .getByRole("button", { name: new RegExp("^" + name + "(?: [0-9]+)?$") })
    .click();
  await expect(
    page.getByText("Adatok betöltése…", { exact: true }),
  ).toHaveCount(0);
}

test("reference pagination, compact source geometry, dropdown and swipe", async ({
  page,
}) => {
  const seed = fixtures(),
    future = seed.bookings[2];
  seed.bookings = Array.from({ length: 24 }, (_, index) => ({
    ...future,
    id: "test-booking-" + index,
    public_reference: "TEST-" + index,
    customer_name: "Teszt vendég " + index,
    status: "confirmed",
    starts_at: new Date(Date.now() + (index + 2) * 86400000).toISOString(),
    ends_at: new Date(
      Date.now() + (index + 2) * 86400000 + 3600000,
    ).toISOString(),
  }));
  seed.blocked_times = [];
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page, "bookings", seed);
  const pager = page.getByRole("navigation", {
    name: /Foglalási lista lapozása felül/,
  });
  await expect(pager).toBeVisible();
  expect(await pager.getByRole("button").allTextContents()).toEqual([
    "«",
    "‹",
    "›",
    "»",
  ]);
  const search = await page.getByRole("searchbox").boundingBox(),
    pagerBox = await pager.boundingBox();
  expect(pagerBox.y).toBeGreaterThan(search.y);
  expect(pagerBox.x).toBeGreaterThan(200);
  const card = page.locator("#admin-reference-root main article").first();
  expect((await card.boundingBox()).height).toBeLessThan(115);
  const name = await card
      .getByText("Teszt vendég 0", { exact: true })
      .boundingBox(),
    badge = await card.getByText("#TEST-0", { exact: true }).boundingBox();
  expect(Math.abs(name.y - badge.y)).toBeLessThan(8);
  await pager
    .getByRole("button", { name: "Következő oldal", exact: true })
    .click();
  await expect(pager).toContainText("2 / 3");
  await pager.getByRole("button", { name: "Utolsó oldal" }).click();
  await expect(pager).toContainText("3 / 3");
  await pager.getByRole("button", { name: "Első oldal" }).click();
  await choose(page, /Foglalási állapot szűrő/, "Teljesítve");
  await expect(page.getByText("0 találat", { exact: true })).toBeVisible();
  await choose(page, /Foglalási állapot szűrő/, "Minden állapot");
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("booking drafts and payment preserve existing transaction; failed save retains draft", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAdmin(page);
  await choose(page, /Kiss Dorka foglalási állapota/, "Megerősítve");
  await navigate(page, "Áttekintés");
  await navigate(page, "Foglalások");
  await expect(page.locator("[data-admin-save]")).toBeVisible();
  await save(page);
  expect(
    await page.evaluate(
      () =>
        window
          .__referenceSeed()
          .bookings.find((row) => row.customer_name === "Kiss Dorka").status,
    ),
  ).toBe("confirmed");
  await page
    .locator("#admin-reference-root main article")
    .filter({ hasText: "Nagy Anna" })
    .getByRole("button", { name: /10:00/ })
    .click();
  await page.getByLabel("Fizetett összeg", { exact: true }).fill("7500");
  await page.getByLabel("Fizetett összeg", { exact: true }).press("Enter");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          window
            .__referenceSeed()
            .bookings.find((row) => row.customer_name === "Nagy Anna")
            .paid_amount,
      ),
    )
    .toBe(7500);
  expect(
    await page.evaluate(
      () =>
        window
          .__referenceSeed()
          .bookings.find((row) => row.customer_name === "Nagy Anna").status,
    ),
  ).toBe("done");
  await closeEditor(page);
  await page
    .locator("#admin-reference-root main article")
    .filter({ hasText: "Adminisztracio" })
    .getByRole("button", { name: /08:00/ })
    .click();
  await page.getByLabel("Fizetett összeg", { exact: true }).fill("4000");
  await page.getByLabel("Fizetett összeg", { exact: true }).press("Enter");
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__referenceSeed().blocked_times[0].paid_amount,
      ),
    )
    .toBe(4000);
  expect(
    await page.evaluate(() => window.__referenceSeed().blocked_times[0].status),
  ).toBe("done");
  await closeEditor(page);
  await choose(page, /Toth Luca foglalási állapota/, "Általam lemondva");
  await page.evaluate(() => (window.__adminBookingConflict = true));
  await page.locator("[data-admin-save]").click();
  await expect(page.locator("[data-admin-save]")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        window
          .__referenceSeed()
          .bookings.find((row) => row.customer_name === "Toth Luca").status,
    ),
  ).toBe("confirmed");
});

test("copied calendar and week views, manual entry with automatic duration", async ({
  page,
}) => {
  const seed = fixtures();
  seed.services = seed.services.map((row) => ({
    ...row,
    booking_enabled: true,
  }));
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page, "bookings", seed);
  await page.getByRole("button", { name: "Naptár", exact: true }).click();
  await expect(page.locator("#admin-reference-root main")).toContainText(
    "Kézi időpont / kieső idő",
  );
  await page.getByRole("button", { name: "Hét", exact: true }).click();
  await expect(page.getByText("Foglalási nézet", { exact: true })).toHaveCount(
    0,
  );
  await page
    .getByRole("navigation", { name: "Mobil admin eszköztár" })
    .getByRole("button", { name: "Új idő", exact: true })
    .click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toContainText("Új kézi időpont");
  await dialog.locator('[data-service-id="service-1"]').click();
  const inputs = dialog.locator('input[type="time"]');
  await expect(inputs.nth(1)).toHaveValue("11:00");
  await dialog
    .getByLabel("Név", { exact: false })
    .fill("Szintetikus kézi próba");
  const date = new Date(Date.now() + 10 * 86400000).toLocaleDateString("sv-SE");
  await dialog.locator('input[type="date"]').fill(date);
  await dialog.getByRole("button", { name: "Időpont felvétele" }).click();
  await expect(page.locator("dialog[open]")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      window
        .__referenceSeed()
        .blocked_times.some((row) => row.reason === "Szintetikus kézi próba"),
    ),
  ).toBe(true);
});

test("prices keep own visibility, unit and optimistic version; conflict is not success", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAdmin(page, "prices");
  await page
    .getByRole("button", { name: /Erositett gel lakk.*1 szolgáltatás/ })
    .click();
  const dialog = page.locator("dialog[open]");
  await dialog.getByLabel("Ár egysége", { exact: true }).fill("Ft / alkalom");
  await dialog
    .getByLabel("Rövid név a foglalóban", { exact: true })
    .fill("Új rövid név");
  await closeEditor(page);
  await save(page);
  expect(
    await page.evaluate(
      () =>
        window.__referenceSeed().services.find((row) => row.id === "service-1")
          .price_unit,
    ),
  ).toBe("Ft / alkalom");
  await page
    .getByRole("button", { name: /Erositett gel lakk.*1 szolgáltatás/ })
    .click();
  await page
    .locator("dialog[open]")
    .getByLabel("Ár egysége", { exact: true })
    .fill("Ft");
  await closeEditor(page);
  await page.evaluate(() => (window.__adminServicesConflict = true));
  await page.locator("[data-admin-save]").click();
  await expect(page.locator("[data-admin-save]")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        window.__referenceSeed().services.find((row) => row.id === "service-1")
          .price_unit,
    ),
  ).toBe("Ft / alkalom");
});

test("content persistence and CMS conflict retain the actual draft", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAdmin(page, "content");
  const editor = page
    .locator('#admin-reference-root main input[type="text"]')
    .first();
  await expect(editor).toBeVisible();
  await editor.fill("Szintetikus mentési próba");
  await save(page);
  expect(
    await page.evaluate(() =>
      JSON.stringify(
        window
          .__referenceSeed()
          .site_settings.find((row) => row.key === "site_content").value,
      ),
    ),
  ).toContain("Szintetikus mentési próba");
  await editor.fill("Megmaradó konfliktusos piszkozat");
  await page.evaluate(() => (window.__adminSaveConflict = true));
  await page.locator("[data-admin-save]").click();
  await expect(page.locator("[data-admin-save]")).toBeVisible();
  await expect(editor).toHaveValue("Megmaradó konfliktusos piszkozat");
  expect(
    await page.evaluate(() =>
      JSON.stringify(
        window
          .__referenceSeed()
          .site_settings.find((row) => row.key === "site_content").value,
      ),
    ),
  ).not.toContain("Megmaradó konfliktusos piszkozat");
});

test("date schedule preserves step and per-day intervals on save",async({page})=>{
 const seed=fixtures(),date=new Date().toLocaleDateString('sv-SE');seed.availability_windows=[{id:'window-1',work_date:date,start_time:'09:00',end_time:'18:00',slot_step_minutes:20,active:true}];await page.setViewportSize({width:390,height:844});await openAdmin(page,'schedule',seed);await page.locator('[data-schedule-date="'+date+'"]').click();const dialog=page.locator('dialog[open]'),row=dialog.locator('[data-window-id="window-1"]');await expect(row.getByLabel('Kezdés',{exact:true})).toHaveValue('09:00');await row.getByLabel('Vége',{exact:true}).fill('17:30');const movedDate=new Date(Date.now()+86400000).toLocaleDateString('sv-SE');await row.getByLabel('Dátum',{exact:true}).fill(movedDate);await expect(row).toBeVisible();await dialog.getByRole('button',{name:'Mentés',exact:true}).click();await expect(dialog).not.toBeVisible();expect(await page.evaluate(()=>window.__referenceSeed().availability_windows[0])).toMatchObject({id:'window-1',work_date:movedDate,end_time:'17:30',slot_step_minutes:20});
});

test("own calculator, guests, coupons and theme are usable within the copied shell", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAdmin(page, "calculator");
  await expect(
    page.locator("#admin-reference-root main output"),
  ).not.toHaveText("0 Ft");
  await choose(page, /Kalkulátor kuponja/, "SZOLG1000 – 1 000 Ft kedvezmény");
  await expect(page.locator("#admin-reference-root main output")).toHaveText(
    "5 500 Ft",
  );
  await navigate(page, "Vendégek");
  await expect(page.locator("#admin-reference-root main")).toContainText(
    "Nagy Anna",
  );
  await navigate(page, "Kuponok");
  await page
    .getByRole("button", { name: /^Díszítés kedvezmény DISZ50/ })
    .click();
  await expect(page.locator("dialog[open]")).toContainText("Kedvezmény alapja");
  await closeEditor(page);
  await navigate(page, "Beállítások");
  await page.getByRole("button", { name: "Sötét", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-admin-theme",
    "dark",
  );
  await page
    .getByRole("button", { name: "Jelszó módosítása", exact: true })
    .click();
  await expect(page.locator('dialog[open] input[type="password"]')).toHaveCount(
    2,
  );
  await closeEditor(page);
});

test("gallery upload uses own compression/storage; selection and delete persist", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page, "gallery");
  await page.getByRole("button", { name: "+ Kép", exact: true }).click();
  const dialog = page.locator("dialog[open]");
  await dialog
    .getByLabel("Képleírás / alternatív szöveg", { exact: true })
    .fill("Szintetikus manikűrkép");
  await dialog
    .locator('input[type="file"]')
    .setInputFiles({
      name: "sample.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6u4sAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect
    .poll(() => page.evaluate(() => window.__adminLastUpload?.type))
    .toBe("image/webp");
  await expect(dialog.getByLabel("Kép URL vagy fájlútvonal")).toHaveValue(
    /^https:\/\/images.example.test\//,
  );
  await closeEditor(page);
  await save(page);
  const stored = await page.evaluate(() =>
    window
      .__referenceSeed()
      .site_settings.find((row) => row.key === "site_content")
      .value.galeria.elemek.find(
        (row) => row.kepAlt === "Szintetikus manikűrkép",
      ),
  );
  expect(stored.kep).toMatch(/-full.webp$/);
  expect(stored.eloKep).toMatch(/-preview.webp$/);
  await page
    .locator("#admin-reference-root main")
    .getByRole("button", { name: "Szintetikus manikűrkép", exact: true })
    .click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .locator("dialog[open]")
    .getByRole("button", { name: "Kép törlése", exact: true })
    .click();
  await save(page);
  expect(
    await page.evaluate(() =>
      window
        .__referenceSeed()
        .site_settings.find((row) => row.key === "site_content")
        .value.galeria.elemek.some(
          (row) => row.kepAlt === "Szintetikus manikűrkép",
        ),
    ),
  ).toBe(false);
});

test("source swipe, notification target, export and logged-out gate", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page, "bookings");
  await page.getByRole("button", { name: /Értesítések/ }).click();
  const dialog = page.locator("dialog[open]");
  await expect(dialog).toContainText("Új foglalás · Kiss Dorka");
  await dialog
    .getByRole("button", { name: /Új foglalás · Kiss Dorka/ })
    .click();
  await expect(page.locator("dialog[open]")).toContainText("Kiss Dorka");
  await closeEditor(page);
  const switcher = page.getByRole("group", { name: "Foglalási nézet" });
  await switcher.evaluate((element) => {
    const touch = (x) => ({ identifier: 1, clientX: x, clientY: 200 });
    const touches = (value) =>
      Object.assign(value, { item: (index) => value[index] });
    for (const [type, x, end] of [
      ["touchstart", 300, false],
      ["touchmove", 150, false],
      ["touchend", 80, true],
    ]) {
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperties(event, {
        touches: { value: touches(end ? [] : [touch(x)]) },
        changedTouches: { value: touches([touch(x)]) },
      });
      element.dispatchEvent(event);
    }
  });
  await expect(
    page.getByRole("button", { name: "Naptár", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("navigation", { name: "Mobil admin eszköztár" })
    .getByRole("button", { name: "Továbbiak", exact: true })
    .click();
  const download = page.waitForEvent("download");
  await page
    .locator("dialog[open]")
    .getByRole("button", { name: "Foglalások Excel-exportja", exact: true })
    .click();
  expect((await download).suggestedFilename()).toMatch(/\.xlsx$/);
  await closeEditor(page);
  await page.evaluate(() => window.__adminEmitAuth("SIGNED_OUT", null));
  await expect(page.locator("[data-admin-shell]")).toHaveCount(0);
  await expect(
    page.locator('#admin-reference-root input[type="password"]'),
  ).toBeVisible();
  expect(
    await page.evaluate(() => window.LumiAdminBackend.snapshot().bookings),
  ).toBeUndefined();
});

test("review evidence across existing admin tabs, sheets and calendar views", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openAdmin(page, "overview");
  const tabs = [
    ["Áttekintés", "overview"],
    ["Foglalások", "bookings"],
    ["Beosztás", "schedule"],
    ["Weboldal", "content"],
    ["Árlista", "prices"],
    ["Galéria", "gallery"],
    ["Vendégek", "guests"],
    ["Kuponok", "coupons"],
    ["Árkalkulátor", "calculator"],
    ["Kommunikáció", "logs"],
    ["Beállítások", "settings"],
  ];
  for (const [label, id] of tabs) {
    await navigate(page, label);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        id + " " + width,
      ).toBe(true);
      await page.screenshot({
        path: ".impeccable/review/reference-" + id + "-" + width + ".png",
      });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await navigate(page, "Foglalások");
  await page.getByRole("button", { name: "Naptár", exact: true }).click();
  await page.screenshot({
    path: ".impeccable/review/reference-calendar-1440.png",
  });
  await page.getByRole("button", { name: "Hét", exact: true }).click();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.screenshot({
      path: ".impeccable/review/reference-week-" + width + ".png",
    });
  }
  expect(errors).toEqual([]);
});

test("rescheduling saves only its record and preserves another pending draft", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await openAdmin(page, "bookings");
  await choose(page, /Kiss Dorka foglalási állapota/, "Megerősítve");
  await page
    .locator("#admin-reference-root main article")
    .filter({ hasText: "Toth Luca" })
    .getByRole("button", { name: /09:00/ })
    .click();
  const dialog = page.locator("dialog[open]");
  await dialog.getByLabel("Dátum", { exact: true }).fill("");
  const date = new Date(Date.now() + 8 * 86400000).toLocaleDateString("sv-SE");
  await dialog.getByLabel("Dátum", { exact: true }).fill(date);
  await dialog.getByLabel("Kezdés", { exact: true }).fill("10:00");
  await dialog.getByLabel("Befejezés", { exact: true }).fill("12:00");
  await dialog
    .getByRole("button", { name: "Módosítás mentése", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => window.__adminLastRpc?.args.p_changes.length),
    )
    .toBe(1);
  const rows = await page.evaluate(() => window.__referenceSeed().bookings);
  expect(
    rows.find((row) => row.customer_name === "Toth Luca").starts_at,
  ).toContain(date);
  expect(rows.find((row) => row.customer_name === "Kiss Dorka").status).toBe(
    "pending",
  );
  await closeEditor(page);
  await expect(page.locator("[data-admin-save]")).toBeVisible();
  expect(errors).toEqual([]);
});

test("inspirations retain own private links and existing clear RPC", async ({
  page,
}) => {
  const seed = fixtures();
  seed.bookings[2].inspiration_images = [
    {
      url: "https://private.example.test/demo.jpg",
      path: "own/demo.jpg",
      bucket: "booking-inspirations",
      name: "Szintetikus inspiráció",
    },
  ];
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page, "bookings", seed);
  await page
    .locator("#admin-reference-root main article")
    .filter({ hasText: "Toth Luca" })
    .getByRole("button", { name: /09:00/ })
    .click();
  await expect(
    page
      .locator("dialog[open]")
      .getByRole("heading", { name: "Inspirációs képek" }),
  ).toBeVisible();
  await expect(page.locator("dialog[open] img")).toHaveAttribute(
    "src",
    "https://private.example.test/own/demo.jpg",
  );
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .locator("dialog[open]")
    .getByRole("button", { name: "Képek törlése", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () => window.__referenceSeed().bookings[2].inspiration_images.length,
      ),
    )
    .toBe(0);
});

test("finish plates of updated content states and source editor panels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openAdmin(page, "prices");
  for (const [label, id] of [
    ["Árlista", "prices"],
    ["Galéria", "gallery"],
    ["Weboldal", "content"],
    ["Beállítások", "settings"],
  ]) {
    await navigate(page, label);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.screenshot({
        path: ".impeccable/review/reference-" + id + "-" + width + ".png",
      });
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await navigate(page, "Árlista");
  await page
    .getByRole("button", { name: /Erositett gel lakk.*1 szolgáltatás/ })
    .click();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.screenshot({
      path: ".impeccable/review/reference-price-editor-" + width + ".png",
    });
  }
  const sheetBody=await page.locator("dialog[open] > div").boundingBox();expect(Math.abs(sheetBody.y+sheetBody.height-page.viewportSize().height)).toBeLessThan(2);
  await closeEditor(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await navigate(page, "Beállítások");
  await page.getByRole("button", { name: "Sötét", exact: true }).click();
  await navigate(page, "Foglalások");
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.screenshot({
      path: ".impeccable/review/reference-bookings-dark-" + width + ".png",
    });
  }
});

test("lazy tab loading, request coalescing and standalone zoom guard", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "standalone", { get: () => true }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await openAdmin(page, "prices");
  const reads = await page.evaluate(() => window.__adminReads);
  expect(reads).not.toContain("bookings");
  expect(reads).not.toContain("blocked_times");
  expect(reads).not.toContain("booking_events");
  expect(reads).not.toContain("customer_profiles");
  const before = reads.filter((table) => table === "services").length;
  await page.evaluate(() =>
    Promise.all([
      window.LumiAdminBackend.load("prices"),
      window.LumiAdminBackend.load("prices"),
    ]),
  );
  expect(
    await page.evaluate(
      () => window.__adminReads.filter((table) => table === "services").length,
    ),
  ).toBe(before);
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    "content",
    /maximum-scale=1/,
  );
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    "content",
    /user-scalable=no/,
  );
});

test('email error and cancellation acknowledgement persist after reloading own data',async({page})=>{
 await page.setViewportSize({width:390,height:844});await openAdmin(page,'overview');await page.getByRole('button',{name:/Értesítések/}).click();let dialog=page.locator('dialog[open]');await dialog.getByRole('button',{name:'E-mailhibák nyugtázása',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.LumiAdminBackend.snapshot().emailErrors.length)).toBe(0);await dialog.getByRole('button',{name:'Lemondások nyugtázása',exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.LumiAdminBackend.snapshot().bookings.find(row=>row.guestName==='Farkas Petra').cancellationAcknowledgedAt)).toBeTruthy();await page.evaluate(()=>Promise.all([window.LumiAdminBackend.load('logs',true),window.LumiAdminBackend.load('bookings',true)]));expect(await page.evaluate(()=>window.LumiAdminBackend.snapshot().emailErrors)).toEqual([]);expect(await page.evaluate(()=>window.LumiAdminBackend.snapshot().bookings.find(row=>row.guestName==='Farkas Petra').cancellationAcknowledgedAt)).toBeTruthy();const records=await page.evaluate(()=>window.__referenceSeed().booking_events);expect(records.some(row=>row.event_type==='admin_email_errors_acknowledged')).toBe(true);expect(records.some(row=>row.event_type==='customer_cancellation_acknowledged')).toBe(true);
});

test('multiple-day planning and shared interval preserve bookings and other windows',async({page})=>{
 const seed=fixtures(),month=new Date().toLocaleDateString('sv-SE').slice(0,7);await page.setViewportSize({width:390,height:844});await openAdmin(page,'schedule',seed);await page.getByRole('button',{name:'Több nap kijelölése',exact:true}).click();for(const day of ['01','02'])await page.locator('[data-schedule-date="'+month+'-'+day+'"]').click();await page.getByRole('button',{name:'2 nap beállítása',exact:true}).click();let dialog=page.locator('dialog[open]');await dialog.getByLabel('Közös vége',{exact:true}).fill('16:00');await dialog.getByRole('button',{name:'Kijelöltekre beállítom',exact:true}).click();await dialog.locator('summary').click();await expect(dialog.locator('[data-selected-date]').first().getByLabel('Vége',{exact:true})).toHaveValue('16:00');await dialog.getByRole('button',{name:'Mentés',exact:true}).click();await expect(dialog).not.toBeVisible();await page.getByRole('button',{name:/^Beállított idősávok/}).click();await dialog.getByRole('spinbutton',{name:'Időpontok sűrűsége',exact:true}).fill('40');await dialog.getByRole('button',{name:'Lépés minden napra',exact:true}).click();await dialog.getByRole('button',{name:'Mentés',exact:true}).click();await expect(dialog).not.toBeVisible();expect(await page.evaluate(()=>window.__referenceSeed().availability_windows.every(row=>row.slot_step_minutes===40))).toBe(true);expect(await page.evaluate(()=>window.__referenceSeed().bookings)).toEqual(seed.bookings);
});

test('mobile LAN editing works without the secure-context randomUUID API',async({page})=>{
 await page.addInitScript(()=>Object.defineProperty(window.crypto,'randomUUID',{value:undefined,configurable:true}));await page.setViewportSize({width:390,height:844});await openAdmin(page,'prices');await page.getByRole('button',{name:'+ Kategória',exact:true}).click();const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();await dialog.getByLabel('Csoport neve',{exact:true}).fill('Mobilos próba');await closeEditor(page);await save(page);const service=await page.evaluate(()=>window.__referenceSeed().services.find(row=>row.name.startsWith('Mobilos próba')));expect(service.id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i);
});

test('representative mobile and desktop editor panels use the reference viewport',async({page})=>{
 const seed=fixtures();seed.services=seed.services.map(row=>({...row,booking_enabled:true}));seed.availability_windows=[{id:'window-today',work_date:new Date().toLocaleDateString('sv-SE'),start_time:'09:00',end_time:'18:00',slot_step_minutes:30,active:true}];await page.setViewportSize({width:1440,height:1000});await openAdmin(page,'bookings',seed);
 async function capture(name){for(const width of [1440,390]){await page.setViewportSize({width,height:width===390?844:1000});const body=await page.locator('dialog[open] > div').boundingBox();if(width===390)expect(Math.abs(body.y+body.height-844)).toBeLessThan(2);await page.screenshot({path:'.impeccable/review/reference-'+name+'-'+width+'.png'});}await closeEditor(page);await page.setViewportSize({width:1440,height:1000});}
 await page.locator('#admin-reference-root main article').filter({hasText:'Toth Luca'}).getByRole('button',{name:/09:00/}).click();await capture('booking-editor');await page.getByRole('navigation',{name:'Admin menü',exact:true}).getByRole('button',{name:'Új időpont',exact:true}).click();await capture('manual-editor');await navigate(page,'Beosztás');await page.locator('[data-schedule-date]').first().click();await capture('schedule-editor');
});

test('review fix: logout discards private manual and editor state',async({page})=>{
 await page.setViewportSize({width:390,height:844});await openAdmin(page,'bookings');await page.getByRole('searchbox').fill('Privát keresés');await page.getByRole('navigation',{name:'Mobil admin eszköztár'}).getByRole('button',{name:'Új idő',exact:true}).click();const manual=page.getByRole('dialog',{name:'Új kézi időpont',exact:true});await manual.getByLabel('Név',{exact:false}).fill('Privát mentetlen vendég');await page.evaluate(()=>window.__adminEmitAuth('SIGNED_OUT',null));await expect(page.locator('[data-admin-shell]')).toHaveCount(0);await page.evaluate(()=>window.__adminEmitAuth('SIGNED_IN'));await expect(page.locator('[data-admin-shell]')).toBeVisible();await expect(page.locator('dialog[open]')).toHaveCount(0);await expect(page.getByRole('searchbox')).toHaveValue('');await page.getByRole('navigation',{name:'Mobil admin eszköztár'}).getByRole('button',{name:'Új idő',exact:true}).click();await expect(page.getByRole('dialog',{name:'Új kézi időpont',exact:true}).getByLabel('Név',{exact:false})).toHaveValue('');
});

test('review fix: cold rebooking resolves the saved service and duration',async({page})=>{
 const seed=fixtures();seed.services=seed.services.map(row=>({...row,booking_enabled:true}));await page.setViewportSize({width:390,height:844});await openAdmin(page,'bookings',seed);expect(await page.evaluate(()=>window.__adminReads.includes('services'))).toBe(false);await page.locator('#admin-reference-root main article').filter({hasText:'Nagy Anna'}).getByRole('button',{name:/10:00/}).click();await page.locator('dialog[open]').getByRole('button',{name:'Vendégprofil és előzmények',exact:true}).click();await page.getByRole('button',{name:'Új időpont ezzel a vendéggel',exact:true}).click();const manual=page.getByRole('dialog',{name:'Új kézi időpont',exact:true});await expect(manual.locator('[data-service-id="service-1"]')).toHaveAttribute('aria-pressed','true');await expect(manual.getByRole('combobox',{name:/^Név/})).toHaveValue('Nagy Anna');await expect(manual.getByLabel('Befejezés',{exact:true})).toHaveValue('11:00');
});

async function openTomorrowWeek(page){await page.getByRole('button',{name:'Hét',exact:true}).click();const date=await page.evaluate(()=>window.LumiAdminBackend.snapshot().bookings.find(row=>row.guestName==='Toth Luca').dateInput);if(await page.locator(`[data-week-day-column="${date}"]`).count()===0)await page.getByRole('button',{name:'Következő hét',exact:true}).click();return page.locator(`[data-week-day-column="${date}"]`);}

test('review fix: week drag preserves a typed guest message through saving',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await openAdmin(page,'bookings');await page.locator('#admin-reference-root main article').filter({hasText:'Toth Luca'}).getByRole('button',{name:/09:00/}).click();await page.locator('dialog[open]').getByLabel('Üzenet a vendégnek (nem kötelező, az e-mailben jelenik meg)',{exact:true}).fill('Megőrzendő vendégüzenet');await closeEditor(page);const column=await openTomorrowWeek(page);const card=column.locator('.admin-week-booking').filter({hasText:'Toth Luca'});await card.scrollIntoViewIfNeeded();const box=await card.boundingBox(),hour=await page.locator('#admin-reference-root main :text-is("14:00"):visible').boundingBox(),col=await column.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+8);await page.mouse.down();await expect(card).toHaveAttribute('aria-pressed','true');await page.mouse.move(col.x+col.width/2,hour.y+hour.height/2+2,{steps:12});await page.mouse.up();await expect(page.locator('[aria-label="Mentésre váró áthelyezés"]:visible')).toHaveCount(1);await card.getByRole('button').click();await expect(page.getByRole('dialog',{name:'Gel lakk',exact:true})).toBeVisible();await expect(page.getByRole('dialog',{name:'Gel lakk',exact:true}).getByRole('textbox',{name:/^Üzenet a vendégnek/})).toHaveValue('Megőrzendő vendégüzenet');await page.locator('dialog[open]').getByRole('button',{name:'Módosítás mentése',exact:true}).click();await expect.poll(()=>page.evaluate(()=>JSON.stringify(window.__adminLastRpc?.args.p_changes||[]))).toContain('Megőrzendő vendégüzenet');
});

test('review fix: late-day calendar quick add starts with a valid end',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await openAdmin(page,'bookings');const column=await openTomorrowWeek(page);await page.locator('#admin-reference-root main :text-is("14:00"):visible').scrollIntoViewIfNeeded();const col=await column.boundingBox(),hour=await page.locator('#admin-reference-root main :text-is("14:00"):visible').boundingBox();await page.mouse.click(col.x+col.width/2,hour.y+hour.height/2+2);const manual=page.getByRole('dialog',{name:'Új kézi időpont',exact:true});await expect(manual.getByLabel('Kezdés',{exact:true})).toHaveValue('14:00');await expect(manual.getByLabel('Befejezés',{exact:true})).toHaveValue('15:00');
});

test('review fix: new visits use Auto while explicit density preferences persist',async({page})=>{
 await page.setViewportSize({width:390,height:844});await openAdmin(page,'settings');await expect(page.locator('html')).toHaveAttribute('data-admin-size','auto');expect(await page.evaluate(()=>localStorage.getItem('lumi-admin-size'))).toBeNull();await page.getByRole('button',{name:'Kompakt',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-admin-size','compact');await page.reload();await expect(page.locator('[data-admin-shell]')).toBeVisible();await expect(page.locator('html')).toHaveAttribute('data-admin-size','compact');
});
