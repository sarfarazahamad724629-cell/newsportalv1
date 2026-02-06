import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./Stylings/NewsPreviewPage.css";
import {
  databases,
  DATABASE_ID,
  POSTS_COLLECTION_ID,
  Query,
} from "./appwrite/appwrite";

import waIcon from "/images/social-icons/waicon.png";
import igIcon from "/images/social-icons/igicon.png";
import fbIcon from "/images/social-icons/fbicon.png";
import xIcon from "/images/social-icons/xicon.png";

/**
 * NewsPreviewPage
 * - Static preview only
 * - Loads blocks + styles from DB
 * - NO editor logic
 */
const NewsPreviewPage = ({ news }) => {
  const { newsId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [stats, setStats] = useState({ likes: 0, shares: 0, comments: 0 });
  const [docId, setDocId] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);

  const previewState = useMemo(() => {
    if (news) {
      return {
        blocks: news.blocks || [],
        theme: news.theme || "light",
        title: news.title,
        author: news.author,
        createdDate: news.createdDate || news.publishedAt,
        stats: news.stats,
        category: news.category,
        id: news.$id || news.id,
      };
    }

    if (location.state) {
      return {
        blocks: location.state.blocks || [],
        theme: location.state.theme || "light",
        title: location.state.title,
        author: location.state.author,
        createdDate: location.state.postSettings?.createdDate,
        stats: location.state.stats,
        category: location.state.postSettings?.category,
        id: location.state.id,
      };
    }

    return null;
  }, [location.state, news]);

  const parseStats = (value) => {
    if (!value) return { likes: 0, shares: 0, comments: 0 };
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (error) {
        return { likes: 0, shares: 0, comments: 0 };
      }
    }
    return value;
  };

  /* -------------------------------
     🔹 Fetch news from DB
  -------------------------------- */
  useEffect(() => {
    if (previewState) {
      setBlocks(previewState.blocks || []);
      setTheme(previewState.theme || "light");
      setStats(parseStats(previewState.stats));
      setDocId(previewState.id || null);
      setLoading(false);
      return;
    }

    if (!newsId) {
      setLoading(false);
      return;
    }

    const loadNews = async () => {
      try {
        let doc = null;
        const res = await databases.listDocuments(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          [Query.equal("slug", newsId)]
        );

        doc = res.documents?.[0] || null;

        if (!doc && newsId.length > 20) {
          doc = await databases.getDocument(
            DATABASE_ID,
            POSTS_COLLECTION_ID,
            newsId
          );
        }

        const parsedBlocks =
          typeof doc?.blocks === "string" ? JSON.parse(doc.blocks) : doc?.blocks;

        const parsedStats = parseStats(doc?.stats);

        setBlocks(parsedBlocks || []);
        setTheme(doc?.theme || "light");
        setStats(parsedStats);
        setDocId(doc?.$id || null);
      } catch (err) {
        console.error("❌ Failed to load news", err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [newsId, previewState]);

  const displayTitle =
    previewState?.title ||
    news?.title ||
    location.state?.title ||
    "Untitled News";

  const displayAuthor =
    previewState?.author ||
    news?.author ||
    location.state?.author ||
    null;

  const displayDate =
    previewState?.createdDate ||
    news?.createdDate ||
    news?.publishedAt ||
    location.state?.postSettings?.createdDate ||
    location.state?.postSettings?.publishedAt ||
    null;

  const formattedDate = displayDate
    ? new Date(displayDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Draft preview";

  const displayCategory =
    previewState?.category ||
    news?.category ||
    location.state?.postSettings?.category ||
    "";

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          [Query.limit(50)]
        );

        // 🔍 Scoring-based search (word matches > character matches)
        const getSearchScore = (doc, term) => {
          const normalizedTerm = term.trim().toLowerCase();
          if (!normalizedTerm) return 0;

          const fields = [
            doc.title,
            doc.description,
            doc.content,
            doc.slug,
          ]
            .filter(Boolean)
            .map((value) => String(value).toLowerCase());

          // Include block text content for better coverage
          let blockText = "";
          try {
            const parsedBlocks =
              typeof doc.blocks === "string" ? JSON.parse(doc.blocks) : doc.blocks;
            blockText = (parsedBlocks || [])
              .map((block) => block.text || "")
              .join(" ")
              .toLowerCase();
          } catch (error) {
            blockText = "";
          }

          const fullText = [...fields, blockText].join(" ");
          if (!fullText) return 0;

          const words = normalizedTerm.split(/\s+/).filter(Boolean);
          let score = 0;

          // Word matches carry more weight
          words.forEach((word) => {
            const wordMatches = fullText.split(word).length - 1;
            score += wordMatches * 10;
          });

          // Character matches carry lower weight
          const charMatches = fullText.split(normalizedTerm).length - 1;
          score += charMatches * 2;

          return score;
        };

        const normalizedTerm = searchTerm.trim().toLowerCase();
        const results = (res.documents || [])
          .map((doc) => {
            const score = getSearchScore(doc, normalizedTerm);
            return { doc, score };
          })
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .map(({ doc }) => {
          let image = null;
          try {
            const parsedBlocks =
              typeof doc.blocks === "string" ? JSON.parse(doc.blocks) : doc.blocks;
            image = parsedBlocks?.find((block) => block.type === "image")?.src || null;
          } catch (error) {
            image = null;
          }

          return {
            id: doc.$id,
            title: doc.title || "Untitled News",
            image,
          };
        });

        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (error) {
        console.error("❌ Search failed", error);
        setSearchResults([]);
        setShowSearchDropdown(true);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (!displayCategory) {
      setRelatedNews([]);
      return;
    }

    const loadRelatedNews = async () => {
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          [Query.equal("category", displayCategory), Query.limit(10)]
        );

        const results = (res.documents || [])
          .filter((doc) => doc.$id !== docId)
          .sort((a, b) => {
            const aDate = new Date(a.createdDate || a.publishedAt || 0).getTime();
            const bDate = new Date(b.createdDate || b.publishedAt || 0).getTime();
            return bDate - aDate;
          })
          .slice(0, 4)
          .map((doc) => {
            let image = null;
            try {
              const parsedBlocks =
                typeof doc.blocks === "string"
                  ? JSON.parse(doc.blocks)
                  : doc.blocks;
              image =
                parsedBlocks?.find((block) => block.type === "image")?.src || null;
            } catch (error) {
              image = null;
            }

            return {
              id: doc.$id,
              title: doc.title || "Untitled News",
              image,
              createdDate: doc.createdDate || doc.publishedAt,
            };
          });

        setRelatedNews(results);
      } catch (error) {
        console.error("❌ Failed to load related news", error);
      }
    };

    loadRelatedNews();
  }, [displayCategory, docId]);

  const handleStatChange = async (key) => {
    const nextStats = {
      ...stats,
      [key]: (stats[key] || 0) + 1,
    };

    setStats(nextStats);

    if (!docId) return;

    try {
      await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        docId,
        {
          stats: JSON.stringify(nextStats),
        }
      );
    } catch (error) {
      console.error("❌ Failed to update stats", error);
    }
  };
  /* -------------------------------
     🔹 Helpers
  -------------------------------- */
  const getTextColor = (block, currentTheme) => {
    if (block.styles?.isCustomColor) return block.styles.color;
    return currentTheme === "light" ? "#020617" : "#e5e7eb";
  };

  const withLink = (block, content) => {
    if (!block.link?.url) return content;

    return (
      <a
        href={block.link.url}
        target={block.link.target || "_self"}
        rel="noopener noreferrer"
        style={{ textDecoration: "none", color: "inherit" }}
      >
        {content}
      </a>
    );
  };

  const renderRichText = (richText = []) =>
    richText.map((node, i) => {
      let content = node.text;

      if (node.marks?.includes("bold")) content = <strong>{content}</strong>;
      if (node.marks?.includes("italic")) content = <em>{content}</em>;
      if (node.marks?.includes("underline")) content = <u>{content}</u>;
      if (node.marks?.includes("strike")) content = <s>{content}</s>;
      if (node.marks?.includes("highlight")) {
        content = <span style={{ background: "#fde047" }}>{content}</span>;
      }
      if (node.marks?.includes("link")) {
        content = (
          <a href={node.attrs?.href} target="_blank" rel="noreferrer">
            {content}
          </a>
        );
      }

      return <span key={node.id || `rt-${i}`}>{content}</span>;
    });

  /* -------------------------------
     🔹 Social Icons
  -------------------------------- */
  const SOCIAL_ICON_URLS = {
    whatsapp: waIcon,
    instagram: igIcon,
    facebook: fbIcon,
    twitter: xIcon,
  };

  const AuthorSocialIcons = ({ socials, position, showText = true }) => {
    if (!socials) return null;

    return (
      <div className={`np-author-socials ${position}`}>
        {showText && <span className="np-follow-text">Follow Me On</span>}

        {Object.entries(socials).map(([key, url]) =>
          url ? (
            <a key={key} href={url} target="_blank" rel="noreferrer">
              <img
                src={SOCIAL_ICON_URLS[key]}
                className={`np-social-icon ${key}`}
                alt={`${key} social icon`}
              />
            </a>
          ) : null
        )}
      </div>
    );
  };

  /* -------------------------------
     🔹 STATIC renderBlock
  -------------------------------- */
  const renderBlock = (block) => {
    if (!block || typeof block !== "object") return null;

    switch (block.type) {
      case "paragraph":
        return withLink(
          block,
          <p
            className={`np-paragraph ${block.variant || ""}`}
            style={{
              fontSize: block.styles?.fontSize,
              color: getTextColor(block, theme),
              fontWeight: block.styles?.fontWeight,
              lineHeight: block.styles?.lineHeight,
              textAlign: block.styles?.textAlign,
              letterSpacing: block.styles?.letterSpacing,
              background: block.styles?.background,
              padding: block.styles?.padding,
              margin: block.styles?.margin,
              borderLeft: block.styles?.borderLeft,
              whiteSpace: "pre-wrap",
            }}
          >
            {renderRichText(block.richText || [{ text: block.text || "" }])}
          </p>
        );

      case "subheading":
        return withLink(
          block,
          <div style={{ margin: block.styles?.margin }}>
            <h3
              className="np-subheading"
              style={{
                fontSize: block.styles?.fontSize,
                fontWeight: block.styles?.fontWeight,
                color: getTextColor(block, theme),
                textAlign: block.styles?.textAlign,
                textTransform: block.styles?.textTransform,
              }}
            >
              {block.text}
            </h3>

            {block.styles?.divider && (
              <div
                style={{
                  height: 2,
                  width: "40px",
                  background: "#3b82f6",
                  margin:
                    block.styles.textAlign === "center"
                      ? "8px auto 0"
                      : "8px 0 0",
                }}
              />
            )}
          </div>
        );

      case "image":
        return withLink(
          block,
          <div className="np-image">
            <div
              className="np-image-inner"
              style={{
                justifyContent:
                  block.align === "left"
                    ? "flex-start"
                    : block.align === "right"
                    ? "flex-end"
                    : "center",
              }}
            >
              <img
                src={block.src}
                alt={block.alt || ""}
                className={`np-image-${block.size}`}
                style={{
                  borderRadius: block.radius,
                  boxShadow:
                    block.shadow === "soft"
                      ? "0 10px 25px rgba(0,0,0,.15)"
                      : block.shadow === "strong"
                      ? "0 20px 40px rgba(0,0,0,.35)"
                      : "none",
                  background: block.background,
                  cursor: block.lightbox ? "zoom-in" : "default",
                }}
              />
            </div>
            {block.caption && (
              <div className="np-image-caption">{block.caption}</div>
            )}
            {block.credit && (
              <div className="np-image-credit">Source: {block.credit}</div>
            )}
          </div>
        );

      case "gallery":
        if ((block.images || []).length === 0) {
          return null;
        }

        return (
          <div
            className="np-gallery"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${block.columns || 3}, 1fr)`,
              gap: 12,
            }}
          >
            {(block.images || []).map((img, i) => {
              const imageEl = (
                <img
                  src={img.src}
                  alt={img.alt || ""}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    cursor: img.link?.url ? "pointer" : "default",
                  }}
                />
              );

              return (
                <figure
                  key={img.id || img.url || `img-${i}`}
                  style={{ textAlign: "center" }}
                >
                  {img.link?.url ? (
                    <a
                      href={img.link.url}
                      target={img.link.target || "_self"}
                      rel="noopener noreferrer"
                    >
                      {imageEl}
                    </a>
                  ) : (
                    imageEl
                  )}

                  {img.caption && (
                    <figcaption className="np-gallery-caption">
                      {img.caption}
                    </figcaption>
                  )}

                  {img.credit && (
                    <div className="np-image-credit">
                      Source: {img.credit}
                    </div>
                  )}
                </figure>
              );
            })}
          </div>
        );

      case "author":
        if (!block.author) {
          return null;
        }

        const bg =
          block.backgroundImage &&
          (block.style === "cover" || block.applyBgToAll)
            ? `url(${block.backgroundImage})`
            : undefined;

        if ((block.style || "default") === "default") {
          return (
            <div className="np-author default">
              <img
                src={block.author.image}
                style={{
                  backgroundImage: bg,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div>
                <h4>{block.author.name}</h4>
                <p className="role">{block.author.role}</p>
                <p>{block.author.about}</p>
              </div>
            </div>
          );
        }

        if (block.style === "centered-social") {
          const socials = block.socials || {};

          return (
            <div
              className="np-author cover centered centered-social"
              style={{
                backgroundImage: block.backgroundImage
                  ? `url(${block.backgroundImage})`
                  : undefined,
              }}
            >
              <div className="np-centered-social-layout">
                <AuthorSocialIcons
                  socials={{
                    whatsapp: socials.whatsapp,
                    instagram: socials.instagram,
                  }}
                  position="row"
                  showText={false}
                />

                <div className="np-author-overlay-box">
                  <div className="np-author-center">
                    <img src={block.author.image} />
                    <h4>{block.author.name}</h4>
                    <p className="role">{block.author.role}</p>
                    <p>{block.author.about}</p>
                  </div>
                </div>

                <AuthorSocialIcons
                  socials={{
                    facebook: socials.facebook,
                    twitter: socials.twitter,
                  }}
                  position="row"
                  showText={false}
                />
              </div>
            </div>
          );
        }

        if (block.style === "default-social") {
          return (
            <div className="np-author default" style={{ backgroundImage: bg }}>
              <img src={block.author.image} />
              <div>
                <h4>{block.author.name}</h4>
                <p className="role">{block.author.role}</p>
                <p>{block.author.about}</p>
                <AuthorSocialIcons
                  socials={block.socials}
                  position="bottom-right"
                  showText={true}
                />
              </div>
            </div>
          );
        }

        if (block.style === "cover") {
          return (
            <div
              className="np-author cover"
              style={{
                backgroundImage: `url(${block.backgroundImage})`,
              }}
            >
              <div className="overlay">
                <img src={block.author.image} />
                <h4>{block.author.name}</h4>
                <p className="role">{block.author.role}</p>
                <p>{block.author.about}</p>
              </div>
            </div>
          );
        }

        return null;

      case "quote":
        return (
          <blockquote
            className="np-quote"
            style={{
              color: getTextColor(block, theme),
              borderLeftColor: "#3b82f6",
            }}
          >
            “{block.text}”
          </blockquote>
        );

      case "list":
        return (
          <ul
            className="np-list"
            style={{
              color: getTextColor(block, theme),
            }}
          >
            {(block.items || [])
              .filter((item) => item.trim() !== "")
              .map((item, i) => (
                <li key={`${block.id}-item-${i}`}>{item}</li>
              ))}
          </ul>
        );

      case "ad":
        return <div className="np-ad">Advertisement – {block.variant}</div>;

      default:
        return null;
    }
  };

  /* -------------------------------
     🔹 Render
  -------------------------------- */
  if (loading) return <div className="np-left-preview">Loading…</div>;

  return (
    <div className="news-preview-page" data-theme={theme}>
      <header className="np-topbar">
        <div className="np-topbar-left">
          <button className="np-button" onClick={() => navigate(-1)}>
            Back
          </button>
          <div className="np-site">
            <h1 className="np-site-title">Social Activity BSP</h1>
            <span className="np-site-tagline">
              24/7 Digital News Network | Breaking stories, social updates &
              real voices from the ground.
            </span>
          </div>
        </div>
        <div className="np-topbar-actions">
          <div className="np-search">
            <input
              className="np-search-input"
              placeholder="Search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={() => searchTerm && setShowSearchDropdown(true)}
            />
            {showSearchDropdown && (
              <div className="np-search-dropdown">
                {searchLoading ? (
                  <div className="np-search-empty">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="np-search-empty">No News Found</div>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      className="np-search-item"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        navigate(`/news/${result.id}`);
                      }}
                    >
                      <div className="np-search-thumb">
                        {result.image ? (
                          <img src={result.image} alt={result.title} />
                        ) : (
                          <span>SA</span>
                        )}
                      </div>
                      <div className="np-search-title">{result.title}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            className="np-button"
            onClick={() =>
              setTheme((prev) => (prev === "light" ? "dark" : "light"))
            }
          >
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      </header>

      <div className="np-layout">
        <aside className="np-sidebar">
          <div className="np-sidebar-title">About the Author</div>
          <div className="np-sidebar-card">
            <img
              className="np-author-avatar"
              src="/admin.png"
              alt={displayAuthor?.name || "Author"}
            />
            <div>
              <strong>{displayAuthor?.name || "Staff Reporter"}</strong>
              <div className="np-meta">
                {displayAuthor?.role || "News Desk"}
              </div>
            </div>
            <div className="np-meta">
              {displayAuthor?.about || "Sharing verified stories and updates."}
            </div>
          </div>
          <div className="np-sidebar-divider" />
          <div className="np-sidebar-section">
            <div className="np-sidebar-title">Explore</div>
            <button className="np-sidebar-link" type="button">
              Latest Headlines
            </button>
            <button className="np-sidebar-link" type="button">
              Breaking News
            </button>
            <button className="np-sidebar-link" type="button">
              Local Updates
            </button>
            <button className="np-sidebar-link" type="button">
              Trending Stories
            </button>
          </div>
        </aside>

        <main className="np-main">
          <section className="np-article-header">
            <h2 className="np-article-title">{displayTitle}</h2>
            <div className="np-article-meta">
              <span>{formattedDate}</span>
              <span>{displayAuthor?.name || "Social Activity BSP"}</span>
            </div>
            <div className="np-article-actions">
              <button
                className="np-action-button"
                type="button"
                onClick={() => handleStatChange("likes")}
              >
                👍 Like
                <span className="np-action-count">{stats.likes || 0}</span>
              </button>
              <button
                className="np-action-button"
                type="button"
                onClick={() => handleStatChange("shares")}
              >
                🔗 Share
                <span className="np-action-count">{stats.shares || 0}</span>
              </button>
              <button
                className="np-action-button"
                type="button"
                onClick={() => handleStatChange("comments")}
              >
                💬 Comments
                <span className="np-action-count">{stats.comments || 0}</span>
              </button>
            </div>
          </section>

          <section className="np-left-preview">
            {blocks.length === 0 ? (
              <div className="np-empty-preview">
                No preview content available.
              </div>
            ) : (
              blocks.map((block, index) => (
                <div
                  key={block.id || `preview-${index}`}
                  className="np-preview-block"
                >
                  <div className="np-preview-content">{renderBlock(block)}</div>
                </div>
              ))
            )}
            {relatedNews.length > 0 && (
              <div className="np-related">
                <div className="np-related-title">You might also like</div>
                <div className="np-related-grid">
                  {relatedNews.map((item) => (
                    <button
                      key={item.id}
                      className="np-related-card"
                      onClick={() => navigate(`/news/${item.id}`)}
                    >
                      <div className="np-related-thumb">
                        {item.image ? (
                          <img src={item.image} alt={item.title} />
                        ) : (
                          <span>SA</span>
                        )}
                      </div>
                      <div className="np-related-info">
                        <div className="np-related-headline">{item.title}</div>
                        {item.createdDate && (
                          <div className="np-related-date">
                            {new Date(item.createdDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default NewsPreviewPage;

