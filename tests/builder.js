import { ClickHouse } from '../src/ClickHouse.js';

const clickHouse = new ClickHouse({});

function test({ a, b, c }) {
  const builder = clickHouse.builder();

  builder.sql`WHERE (
    a = ${a} OR  
    b = ${b} OR   
    c = ${c}
  )`;

  console.log(builder.toString());
}

test({
  a: 'A',
  b: undefined, // 'B',
  c: undefined, // 'C',
});

test({
  a: 'A',
  b: 'B',
  c: undefined, // 'C',
});

test({
  a: 'A',
  b: undefined, // 'B',
  c: 'C',
});

test({
  a: undefined, // 'A',
  b: 'B',
  c: 'C',
});

test({
  a: 'A',
  b: 'B',
  c: 'C',
});
