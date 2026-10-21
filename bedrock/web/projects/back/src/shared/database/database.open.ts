import { DatabaseSync } from "node:sqlite";
import type { Database } from "#shared/database/database.contract.ts";

export function openMemoryDatabase(): Database {
  return new DatabaseSync(":memory:");
}
