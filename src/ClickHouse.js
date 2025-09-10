import { createClient } from '@clickhouse/client-web';

import { Migration } from './/migration/Migration.js';
import { SQL } from './sql/SQL.js';
import { SQLBuilder } from './sql/SQLBuilder.js';

export { ClickHouseTable } from './models/ClickHouseTable.js';

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
    return new SQL(this).set(source, values);
  }

  builder() {
    return new SQLBuilder(this);
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
