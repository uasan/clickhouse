import { SQL } from './SQL.js';

class Parts extends Array {
  add(command, delimiter = '') {
    this.push({
      command,
      delimiter,
      source: [],
      values: [],
    });
    return this;
  }
}

export class SQLBuilder extends SQL {
  parts = new Parts()
    .add('WITH', ',\n')
    .add('SELECT', ', ')
    .add('FROM')
    .add('JOIN', '\nJOIN ')
    .add('LEFT JOIN', '\nLEFT JOIN ')
    .add('RIGHT JOIN', '\nRIGHT JOIN ')
    .add('CROSS JOIN', '\nCROSS JOIN ')
    .add('FULL JOIN', '\nFULL JOIN ')
    .add('WHERE', ' AND ')
    .add('GROUP BY', ', ')
    .add('HAVING', ', ')
    .add('ORDER BY', ', ')
    .add('LIMIT')
    .add('OFFSET');

  sql(source, ...values) {
    source = [...source];
    const sql = source[0].trimStart();

    for (let i = 0; i < this.parts.length; i++) {
      if (sql.startsWith(this.parts[i].command)) {
        const part = this.parts[i];

        this.source = part.source;
        this.values = part.values;

        if (part.source.length) {
          source[0] = part.delimiter + sql.slice(part.command.length).trimStart();
        } else {
          source[0] = sql;
        }

        return this.set(source, values);
      }
    }

    throw new Error('Unknown SQL build command: ' + sql);
  }

  make() {
    this.source = [];
    this.values = [];

    for (let i = 0; i < this.parts.length; i++) {
      if (this.parts[i].source.length) {
        if (this.source.length) {
          this.source[this.source.length - 1] += '\n' + this.parts[i].source[0];
          this.source.push(...this.parts[i].source.slice(1));
        } else {
          this.source.push(...this.parts[i].source);
        }

        this.values.push(...this.parts[i].values);
      }
    }

    return this;
  }
}
