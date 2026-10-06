import postgresWorkerd, { type Sql } from "postgres";
import { createRequire } from "node:module";

let postgresNode: typeof postgresWorkerd | undefined;

function postgresFactory(): typeof postgresWorkerd {
  if (process.env.NODE_ENV !== "production") return postgresWorkerd;
  postgresNode ??= Reflect.apply(createRequire(import.meta.url), undefined, ["postgres"]) as typeof postgresWorkerd;
  return postgresNode;
}

type Row = Record<string, unknown>;

export function getPostgresClient(): Sql {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured.");

  return postgresFactory()(connectionString, {
    max: 1,
    connect_timeout: 10,
    prepare: true,
  });
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

  async execute<T extends Row>(sql?: Sql) {
    const client = sql ?? getPostgresClient();
    const query = normalizeSql(this.statement);
    try {
      return await client.unsafe<T[]>(query, this.parameters as never[]) as T[] & { count: number };
    } finally {
      if (!sql) await client.end();
    }
  }
}

export const database = {
  prepare(statement: string) {
    return new PreparedQuery(statement);
  },

  async batch(statements: PreparedQuery[]) {
    const client = getPostgresClient();
    try {
      return await client.begin(async (transaction) => {
        const results = [];
        for (const statement of statements) {
          results.push(await statement.execute(transaction as unknown as Sql));
        }
        return results;
      });
    } finally {
      await client.end();
    }
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
