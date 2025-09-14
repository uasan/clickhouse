const form = new FormData();
form.append(
  'query',
  `
    SELECT 'key' AS key_name, * FROM smartdata.jobs_posts AS t LIMIT 3
    FORMAT JSONObjectEachRow
    SETTINGS format_json_object_each_row_column_for_object_name = 'key_name'`,
);

form.append('param_test', 'Hello');
form.append('default_format', 'JSON');

// JSONEachRow
// JSONCompactColumns
const res = await fetch(
  'http://clickhouse.aws.hrf:8123/?enable_http_compression=1&default_format=JSONEachRow',
  {
    method: 'POST',
    headers: {
      connection: 'keep-alive',
      'accept-encoding': 'zstd',
      'x-clickhouse-database': 'default',
      'x-clickhouse-user': 'default',
      'x-clickhouse-key': '',
      // 'content-type': 'multipart/form-data',
    },
    body: form,
  },
);

console.log(res.status, res.headers);

// const decoder = new TextDecoder();

// for await (const chunk of res.body.pipeThrough(new TextDecoderStream())) {
//   console.count('chunk');
//   // console.log(decoder.decode(chunk.subarray(0, chunk.indexOf(10))));
// }

console.log(await res.text());
