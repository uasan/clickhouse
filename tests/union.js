import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({});

const queryA = clickHouse.sql`SELECT 'A' AS marker, 1 AS result`;
const queryB = clickHouse.sql`SELECT 'B' AS marker, 2 AS result`;
const queryC = clickHouse.sql`SELECT 'C' AS marker, 3 AS result`;

const unionQuery = clickHouse.unionAll(queryA, queryB, queryC);

unionQuery.log();

console.log('Simple', await unionQuery);
console.log('Lookup', await unionQuery.asLookup('marker'));
