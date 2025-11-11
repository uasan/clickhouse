import { readJSONL } from '../protocol/iterator.js';
import {
  getAllJSONL,
  getJSON,
  getText,
  getValue,
} from '../protocol/respond.js';
import { getQueryParams } from '../protocol/utils.js';
import { boldBlueBright, getTypeValue } from './utils.js';

export class SQL {
  cache = null;
  signal = null;
  client = null;

  format = 'JSONEachRow';
  respond = getAllJSONL;

  source = [];
  values = [];
  settings = '';

  constructor(client) {
    this.client = client;
    this.cache = client.cache;
    this.signal = client.signal;
  }

  send() {
    let url = '&default_format=' + this.format;

    if (this.settings) {
      url += this.settings;
    }

    if (this.cache) {
      url += `&use_query_cache=1&query_cache_ttl=${this.cache.ttl}`;

      if (this.cache.nondeterministicFunction) {
        url += `&query_cache_nondeterministic_function_handling=${this.cache.nondeterministicFunction}`;
      }
    }

    return this.client.send(
      this.toString(),
      getQueryParams(url, this.values),
      this,
    );
  }

  then(resolve, reject) {
    this.send().then(resolve, reject);
  }

  set(source, values) {
    if (this.source.length) {
      this.source[this.source.length - 1] += source[0];
    } else {
      this.source.push(source[0]);
    }

    for (let i = 0; i < values.length; i++) {
      if (typeof values[i]?.injectSQL === 'function') {
        values[i].injectSQL(this, source[i + 1]);
      } else {
        this.values.push(values[i]);

        let sql = source[i + 1];

        if (sql[0] === ':') {
          const pos = sql.search(/[\s)]/);
          sql =
            pos === -1
              ? sql + '}'
              : sql.slice(0, pos + 1) + '}' + sql.slice(pos + 1);
        } else {
          sql = getTypeValue(values[i]) + '}' + sql;
        }

        this.source.push(sql);
      }
    }

    return this;
  }

  make() {}

  toString() {
    this.make();

    if (this.values.length) {
      let text = this.source[0];

      for (let i = 1; i < this.source.length; i++)
        text += '{_' + i + this.source[i];
      return text;
    } else if (this.source.length) {
      return this.source[0];
    } else {
      return '';
    }
  }

  injectSQL({ source, values }, string) {
    this.make();
    source[source.length - 1] += this.source[0];

    if (this.values.length) {
      values.push(...this.values);

      for (let i = 1; i < this.source.length; i++) {
        source.push(this.source[i]);
      }
    }

    source[source.length - 1] += string;
  }

  log() {
    console.log(
      boldBlueBright('SQL:'),
      this.toString().trim().replaceAll('\n', '\n     '),
    );

    if (this.values.length) {
      console.log();
      console.log(boldBlueBright('SQL Params:'), this.values);
    }

    console.log();
    return this;
  }

  asValue() {
    this.respond = getValue;
    this.format = 'JSONCompactColumns';
    return this;
  }

  asObject() {
    this.respond = getJSON;
    this.format = 'JSONEachRow';
    return this;
  }

  asTuples() {
    this.respond = getAllJSONL;
    this.format = 'JSONCompactEachRow';
    return this;
  }

  asLookup(name) {
    this.respond = getJSON;
    this.format = 'JSONObjectEachRow';
    this.settings +=
      '&format_json_object_each_row_column_for_object_name=' +
      encodeURIComponent(name);
    return this;
  }

  asPretty() {
    this.respond = getText;
    this.format = 'PrettyCompact';
    this.settings +=
      '&output_format_pretty_color=1&output_format_pretty_row_numbers=0';
    return this;
  }

  useCompression(encoder = 'zstd') {
    this.settings += '&enable_http_compression=1';
    this.client.headers['accept-encoding'] = encoder;
    return this;
  }

  useCache(options) {
    this.cache = options || null;
    return this;
  }

  useSignal(signal) {
    this.signal = signal;
    return this;
  }

  toIterator() {
    this.respond = readJSONL;
    return this;
  }
}
