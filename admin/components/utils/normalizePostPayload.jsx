export function normalizePostPayload(raw) {
  return {
    id: raw.id || null,

    title: raw.title || "",
    slug: raw.slug || "",

    status: raw.status || "draft",
    language: raw.language || "hi",
    theme: raw.theme || "light",
    location: raw.location ? JSON.stringify(raw.location) : null,
    category: raw.category || "",

    // tags ARRAY ko string bana do (Appwrite friendly)
    tags: Array.isArray(raw.tags) ? raw.tags.join(",") : "",

    seo: raw.seo || "",

    stats:
      raw.stats !== undefined && raw.stats !== null
        ? JSON.stringify(raw.stats)
        : null,

    author:
      raw.author !== undefined && raw.author !== null
        ? JSON.stringify(raw.author)
        : null,

    blocks: Array.isArray(raw.blocks)
      ? JSON.stringify(raw.blocks)
      : "[]",

    content: raw.content || null,

    publishedAt: raw.publishedAt || null,
    updatedAt: new Date().toISOString(),

    createdDate: raw.createdDate
  ? new Date(raw.createdDate).toISOString()
  : null,

  };
}
