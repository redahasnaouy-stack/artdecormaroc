import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtemp, cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import previous from "../netlify/previous-catalog.json" with { type: "json" };
test("Existing SQLite catalogue refreshes once and preserves private orders and edited products", async () => {
  const directory = await mkdtemp("/tmp/artdecor-refresh-");
  let child;
  try {
    for (const file of ["server.js", "public", "netlify", "package.json"])
      await cp(new URL("../" + file, import.meta.url), directory + "/" + file, {
        recursive: true,
      });
    await mkdir(directory + "/data");
    const db = new DatabaseSync(directory + "/data/store.sqlite");
    db.exec(
      "CREATE TABLE products(id INTEGER PRIMARY KEY,name TEXT,category TEXT,price REAL,stock INTEGER,image TEXT,description TEXT);CREATE TABLE settings(key TEXT PRIMARY KEY,value TEXT);CREATE TABLE orders(id INTEGER PRIMARY KEY,customer TEXT,phone TEXT,address TEXT,items TEXT,total REAL,status TEXT DEFAULT 'Nouvelle',created TEXT DEFAULT CURRENT_TIMESTAMP)",
    );
    const insert = db.prepare("INSERT INTO products VALUES(?,?,?,?,?,?,?)");
    for (const p of previous)
      insert.run(
        p.id,
        p.name,
        p.category,
        p.price,
        p.stock,
        p.image,
        p.description,
      );
    insert.run(
      5000,
      "Pièce personnalisée",
      "Vases",
      150,
      5,
      "",
      "Personnalisé",
    );
    db.prepare(
      "INSERT INTO orders(id,customer,items,total) VALUES(?,?,?,?)",
    ).run(
      1,
      "Client conservé",
      JSON.stringify([{ id: 1001, name: previous[0].name, quantity: 1 }]),
      349,
    );
    db.exec(
      "INSERT INTO settings VALUES('catalog-revision','engro-2026-10-22'); INSERT INTO settings VALUES('stock-revision','engro-stock-10-v1')",
    );
    db.close();
    const start = async () => {
      child = spawn(process.execPath, [directory + "/server.js"], {
        env: {
          ...process.env,
          PORT: "3142",
          ADMIN_PASSWORD: "refresh-test-password",
        },
        stdio: ["ignore", "pipe", "pipe"],
      });
      await new Promise((resolve, reject) => {
        child.stdout.once("data", resolve);
        child.once("exit", (code) => reject(Error("Startup failed " + code)));
      });
    };
    const stop = async () => {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill();
      await exited;
      child = null;
    };
    await start();
    const base = "http://127.0.0.1:3142";
    const products = await (await fetch(base + "/api/products")).json();
    assert.equal(products.length, 25);
    assert.equal(
      products.filter((p) => p.image.startsWith("/assets/")).length,
      24,
    );
    assert.ok(products.some((p) => p.id === 5000));
    assert.ok(
      !products.some((p) => previous.some((old) => old.name === p.name)),
    );
    const login = await fetch(base + "/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password: "refresh-test-password" }),
    });
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const orders = await (
      await fetch(base + "/api/admin/orders", { headers: { cookie } })
    ).json();
    assert.equal(orders.length, 1);
    assert.equal(orders[0].customer, "Client conservé");
    await stop();
    await start();
    assert.equal(
      (await (await fetch(base + "/api/products")).json()).length,
      25,
    );
    await stop();
  } finally {
    if (child) {
      const exited = new Promise((resolve) => child.once("exit", resolve));
      child.kill();
      await exited;
    }
    await rm(directory, { recursive: true, force: true });
  }
});
