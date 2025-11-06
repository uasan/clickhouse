import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({});

const arrayStrings = ['A', 'N\'C', 'B', 'C'];

const res = await clickHouse.sql`SELECT ${arrayStrings}:Array(String)`.log();

console.log(res);
