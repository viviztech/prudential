import { createRequire } from "node:module";
import type { Sql } from "postgres";

const nodeRequire = createRequire(import.meta.url);
const postgres = Reflect.apply(nodeRequire, undefined, ["postgres"]) as typeof import("postgres");

type Row = Record<string, unknown>;

let client: Sql | undefined;

export function getPostgresClient(): Sql {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  client ??= postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: true,
  });
  return client;
}

class PreparedQuery {
  private parameters: unknown[] = [];

  constructor(private readonly statement: string) {}

  bind(...parameters: unknown[]) {
    this.parameters = parameters;
    return this;
  }

  async all<T extends Row>() {
    const rows = await this.execute<T>();
    return { results: [...rows] };
  }

  async first<T extends Row>() {
    const rows = await this.execute<T>();
    return rows[0] ?? null;
  }

  async run() {
    const rows = await this.execute<Row>();
    return { meta: { changes: rows.count } };
  }

  async execute<T extends Row>(sql: Sql = getPostgresClient()) {
    const query = normalizeSql(this.statement);
    return sql.unsafe<T[]>(query, this.parameters as never[]) as Promise<T[] & { count: number }>;
  }
}

export const database = {
  prepare(statement: string) {
    return new PreparedQuery(statement);
  },

  async batch(statements: PreparedQuery[]) {
    return getPostgresClient().begin(async (transaction) => {
      const results = [];
      for (const statement of statements) {
        results.push(await statement.execute(transaction as unknown as Sql));
      }
      return results;
    });
  },
};

function normalizeSql(statement: string): string {
  let query = statement.trim().replace(/;$/, "");
  const ignoreConflict = /^INSERT\s+OR\s+IGNORE\s+INTO/i.test(query);
  query = query.replace(/^INSERT\s+OR\s+IGNORE\s+INTO/i, "INSERT INTO");
  query = query.replace(
    /MAX\(certificate_counters\.last_value,\s*excluded\.last_value\)/gi,
    "GREATEST(certificate_counters.last_value, excluded.last_value)",
  );

  let position = 0;
  query = query.replace(/\?/g, () => `$${++position}`);
  if (ignoreConflict) query += " ON CONFLICT DO NOTHING";
  return query;
}
