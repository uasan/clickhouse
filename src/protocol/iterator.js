import { ClickHouseError } from '../protocol/ClickHouseError.js';
import { decoder } from '../protocol/respond.js';
import { noop } from '../protocol/utils.js';

const identity = x => x;

const formats = {
  TabSeparatedRaw: identity,
};

export function returnBody({ body }) {
  return body;
}

export async function* readStreamLines({ body: stream }) {
  let isDone = false;

  const parse = formats[this.format] ?? JSON.parse;
  const bytes = new Uint8Array(
    new ArrayBuffer(0, { maxByteLength: 536_870_888 }),
  );

  try {
    for await (const chunk of stream) {
      let lastPos = 0;
      let nextPost = chunk.indexOf(10);

      while (nextPost !== -1) {
        if (bytes.length) {
          const { length } = bytes;

          bytes.buffer.resize(length + nextPost);
          bytes.set(chunk.subarray(0, nextPost), length);
          yield parse(decoder.decode(bytes));
          bytes.buffer.resize(0);
        } else {
          yield parse(decoder.decode(chunk.subarray(lastPos, nextPost)));
        }

        lastPos = nextPost + 1;
        nextPost = chunk.indexOf(10, lastPos);
      }

      if (lastPos < chunk.length) {
        const size = chunk.length - lastPos;

        bytes.buffer.resize(bytes.length + size);
        bytes.set(chunk.subarray(lastPos), bytes.length - size);
      }
    }
    isDone = true;
  } catch (error) {
    throw ClickHouseError.from(error);
  } finally {
    if (isDone === false) {
      stream.cancel().catch(noop);
    }
  }
}
