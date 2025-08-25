import { createClient } from '@clickhouse/client-web';

import { Migration } from './Migration.js';
import { SQL } from './SQL.js';

export { ClickHouseTable } from './ClickHouseTable.js';

export class ClickHouse {
  client = null;
  options = null;

  constructor(options) {
    this.options = options;
    this.client = createClient(options);
  }

  command(query) {
    return this.client.command({ query });
  }

  sql(source, ...values) {
    return new SQL(this.client, source, values);
  }

  new(options) {
    return new ClickHouse({ ...this.options, ...options });
  }

  migration(context) {
    return new Migration(this, context);
  }

  async insert(table, values, options = { format: 'JSONEachRow' }) {
    await this.client.insert({ table, values, ...options });
  }
}
