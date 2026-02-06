//richText.js
export const applyMarkToRichText = (richText, start, end, mark) => {
  let pos = 0;
  const result = [];

  richText.forEach(node => {
    const len = node.text.length;
    const nodeStart = pos;
    const nodeEnd = pos + len;

    if (nodeEnd <= start || nodeStart >= end) {
      result.push(node);
    } else {
      // before
      if (start > nodeStart) {
        result.push({
          text: node.text.slice(0, start - nodeStart),
          marks: node.marks || [],
        });
      }

      // selected (IMPORTANT CHANGE)
      result.push({
        text: node.text.slice(
          Math.max(0, start - nodeStart),
          Math.min(len, end - nodeStart)
        ),
        marks: [...new Set([mark])], // ❌ old marks removed
      });

      // after
      if (end < nodeEnd) {
        result.push({
          text: node.text.slice(end - nodeStart),
          marks: node.marks || [],
        });
      }
    }

    pos += len;
  });

  return normalizeRichText(result);
};
const normalizeRichText = (nodes) => {
  const result = [];

  nodes.forEach(node => {
    const last = result[result.length - 1];

    if (
      last &&
      JSON.stringify(last.marks || []) === JSON.stringify(node.marks || [])
    ) {
      last.text += node.text;
    } else {
      result.push({ ...node });
    }
  });

  return result;
};
