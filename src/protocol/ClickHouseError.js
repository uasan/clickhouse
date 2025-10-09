import { boldRed } from '../sql/utils.js';

const DIR = import.meta.resolve('../../');
const filterStack = line => !line.includes(DIR) && line.includes('file://');
const errorRegExp = /(Code|Error): (?<code>\d+).*Exception: (?<message>.+)\((?<type>(?=.+[A-Z]{3})[A-Z0-9_]+?)\)/s;

export const filterErrorStack = stack =>
  stack.split('\n').filter(filterStack).join('\n')
  || stack.slice(stack.indexOf('\n') + 1);

export class ClickHouseError extends Error {
  constructor(message) {
    super(message);
    this.stack = boldRed('ClickHouse Error: ') + this.message + '\n' + filterErrorStack(this.stack);
  }

  static from(error) {
    if (error?.constructor === this) {
      return error;
    }

    switch (typeof error) {
      case 'string':
        return new this(error);

      case 'object':
        return Object.assign(new this(error.cause?.message || error.message), error.cause ?? error);
    }
  }

  static parse(text) {
    const group = text.match(errorRegExp).groups;
    const error = new this(group.message.trim());

    error.code = group.code;
    error.type = group.type;

    return error;
  }
}
