import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({});

const value = [1, 2, 3];
const builder = clickHouse.builder();

builder.sql`
  SELECT *
  FROM VALUES(1, 2) AS t`;

builder.sql`WHERE (  
  ${1} OR
  c1   IN ${value}:Array(Int32))`;

console.log(await builder.log());
