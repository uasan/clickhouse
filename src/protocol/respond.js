export const { parse } = JSON;
export const decoder = new TextDecoder();

const countRows = res => Number(parse(res.headers.get('x-clickhouse-summary')).total_rows_to_read);

export const getValue = async res => ((await res.json())[0]?.[0]);

export async function getJSON(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAllRows(res) {
  const rows = [];
  const buffer = new Uint8Array(new ArrayBuffer(0, { maxByteLength: 536_870_888 }));

  for await (const chunk of res.body) {
    let lastPos = 0;
    let nextPost = chunk.indexOf(10);

    while (nextPost !== -1) {
      if (buffer.length) {
        const { length } = buffer;

        buffer.buffer.resize(length + nextPost);
        buffer.set(chunk.subarray(0, nextPost), length);
        rows.push(parse(decoder.decode(buffer)));
        buffer.buffer.resize(0);
      } else {
        rows.push(parse(decoder.decode(chunk.subarray(lastPos, nextPost))));
      }

      lastPos = nextPost + 1;
      nextPost = chunk.indexOf(10, lastPos);
    }

    if (lastPos < chunk.length) {
      const size = chunk.length - lastPos;
      buffer.buffer.resize(buffer.length + size);
      buffer.set(chunk.subarray(lastPos), buffer.length - size);
    }
  }

  return rows;
}
