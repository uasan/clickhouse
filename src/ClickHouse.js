import { Migration } from './/migration/Migration.js';
import { ClickHouseError } from './protocol/ClickHouseError.js';
import { toInputBody } from './protocol/input.js';
import { encodeURIOrDefault } from './protocol/utils.js';
import { SQL } from './sql/SQL.js';
import { SQLBuilder } from './sql/SQLBuilder.js';

export { ClickHouseTable } from './models/ClickHouseTable.js';

export class ClickHouse {
  url = 'http://localhost:8123';

  cache = null;
  signal = null;
  options = null;
  headers = null;

  constructor(options) {
    this.options = options;

    if (options.url) {
      this.url = options.url;
    }

    if (options.cache) {
      this.cache = options.cache;
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

  new(options) {
    return new ClickHouse({ ...this.options, ...options });
  }

  migration({ context, ...options } = {}) {
    return new Migration(this.new({ ...options, cache: null }), context);
  }

  query(sql) {
    return this.send(sql);
  }

  sql(source, ...values) {
    return new SQL(this).set(Array.isArray(source) ? source : [source], values);
  }

  builder() {
    return new SQLBuilder(this);
  }

  async insert(table, values, format = 'JSONEachRow') {
    await this.send(
      toInputBody(values),
      '&query=' +
        encodeURIComponent('INSERT INTO ' + table + ' FORMAT ' + format),
    );
  }

  unionAll(...queries) {
    const query = new SQL(this);

    queries[0].make();
    query.source.push(...queries[0].source);
    query.values.push(...queries[0].values);

    for (let i = 1; i < queries.length; i++) {
      query.source[query.source.length - 1] += '\nUNION ALL\n';
      queries[i].make();
      queries[i].injectSQL(query, '');
    }

    return query;
  }
}
