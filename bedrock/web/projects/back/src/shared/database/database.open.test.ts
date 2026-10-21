import { expect, it } from "vite-plus/test";
import { openMemoryDatabase } from "#shared/database/database.open.ts";

it("runs real SQL in memory, with no file", () => {
  const database = openMemoryDatabase();
  database.exec("CREATE TABLE notes (id INTEGER PRIMARY KEY, text TEXT NOT NULL)");
  const added = database.prepare("INSERT INTO notes (text) VALUES (?)").run("first");
  expect(added.changes).toBe(1);
  expect(
    database.prepare("SELECT text FROM notes WHERE id = ?").get(added.lastInsertRowid),
  ).toEqual({
    text: "first",
  });
  expect(database.prepare("SELECT id FROM notes").all()).toHaveLength(1);
  database.close();
});

it("gives each test its own empty database", () => {
  const first = openMemoryDatabase();
  first.exec("CREATE TABLE notes (id INTEGER PRIMARY KEY)");
  const second = openMemoryDatabase();
  const tables = second.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all();
  expect(tables).toEqual([]);
});
