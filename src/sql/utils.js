import { styleText } from 'node:util';

export const boldBlueBright = text => styleText('bold', styleText('blueBright', text));

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
      }

    default:
      throw new Error('Undefined type SQL value parameter');
  }
}
