import { clickHouse } from './client.js';

console.log(
  await clickHouse.sql`
    SELECT 1
`,
);
