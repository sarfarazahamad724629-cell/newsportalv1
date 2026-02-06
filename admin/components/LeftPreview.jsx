import { useState, useRef , useEffect } from "react";
import "./Stylings/LeftPreview.css";
import waIcon from "/images/social-icons/waicon.png";
import igIcon from "/images/social-icons/igicon.png";
import fbIcon from "/images/social-icons/fbicon.png";
import xIcon from "/images/social-icons/xicon.png";
import TextareaAutosize from 'react-textarea-autosize';
import { applyMarkToRichText } from "../components/utils/richText";


const LeftPreview = ({ blocks, selectedBlockId, onSelectBlock,theme,onReorderBlocks,onUpdateBlock }) => {
  const [dragIndex, setDragIndex] = useState(null);

  const safeJSONParseWithDefault = (value, fallback) => {
  if (!value || typeof value !== "string") return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};



  //Floating toolbar for Left Preview paragraph editing
  const TOOLBAR_ITEMS = [
  { id: "bold", label: "B", title: "Bold" },
  { id: "italic", label: "I", title: "Italic" },
  { id: "underline", label: "U", title: "Underline" },
  { id: "highlight", label: "🖍", title: "Highlight" },
  { id: "clear", label: "✖", title: "Clear formatting" },
];

const isMarkActive = (mark) => {
  const block = blocks.find(b => b.id === inlineToolbar.blockId);
  if (!block) return false;

  const richText = block.richText ?? [{ text: block.text || "" }];

  return richText.some(node =>
    node.marks?.includes(mark)
  );
};



  const [inlineToolbar, setInlineToolbar] = useState({
  visible: false,
  x: 0,
  y: 0,
  blockId: null,
});

const handleTextSelection = (blockId) => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    setInlineToolbar(prev => ({ ...prev, visible: false }));
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  setInlineToolbar({
    visible: true,
    x: rect.left + rect.width / 2,
    y: rect.top - 8,
    blockId,
  });

  console.log("selected:", selection.toString());

};



  //Paragraph Editing inside Left Preview
  const [editingBlockId, setEditingBlockId] = useState(null);
  const editRef = useRef(null);
  const containerRef = useRef(null);

  //new state
  const applyInlineMark = (mark) => {
  const block = blocks.find(b => b.id === inlineToolbar.blockId);
  if (!block) return;

  //New code to get rich text
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


  // 🔥 CLEAR FORMATTING
  if (mark === "clear") {
    onUpdateBlock({
      ...block,
      richText: [{ text: richTextToPlain(getRichText(block)) }],
    });

    setInlineToolbar(prev => ({ ...prev, visible: false }));
    return;
  }

  const sel = getSelectionOffsets(
    paraRefs.current[inlineToolbar.blockId]
  );
  if (!sel) return;

  const updated = applyMarkToRichText(
    getRichText(block),
    sel.start,
    sel.end,
    mark
  );

  onUpdateBlock({
    ...block,
    richText: updated,
  });

  setInlineToolbar(prev => ({ ...prev, visible: false }));
};




  const paraRefs = useRef({});


  useEffect(() => {
  const hide = (e) => {
    if (e.key === "Escape") {
      setInlineToolbar({ visible: false });
    }
  };

  window.addEventListener("keydown", hide);
  window.addEventListener("click", hide);

  return () => {
    window.removeEventListener("keydown", hide);
    window.removeEventListener("click", hide);
  };
}, []);



  useEffect(() => {
  if (containerRef.current) {
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }
}, [blocks.length]); // 👈 sirf new block add hone par

  //new code to implement specific styling for specific texts or sentences
  const richTextToPlain = (richText) =>
  richText.map(n => n.text).join("");

  const getRichText = (block) =>
  block.richText ?? [{ text: block.text || "" }];

  //another one to render rich text
  const renderRichText = (richText) =>
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

    // ✅ ONLY key goes here
    return <span key={node.id || `rt-${i}`}>{content}</span>;
  });



