import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({
  cache: {
    ttl: 3600,
  },
});

await clickHouse.sql`SELECT 'value' AS test_cache`;

console.log(
  await clickHouse.sql`
    SELECT event, value
    FROM system.events
    WHERE event LIKE 'QueryCache%'
  `.useCache(false),
);
