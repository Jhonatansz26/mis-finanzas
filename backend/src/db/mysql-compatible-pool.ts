import { Pool, PoolClient, QueryResult } from 'pg';

function convertQuery(query: string, params: any[] = []): { text: string; values: any[] } {
  let paramIndex = 0;
  const text = query.replace(/\?/g, () => {
    paramIndex++;
    return `$${paramIndex}`;
  });
  return { text, values: params };
}

function buildResult(result: QueryResult): any {
  const rows: any = result.rows;
  rows.insertId = result.rows[0]?.id;
  rows.affectedRows = result.rowCount;
  return [rows, result.fields, { insertId: rows.insertId, affectedRows: rows.affectedRows }];
}

export class MysqlCompatiblePool {
  private pool: Pool;

  constructor(config: any) {
    this.pool = new Pool(config);
  }

  async query(queryText: string, params?: any[]): Promise<any> {
    if (params && params.length > 0) {
      const pg = convertQuery(queryText, params);
      const result = await this.pool.query(pg);
      return buildResult(result);
    }
    const result = await this.pool.query(queryText);
    return buildResult(result);
  }

  async getConnection(): Promise<MysqlCompatibleClient> {
    const client = await this.pool.connect();
    return new MysqlCompatibleClient(client);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.pool.on(event as any, callback);
  }

  get originalPool(): Pool {
    return this.pool;
  }
}

export class MysqlCompatibleClient {
  constructor(private client: PoolClient) {}

  async query(queryText: string, params?: any[]): Promise<any> {
    if (params && params.length > 0) {
      const pg = convertQuery(queryText, params);
      const result = await this.client.query(pg);
      return buildResult(result);
    }
    const result = await this.client.query(queryText);
    return buildResult(result);
  }

  async beginTransaction() {
    await this.client.query('BEGIN');
  }

  async commit() {
    await this.client.query('COMMIT');
  }

  async rollback() {
    await this.client.query('ROLLBACK');
  }

  release() {
    this.client.release();
  }
}
