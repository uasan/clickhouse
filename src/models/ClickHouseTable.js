import { randomUUID } from 'node:crypto';

export class ClickHouseTable {
  static version = 1;
  static tableName = '';

  static injectSQL({ source }, string) {
    source[source.length - 1] += this.tableName + string;
  }

  static toString() {
    return this.tableName;
  }

  static async exchange(query) {
    const newTableName = query.client.sql('"' + randomUUID() + '"');

    let sql = await query.client.sql`SHOW CREATE TABLE ${this}`.asValue();
    sql = 'CREATE TABLE ' + newTableName + sql.slice(sql.indexOf('('));

    try {
      await query.client.sql`${query.client.sql(sql)} AS ${query}`;
      await query.client.sql`EXCHANGE TABLES ${this} AND ${newTableName}`;
    } finally {
      await query.client.sql`DROP TABLE IF EXISTS ${newTableName}`;
    }

    console.log(sql);
  }
}
