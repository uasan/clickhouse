import { Migration } from './/migration/Migration.js';
import { ClickHouseError } from './protocol/ClickHouseError.js';
import { toInputBody } from './protocol/input.js';
import { encodeURIOrDefault } from './protocol/utils.js';
import { SQL } from './sql/SQL.js';
import { SQLBuilder } from './sql/SQLBuilder.js';

export { ClickHouseTable } from './models/ClickHouseTable.js';

export class ClickHouse {
  url = 'http://localhost:8123';

  signal = null;
  options = null;
  headers = null;

  constructor(options) {
    this.options = options;

    if (options.url) {
      this.url = options.url;
    }

    if (options.signal) {
      this.signal = options.signal;
    }

    this.url += '/?database=' + encodeURIOrDefault(options.database, 'default');

    this.headers = {
      'accept-encoding': 'zstd',
      'x-clickhouse-key': options.password || '',
      'x-clickhouse-user': options.username || 'default',
    };
  }

  async send(body, url = '', query) {
    try {
      const res = await fetch(this.url + url, {
        method: 'POST',
        duplex: 'half',
        headers: this.headers,
        signal: query ? query.signal : this.signal,
        body,
      });

      if (res.ok) {
        if (query) {
          return await query.respond(res);
        }
      } else {
        throw ClickHouseError.parse(await res.text());
      }
    } catch (error) {
      throw ClickHouseError.from(error);
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

  async insert(table, values, format = 'JSONEachRow') {
    await this.send(
      toInputBody(values),
      '&query='
        + encodeURIComponent(
          'INSERT INTO ' + table + ' FORMAT ' + format,
        ),
    );
  }

  new(options) {
    return new ClickHouse({ ...this.options, ...options });
  }

  migration({ context, ...options } = {}) {
    return new Migration(this.new(options), context);
  }
}
