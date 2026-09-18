import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool, Client } = pg;

const dbConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "accardio",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

function attachPoolErrorHandler(activePool: pg.Pool) {
  activePool.on("error", (err) => {
    console.error("Unexpected error on idle PostgreSQL client:", err.message);
  });
}

// The pool can be replaced when an administrator saves new database settings.
export let pool = new Pool(dbConfig);
attachPoolErrorHandler(pool);

export async function reconfigurePool(config: {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}) {
  const previousPool = pool;
  const nextPool = new Pool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  await nextPool.query("SELECT 1");
  pool = nextPool;
  attachPoolErrorHandler(pool);
  await previousPool.end().catch(() => undefined);
}

/**
 * Ensures the target database exists; if not, creates it via default 'postgres' database
 */
export async function ensureDatabaseExists(): Promise<boolean> {
  const targetDb = process.env.DB_NAME || "accardio";
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: "postgres", // Connect to default maintenance db
  });

  try {
    await client.connect();
    const checkRes = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDb]
    );

    if (checkRes.rowCount === 0) {
      console.log(`Database '${targetDb}' does not exist. Creating...`);
      // Escape database name safely
      await client.query(`CREATE DATABASE "${targetDb.replace(/"/g, '""')}"`);
      console.log(`✓ Database '${targetDb}' created successfully!`);
    }
    await client.end();
    return true;
  } catch (err: any) {
    console.warn(`Note on ensureDatabaseExists: ${err.message}`);
    try {
      await client.end();
    } catch {
      // Ignore
    }
    return false;
  }
}

/**
 * Checks PostgreSQL connectivity status
 */
export async function checkConnection(): Promise<{
  connected: boolean;
  version?: string;
  database?: string;
  error?: string;
}> {
  try {
    const res = await pool.query("SELECT version() as version, current_database() as database");
    return {
      connected: true,
      version: res.rows[0]?.version,
      database: res.rows[0]?.database,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message,
    };
  }
}

/**
 * Tests connection with arbitrary credentials
 */
export async function testNewConnection(config: {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}): Promise<{ success: boolean; version?: string; error?: string }> {
  const testClient = new Client({
    host: config.host || process.env.DB_HOST || "localhost",
    port: config.port || parseInt(process.env.DB_PORT || "5432", 10),
    user: config.user || process.env.DB_USER || "postgres",
    password: config.password,
    database: config.database || "postgres",
    connectionTimeoutMillis: 4000,
  });

  try {
    await testClient.connect();
    const res = await testClient.query("SELECT version() as version");
    await testClient.end();
    return { success: true, version: res.rows[0]?.version };
  } catch (err: any) {
    try {
      await testClient.end();
    } catch { }
    return { success: false, error: err.message };
  }
}

/**
 * Helper to run typed queries
 */
export async function query<T extends pg.QueryResultRow = any>(text: string, params?: any[]): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development" && duration > 200) {
      console.log(`[DB Slow Query] ${duration}ms: ${text.slice(0, 80)}...`);
    }
    return res;
  } catch (error: any) {
    console.error(`[DB Error]: ${error.message} on query: ${text.slice(0, 100)}`);
    throw error;
  }
}

