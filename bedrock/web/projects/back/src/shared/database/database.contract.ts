export type SqlValue = null | number | bigint | string | Uint8Array;

export type SqlRow = Readonly<Record<string, SqlValue>>;

export type RunResult = { changes: number | bigint; lastInsertRowid: number | bigint };

export type Statement = {
  all: (...params: SqlValue[]) => SqlRow[];
  get: (...params: SqlValue[]) => SqlRow | undefined;
  run: (...params: SqlValue[]) => RunResult;
};

export type Database = {
  exec: (sql: string) => void;
  prepare: (sql: string) => Statement;
  close: () => void;
};