//utility ref for paragraph
const getSelectionOffsets = (container) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;

  let start = 0;
  let end = 0;
  let foundStart = false;

  const walk = (node) => {
    if (node.nodeType === 3) {
      const len = node.textContent.length;

      if (node === range.startContainer) {
        start += range.startOffset;
        foundStart = true;
      } else if (!foundStart) {
        start += len;
      }

      if (node === range.endContainer) {
        end = start + range.endOffset;
      }
    }
    node.childNodes.forEach(walk);
  };

  walk(container);

  return start === end ? null : { start, end };
};
//another fucking code
const applyMark = (block, mark) => {
  const sel = getSelectionOffsets(paraRef.current);
  if (!sel) return;

  const updated = applyMarkToRichText(
    getRichText(block),
    sel.start,
    sel.end,
    mark
  );

  onUpdateBlock({
    ...block,
    richText: updated,
  });
};

  //new code ends here


useEffect(() => {
  if (editingBlockId && editRef.current) {
    editRef.current.focus();
  }
}, [editingBlockId]);




  //social icons component for author block
  const SOCIAL_ICON_URLS = {
  whatsapp: waIcon,
  instagram: igIcon,
  facebook: fbIcon,
  twitter: xIcon,
};

const AuthorSocialIcons = ({ socials, position, showText = true }) => {
  if (!socials) return null;

  return (
    <div className={`author-socials ${position}`}>
      {showText && <span className="follow-text">Follow Me On</span>}

      {socials.whatsapp && (
        <a key="whatsapp" href={socials.whatsapp} target="_blank" rel="noreferrer">
          <img src={SOCIAL_ICON_URLS.whatsapp} className="social-icon whatsapp" />
        </a>
      )}

      {socials.instagram && (
        <a key="instagram" href={socials.instagram} target="_blank" rel="noreferrer">
          <img src={SOCIAL_ICON_URLS.instagram} className="social-icon instagram" />
        </a>
      )}

      {socials.facebook && (
        <a key="facebook" href={socials.facebook} target="_blank" rel="noreferrer">
          <img src={SOCIAL_ICON_URLS.facebook} className="social-icon facebook" />
        </a>
      )}

      {socials.twitter && (
        <a key="twitter" href={socials.twitter} target="_blank" rel="noreferrer">
          <img src={SOCIAL_ICON_URLS.twitter} className="social-icon twitter" />
        </a>
      )}
    </div>
  );
};



  const getTextColor = (block, theme) => {
  if (block.styles?.isCustomColor) {
    return block.styles.color;
  }

  // default: theme opposite
  return theme === "light" ? "#020617" : "#e5e7eb";
};


  const withLink = (block, content) => {
  if (!block.link?.url) return content;

  return (
    <a
      href={block.link.url}
      target={block.link.target || "_self"}
      rel="noopener noreferrer"
      style={{ textDecoration: "none", color: "inherit" }}
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </a>
  );
};

  const renderBlock = (block) => {
    if (!block || typeof block !== "object") return null;

    switch (block.type) {
      
      case "paragraph": {
  const isEditing = editingBlockId === block.id;

  return withLink(
    block,
    isEditing ? (
      <TextareaAutosize
        ref={editRef}
        onMouseUp={() => handleTextSelection(block.id)}
        value={richTextToPlain(getRichText(block))}
        minRows={3}
        className="lp-paragraph-edit"
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
          width: "100%",
          resize: "none",
        }}
        onChange={(e) =>
  onUpdateBlock({
    ...block,
    text: e.target.value, // TEMP plain text only
  })
}

        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditingBlockId(null);
          }
        }}
        onBlur={() => {
  onUpdateBlock({
    ...block,
    richText: [{ text: block.text }],
    text: undefined,
  });
  setEditingBlockId(null);
}}

      />
    ) : (
      <p
        ref={el => (paraRefs.current[block.id] = el)}





        onContextMenu={(e) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    e.preventDefault(); // 🔥 stop browser menu

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setInlineToolbar({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      blockId: block.id,
    });
  }}



        className={`lp-paragraph ${block.variant}`}
         onMouseUp={() => handleTextSelection(block.id)}
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
        {renderRichText(getRichText(block))}
      </p>
      
    )
    
  );
}



      case "subheading":
  return withLink(
    block,
    <div style={{ margin: block.styles?.margin }}>
      <h3
        className="lp-subheading"
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
    <div className="lp-image">
      <div
        className="lp-image-inner"
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
  className={`lp-image-${block.size}`}
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
  <div className="lp-image-caption">
    {block.caption}
  </div>
)}

