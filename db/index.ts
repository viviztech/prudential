import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { getPostgresClient } from "./postgres";

export function getDb() {
  return drizzle(getPostgresClient(), { schema });
}
