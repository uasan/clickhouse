import { styleText } from 'node:util';

export class Reporter {
  count = 0;
  label = styleText('blueBright', 'ClickHouse ');

  star() {
    console.log(this.label + styleText('green', 'Migrations Start'));
  }

  up(name) {
    this.count++;

    console.log(
      this.label + styleText('green', 'Migration: ')
        + styleText('bold', this.count.toString())
        + ' '
        + styleText('green', 'up ')
        + name,
    );
  }

  done() {
    console.log(this.label + styleText('green', 'Migrations Done'));
  }
}