{block.credit && (
  <div className="lp-image-credit">
    Source: {block.credit}
  </div>
)}

    </div>
  );




      case "video":
        return withLink(
          block,
          <div className="lp-video">
            <div
              className="lp-video-inner"
              style={{
                justifyContent:
                  block.align === "left"
                    ? "flex-start"
                    : block.align === "right"
                    ? "flex-end"
                    : "center",
              }}
            >
              <video
                src={block.src}
                controls={block.controls !== false}
                autoPlay={block.autoplay}
                muted={block.muted}
                loop={block.loop}
                playsInline
                className="lp-video-player"
              />
            </div>
            {block.caption && (
              <div className="lp-video-caption">{block.caption}</div>
            )}
          </div>
        );

      case "youtube":
        return withLink(
          block,
          <div className="lp-embed">
            <div
              className="lp-embed-inner"
              style={{
                justifyContent:
                  block.align === "left"
                    ? "flex-start"
                    : block.align === "right"
                    ? "flex-end"
                    : "center",
              }}
            >
              <iframe
                className="lp-embed-frame"
                src={block.src}
                title={block.title || "YouTube video"}
                allow={
                  block.allow ||
                  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                }
                referrerPolicy={
                  block.referrerPolicy ||
                  "strict-origin-when-cross-origin"
                }
                allowFullScreen={block.allowFullScreen !== false}
              />
            </div>
            {block.caption && (
              <div className="lp-embed-caption">{block.caption}</div>
            )}
          </div>
        );

      case "gallery": {
  const images = block.images || [];

  if (images.length === 0) {
    return (
      <div className="lp-gallery-empty">
        <div className="lp-gallery-empty-text">
          Tap here to select this block<br />
          <span>Add images</span>
        </div>
      </div>
    );
  }

  const columns = block.columns || 3;

return (
  <div
    className="lp-gallery"
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 12,
    }}
  >

      {images.map((img, i) => {
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
    <figure key={img.id || img.url || `img-${i}`} style={{ textAlign: "center" }}>

      {img.link?.url ? (
        <a
          href={img.link.url}
          target={img.link.target || "_self"}
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          {imageEl}
        </a>
      ) : (
        imageEl
      )}

      {img.caption && (
        <figcaption className="lp-gallery-caption">
          {img.caption}
        </figcaption>
      )}

      {img.credit && (
        <div className="lp-image-credit">
          Source: {img.credit}
        </div>
      )}
    </figure>
  );
})}

    </div>
  );
}


      case "author": {


     if (!block.author) {
    console.warn("❌ Author block missing author object:", block);
    return null;
  } 

const bg =
  block.backgroundImage &&
  (block.style === "cover" || block.applyBgToAll)
    ? `url(${block.backgroundImage})`
    : undefined;


  const style = block.style || "default";

  // 🔹 DEFAULT (image left)
  if (style === "default") {
    return (
      <div className="lp-author default">
        <img src={block.author.image} style={{
          backgroundImage: bg,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}/>
        <div>
          <h4>{block.author.name}</h4>
          <p className="role">{block.author.role}</p>
          <p>{block.author.about}</p>
        </div>
      </div>
    );
  }

  // 🔹 CENTERED
if (style === "centered-social") {
  const socials = block.socials || {};

  return (
    <div
      className="lp-author cover centered centered-social"
      style={{
        backgroundImage: block.backgroundImage
          ? `url(${block.backgroundImage})`
          : undefined,
      }}
    >
      <div className="centered-social-layout">

        {/* LEFT ICONS (NO OVERLAY) */}
        <AuthorSocialIcons
          socials={{
            whatsapp: socials.whatsapp,
            instagram: socials.instagram,
          }}
          position="row"
          showText={false}
        />

        {/* AUTHOR ONLY (WITH OVERLAY) */}
        <div className="author-overlay-box">
          <div className="author-center">
            <img src={block.author.image} />
            <h4>{block.author.name}</h4>
            <p className="role">{block.author.role}</p>
            <p>{block.author.about}</p>
          </div>
        </div>

        {/* RIGHT ICONS (NO OVERLAY) */}
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





if (style === "default-social") {
  return (
    <div
      className="lp-author default"
      style={{ backgroundImage: bg }}
    >
      <img src={block.author.image} />
      <div>
        <h4>{block.author.name}</h4>
        <p className="role">{block.author.role}</p>
        <p>{block.author.about}</p>
        {/* 🔥 bottom-right */}
      <AuthorSocialIcons
        socials={block.socials}
        position="bottom-right"
        showText={true}
        />
      </div>

      
    </div>
  );
}



  // 🔹 COVER (background image)
  if (style === "cover") {
    return (
      <div
        className="lp-author cover"
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
}





      case "quote":
  return withLink(
    block,
    <blockquote
      className="lp-quote"
      style={{
        color: getTextColor(block, theme),
        borderLeftColor: "#3b82f6",
      }}
    >
      “{block.text}”
    </blockquote>
  );



      case "ad":
  return (
    <div className="lp-ad">
      Advertisement – {block.variant}
    </div>
  );


      case "list":
  return withLink(
    block,
    <ul
      className="lp-list"
      style={{
        color: getTextColor(block, theme),
      }}
    >
      {(block.items || [])
        .filter(item => item.trim() !== "")
        .map((item, i) => (
          <li key={`${block.id}-item-${i}`}>{item}</li>
        ))}
    </ul>
  );




      default:
  if (typeof block === "string") return null;
  return <div>Unknown Block</div>;

    }
  };

  return (
    <div className="left-preview" ref={containerRef}>
      {blocks.length === 0 && (
        <div className="empty-preview">
          Add blocks to start creating news
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id}
  className={`preview-block ${
    selectedBlockId === block.id ? "selected" : ""
  }`}

  onDragOver={(e) => e.preventDefault()}
  onDrop={() => {
    if (dragIndex === null) return;
    onReorderBlocks(dragIndex, index);
    setDragIndex(null);
  }}

//paragraph editing handlers
  onMouseDown={(e) => {
    if (window.getSelection()?.toString()) return;
  onSelectBlock(block.id);
  if (
    block.type === "paragraph" &&
    selectedBlockId === block.id &&
    e.ctrlKey
  ) {
    e.preventDefault();
    setEditingBlockId(block.id);
  }
}}

onTouchStart={() => {
  if (block.type === "paragraph") {
    setEditingBlockId(block.id);
  }
}}

>
  {/* Drag Handle */}
  <div
    className="drag-handle"
    draggable
    onDragStart={() => setDragIndex(index)}
    onDragEnd={() => setDragIndex(null)}
  >
    ⋮⋮
  </div>

  {/* Actual content */}
  <div className="preview-content">
    {renderBlock(block)}
  </div>
</div>

      ))}


      {inlineToolbar.visible && (
  <div className="inline-toolbar">
    {TOOLBAR_ITEMS.map(item => (
      <button
        key={item.id}
        title={item.title}
        onClick={() => applyInlineMark(item.id)}
        className={`toolbar-btn ${isMarkActive(item.id) ? "active" : ""}`}

      >
        {item.label}
      </button>
    ))}
  </div>
)}


    </div>
  );
};

export default LeftPreview;

