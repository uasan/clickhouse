import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({
  cache: {
    ttl: 3600,
    nonDeterministicFunction: 'ignore',
  },
});

await clickHouse.sql`SELECT today() AS test_cache`.useCache({
  nonDeterministicFunction: 'save',
});

console.log(
  await clickHouse.sql`
    SELECT event, value
    FROM system.events
    WHERE event LIKE 'QueryCache%'
  `.useCache(false),
);
