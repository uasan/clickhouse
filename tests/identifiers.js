import { env } from 'node:process';
import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({
  url: env.CLICKHOUSE_URL,
  username: env.CLICKHOUSE_USERNAME,
  password: env.CLICKHOUSE_PASSWORD,
});

async function test() {
  const columns = ['event', 'value'];

  await clickHouse.sql`
    SELECT
      sum(value) OVER (PARTITION BY ${columns}:Identifiers)
    FROM system.events WHERE value != ${10}
    ORDER BY ${columns}:Identifiers
    LIMIT 1
  `.log();
}

test().catch(console.error);
