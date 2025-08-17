import { styleText } from 'node:util';

export class Reporter {
  count = 0;

  star() {
    console.log(styleText('blueBright', 'ClickHouse ') + styleText('green', 'Migrations Start'));
  }

  up(name) {
    this.count++;
    console.log(
      styleText('blueBright', 'ClickHouse ')
        + styleText('green', 'Migration: ')
        + styleText('bold', this.count.toString())
        + ' '
        + styleText('green', 'up ')
        + name,
    );
  }

  done() {
    console.log(styleText('blueBright', 'ClickHouse ') + styleText('green', 'Migrations Done'));
  }
}
