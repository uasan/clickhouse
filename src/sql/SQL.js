import { boldBlueBright, getTypeValue } from './utils.js';

export class SQL {
  client = null;
  format = 'JSONEachRow';

  source = [];
  values = [];

  constructor({ client }) {
    this.client = client;
  }

  async send() {
    const res = await this.client.query({
      query: this.toString(),
      format: this.format,
      query_params: this.getQueryParams(),
    });

    return (await res.json());
  }

  then(resolve, reject) {
    this.send().then(resolve, reject);
  }

  getQueryParams() {
    const params = {};
    for (let i = 0; i < this.values.length; i++) params['_' + (i + 1)] = this.values[i];
    return params;
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

        let pos = -1;
        let sql = source[i + 1];

        if (sql[0] === ':') {
          pos = sql.search(/[^\w:]/);
        } else {
          sql = getTypeValue(values[i]) + sql;
        }

        this.source.push(pos === -1 ? sql + '}' : sql.slice(0, pos) + '}' + sql.slice(pos));
      }
    }

    return this;
  }

  make() {}

  toString() {
    this.make();

    if (this.values.length) {
      let text = this.source[0];

      for (let i = 1; i < this.source.length; i++) text += '{_' + i + this.source[i];
      return text;
    } else {
      return this.source[0];
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
    console.log(boldBlueBright('SQL:'), this.toString().trim().replaceAll('\n', '\n     '));

    if (this.values.length) {
      console.log();
      console.log(boldBlueBright('SQL Params:'), this.values);
    }

    console.log();
    return this;
  }

  asObject() {
    this.format = 'JSONCompact';
    return this;
  }
}
