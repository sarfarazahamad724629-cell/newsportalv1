export const getFirstImageFromBlocks = (blocks) => {
  if (!blocks) return null;

  try {
    const parsed = typeof blocks === "string"
      ? JSON.parse(blocks)
      : blocks;

    const imageBlock = parsed.find(b => b.type === "image");
    return imageBlock?.src || null;
  } catch (err) {
    console.error("Invalid blocks JSON", err);
    return null;
  }
};
