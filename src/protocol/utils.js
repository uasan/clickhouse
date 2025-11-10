const { stringify } = JSON;

export const noop = () => {};

export const encodeURIOrDefault = (value, defaultValue) =>
  value ? encodeURIComponent(value) : defaultValue;

function toLiteral(value) {
  switch (typeof value) {
    case 'number':
    case 'boolean':
    case 'bigint':
      return value.toString();
    case 'string':
      return "'" + value.replaceAll("'", "\\'") + "'";
    case 'object':
      return Array.isArray(value)
        ? '[' + value.map(toLiteral).join(',') + ']'
        : stringify(value);
    default:
      throw `Invalid type parameter: ${typeof value}`;
  }
}

function encode(value) {
  switch (typeof value) {
    case 'number':
    case 'boolean':
    case 'bigint':
      return value.toString();
    case 'string':
      return encodeURIComponent(value);
    case 'object':
      return encodeURIComponent(
        Array.isArray(value)
          ? '[' + value.map(toLiteral).join(',') + ']'
          : stringify(value),
      );
    default:
      throw `Invalid type parameter: ${typeof value}`;
  }
}

export function getQueryParams(url, values) {
  for (let i = 0; i < values.length; i++) {
    url += '&param__' + (i + 1) + '=' + encode(values[i]);
  }
  return url;
}
