import { env } from 'node:process';
import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({
  cache: {
    ttl: 3600,
    nonDeterministicFunction: 'throw',
  },
  username: env.CLICKHOUSE_USERNAME,
  password: env.CLICKHOUSE_PASSWORD,
});

const builder = clickHouse.builder();
builder.sql`
  SELECT now() AS test_cache
`.useCache({
  nonDeterministicFunction: 'save',
});

await clickHouse.sql`${builder}`;

console.log(
  await clickHouse.sql`
    SELECT event, value
    FROM system.events
    WHERE event LIKE 'QueryCache%'
  `.useCache(false),
);
