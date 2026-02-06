import { useRef } from "react";
import "./Stylings/NewsBlocksStrip.css";

const BLOCKS = [
  { type: "paragraph", label: "Paragraph", icon: "📝" },
  { type: "image", label: "Image", icon: "🖼️" },
  { type: "video", label: "Video", icon: "🎬" },
  { type: "youtube", label: "YouTube", icon: "▶️" },
  { type: "gallery", label: "Gallery", icon: "🖼️🏞️🌄" },
  { type: "quote", label: "Quote", icon: "❝" },
  { type: "subheading", label: "Subheading", icon: "🔖" },
  { type: "list", label: "List", icon: "📋" },
];


const NewsBlocksStrip = ({
  onAddBlock,
  onAddImage,
  onAddVideo,
  onAddYoutube,
  onOpenSettings,
  onSaveDraft,
}) => {
  const scrollRef = useRef(null);

  const handleAdd = (type, variant = null) => {
    const base = { id: Date.now(), type };

    switch (type) {
      case "paragraph":
  onAddBlock({
    ...base,
    text: "This is a paragraph text...",
    variant: "normal",
    styles: {
      fontSize: "16px",
      color: "#ffffff",
      fontWeight: "400",
      textDecoration: "none",
      lineHeight: "1.7",
      textAlign: "left",
      letterSpacing: "0px",
      background: "transparent",
      padding: "0px",
      margin: "0px",
      borderLeft: "none",
      maxWidth: "100%",
    },
  });
  break;


      case "subheading":
  onAddBlock({
    ...base,
    text: "Subheading text",
    styles: {
      fontSize: "18px",
      fontWeight: "600",
      color: "#ffffff",
      textAlign: "left",
      textTransform: "none",
      margin: "24px 0 12px",
      divider: false,
    },
  });
  break;


      case "quote":
        onAddBlock({
          ...base,
          text: "This is a quote text",
        });
        break;

      case "list":
        onAddBlock({
          ...base,
          items: [
            "List item 1",
            "List item 2",
            "List item 3",
          ],
        });
        break;

      case "gallery":
        onAddBlock({
          ...base,
          images: [],
        });
        break;

      default:
        onAddBlock({ ...base, variant });
    }
  };


  return (
    <div className="news-blocks-strip">
      {/* ───── BLOCK BUTTONS SCROLLER ───── */}
      <div className="blocks-scroll" ref={scrollRef}>
        {BLOCKS.map((block) => (
          <div
            key={block.type}
            className="block-btn-wrapper"
          >
            <button
              className="block-btn"
              onClick={() => {
                // IMAGE handled separately
                if (block.type === "image") {
                  onAddImage();
                  return;
                }
                if (block.type === "video") {
                  onAddVideo();
                  return;
                }
                if (block.type === "youtube") {
                  onAddYoutube();
                  return;
                }

                handleAdd(block.type);
              }}
            >
              <span className="icon">{block.icon}</span>
              <span className="block-label">
                {block.label}
              </span>

              {block.variants && (
                <span className="caret">▾</span>
              )}
            </button>
          </div>
          
        ))}
        <button
  className="block-btn author-btn"
  onClick={() =>
  onAddBlock({
    id: crypto.randomUUID(), // or Date.now()
    type: "author",

    style: "default",

    author: {
      image: "/admin.png",
      name: "Sarfaraz Ahmed",
      role: "Media Director",
      about: "MD Of Social Activity BSP",
    },

    socials: {
      whatsapp: "",
      instagram: "",
      facebook: "",
      twitter: "",
    },

    backgroundImage: "",
    applyBgToAll: false,
  })
}

>
  <span className="icon">👤</span>
  <span className="block-label">By Author</span>
</button>

      </div>
      
{/* ───── RIGHT ACTION BUTTONS ───── */}

<div className="news-strip-actions">
 <div className="vertical-divider"></div> 
  <button className="action-btn" onClick={onSaveDraft}>
    SEO           
  </button>

  

  <button className="action-btn" onClick={onOpenSettings}>
    Settings
  </button>

</div>

    </div>
  );
};

export default NewsBlocksStrip;

