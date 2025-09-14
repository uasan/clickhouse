export function toInputBody(values) {
  if (Array.isArray(values)) {
    let text = '';

    for (let i = 0; i < values.length; i++) {
      text += JSON.stringify(values[i]) + '\n';
    }

    return text;
  } else {
    return values;
  }
}
