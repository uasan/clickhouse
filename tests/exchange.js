import { env } from 'node:process';
import { ClickHouse, ClickHouseTable } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({
  url: env.CLICKHOUSE_URL,
  username: env.CLICKHOUSE_USERNAME,
  password: env.CLICKHOUSE_PASSWORD,
});

class MyModel extends ClickHouseTable {
  static tableName = 'default.test_exchange';

  async up({ clickHouse }) {
    await clickHouse.sql`
      CREATE OR REPLACE TABLE ${MyModel} (
        id Int32
      )
      ENGINE = MergeTree
      ORDER BY (id)`;
  }

  async down({ clickHouse }) {
    await clickHouse.sql`
      DROP TABLE IF EXISTS ${MyModel}
    `;
  }
}

await new MyModel().up({ clickHouse });

await MyModel.exchange(clickHouse.sql`
  SELECT 1  
`);

console.log(await clickHouse.sql`SELECT * FROM ${MyModel}`);
