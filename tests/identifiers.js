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
    SELECT ${columns}:Identifiers FROM system.events LIMIT 1
  `.log();
}

test().catch(console.error);
