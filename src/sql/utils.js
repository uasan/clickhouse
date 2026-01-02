import { styleText } from 'node:util';

export const boldRed = text => styleText('bold', styleText('red', text));
export const boldBlueBright = text =>
  styleText('bold', styleText('blueBright', text));

export const isUndefined = value => value === undefined;

export function getTypeValue(value) {
  switch (typeof value) {
    case 'string':
      return ':String';

    case 'number':
      return ':Float64';

    case 'boolean':
      return ':Bool';

    case 'bigint':
      return ':Int64';

    case 'undefined':
      return ':Null';

    case 'object':
      if (value === null) {
        return ':Null';
      } else if (value instanceof Date) {
        // SETTINGS date_time_input_format='best_effort'
        return ':DateTime';
      } else if (Array.isArray(value)) {
        return `:Array(${getTypeValue(value[0]).slice(1)})`;
      } else {
        return ':Unknown';
      }

    default:
      return ':Unknown';
  }
}

export function undefineSQL(source, values, index) {
  let sql = source[index];
  let right = source[index + 1];
  let pos = sql.lastIndexOf('\n');

  if (pos !== -1) {
    sql = sql.slice(0, pos);
  }

  if (values.length === index + 1) {
    const end = sql.trimEnd();

    if (end.slice(-3).trimStart() === 'OR') {
      sql = end.slice(0, -2);
    } else if (end.slice(-4).trimStart() === 'AND') {
      sql = end.slice(0, -3);
    }

    source.length--;
    values.length--;
  } else {
    values.splice(index, 1);
    source.splice(index, 1);
  }

  pos = right.lastIndexOf('\n');

  if (pos !== -1) {
    sql += right.slice(pos);
  }

  source[index] = sql;
}
