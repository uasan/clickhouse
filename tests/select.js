import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({});

console.time('LOAD');

await clickHouse.sql`
  SELECT sex
  FROM source.pdl_profiles
  LIMIT 2`;

console.timeEnd('LOAD');
