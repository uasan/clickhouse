const { stringify } = JSON;

export const encodeURIOrDefault = (value, defaultValue) => value ? encodeURIComponent(value) : defaultValue;

function encode(value) {
  switch (typeof value) {
    case 'number':
    case 'boolean':
    case 'bigint':
      return value;
    case 'string':
      return encodeURIComponent(value);
    case 'object':
      return encodeURIComponent(stringify(value));
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
