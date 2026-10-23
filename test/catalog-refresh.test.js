import { test } from "node:test";
import assert from "node:assert/strict";
import catalog from "../netlify/catalog.json" with { type: "json" };
import previous from "../netlify/previous-catalog.json" with { type: "json" };
import {
  migrateCatalog,
  catalogRevision,
  stockRevision,
} from "../netlify/catalog-migration.mjs";
import { readFile } from "node:fs/promises";
test("ArtDecor: 24 genuine references distinct from decoration, with local JPEG photos", async () => {
  assert.equal(catalog.length, 24);
  assert.equal(new Set(catalog.map((p) => p.sourceId)).size, 24);
  const old = new Set(previous.map((p) => p.sourceId));
  for (const p of catalog) {
    assert.ok(!old.has(p.sourceId));
    assert.ok(p.price > 0);
    assert.match(p.source, /^https:\/\/engro.ma\/products\//);
    const image = await readFile(
      new URL("../public" + p.image, import.meta.url),
    );
    assert.equal(image.subarray(0, 3).toString("hex"), "ffd8ff");
  }
});
test("Refresh replaces unchanged old imports, preserves edited products and orders, and runs once", () => {
  const edited = {
    ...previous[0],
    id: 5000,
    name: "Produit personnalisé",
    price: 899,
  };
  const state = {
    products: [...structuredClone(previous), edited],
    orders: [
      {
        id: 1,
        items: [{ id: 1001, name: previous[0].name, price: previous[0].price }],
      },
    ],
    nextProduct: 5001,
    catalogRevision: "engro-2026-10-22",
    stockRevision,
  };
  const orders = structuredClone(state.orders);
  migrateCatalog(state);
  assert.equal(state.products.length, 25);
  assert.ok(state.products.some((p) => p.id === 5000));
  assert.ok(
    state.products.filter((p) => p.id !== 5000).every((p) => p.id > 5000),
  );
  assert.deepEqual(state.orders, orders);
  assert.equal(state.catalogRevision, catalogRevision);
  state.products.find((p) => p.sourceId === catalog[0].sourceId).stock = 0;
  migrateCatalog(state);
  assert.equal(state.products.length, 25);
  assert.equal(
    state.products.find((p) => p.sourceId === catalog[0].sourceId).stock,
    0,
  );
});
