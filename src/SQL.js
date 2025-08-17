export class SQL {
  params = {};
  source = [];

  client = null;

  constructor(client, source, values) {
    this.client = client;
    this.source.push(source[0]);

    for (let i = 0; i < values.length; ) {
      if (typeof values[i]?.injectSQL === 'function') {
        values[i].injectSQL(this, source[++i]);
      } else {
        const val = values[i];
        const sql = source[++i];
        const pos = sql.search(/[^\w:]/);

        this.params['_' + i] = val;
        this.source.push(pos === -1 ? sql + '}' : sql.slice(0, pos) + '}' + sql.slice(pos));
      }
    }
  }

  async then(resolve, reject) {
    try {
      const res = await this.client.query({
        query: this.toString(),
        format: 'JSONEachRow',
        query_params: this.params,
      });
      resolve(await res.json());
    } catch (error) {
      reject(error);
    }
  }

  toString() {
    if (this.source.length === 1) {
      return this.source[0];
    } else {
      const { source } = this;
      let text = source[0];

      for (let i = 1; i < source.length; i++) text += '{_' + i + source[i];
      return text;
    }
  }
}
