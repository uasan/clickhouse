import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({
  cache: {
    ttl: 3600,
    nondeterministicFunction: 'save',
  },
});

await clickHouse.sql`SELECT today() AS test_cache`;

console.log(
  await clickHouse.sql`
    SELECT event, value
    FROM system.events
    WHERE event LIKE 'QueryCache%'
  `.useCache(false),
);
