import { Migration } from './/migration/Migration.js';
import { ClickHouseError } from './protocol/ClickHouseError.js';
import { toInputBody } from './protocol/input.js';
import { encodeURIOrDefault } from './protocol/utils.js';
import { SQL } from './sql/SQL.js';
import { SQLBuilder } from './sql/SQLBuilder.js';

export { ClickHouseTable } from './models/ClickHouseTable.js';

export class ClickHouse {
  url = 'http://clickhouse.aws.hrf:8123';

  options = null;
  headers = null;

  constructor(options) {
    this.options = options;

    if (options.url) {
      this.url = options.url;
    }

    this.url += '/?database=' + encodeURIOrDefault(options.database, 'default');

    this.headers = {
      'x-clickhouse-key': options.password || '',
      'x-clickhouse-user': options.username || 'default',
    };
  }

  async send(body, url = '', handler) {
    try {
      const res = await fetch(this.url + url, {
        method: 'POST',
        headers: this.headers,
        body,
      });

      if (res.ok) {
        if (handler) {
          return await handler(res);
        }
      } else {
        throw ClickHouseError.parse(await res.text());
      }
    } catch (error) {
      throw error?.constructor === ClickHouseError ? error : ClickHouseError.from(error);
    }
  }

  query(sql) {
    return this.send(sql);
  }

  sql(source, ...values) {
    return new SQL(this).set(source, values);
  }

  builder() {
    return new SQLBuilder(this);
  }

  async insert(table, values) {
    await this.send(
      toInputBody(values),
      '&query=' + encodeURIComponent('INSERT INTO ' + table + ' FORMAT JSONEachRow'),
    );
  }

  new(options) {
    return new ClickHouse({ ...this.options, ...options });
  }

  migration(context) {
    return new Migration(this, context);
  }
}
