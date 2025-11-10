export const { parse } = JSON;
export const decoder = new TextDecoder();

export const getText = async res => await res.text();
export const getValue = async res => (await res.json())[0]?.[0];

export async function getJSON(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function getAllJSONL(res) {
  const bytes = await res.bytes();

  if (bytes.length) {
    let lastPos = bytes.indexOf(10);
    let nextPos = 0;

    while ((nextPos = bytes.indexOf(10, lastPos + 1)) !== -1) {
      bytes[lastPos] = 44;
      lastPos = nextPos;
    }

    return parse('[' + decoder.decode(bytes) + ']');
  } else {
    return [];
  }
}
