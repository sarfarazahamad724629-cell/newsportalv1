import "./Stylings/BlockPropertiesBox.css";
import { useState,useRef } from "react";
import {useEffect} from "react";
import LocationPicker from "../components/LocationPicker";
import Flatpickr from "react-flatpickr";

import ImageUploader from "./ImageUploader";
import VideoUploader from "./VideoUploader";
const BlockPropertiesBox = ({
  mode = "block",
  postSettings,
  setPostSettings,
  selectedBlock,
  onUpdateBlock,
  onDeleteBlock,
   onClose,
   markDraftDirty,
}) => {

  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);

  const parseYouTubeInput = (input) => {
    if (!input) return null;
    const trimmed = input.trim();

    if (trimmed.includes("<iframe")) {
      const srcMatch = trimmed.match(/src="([^"]+)"/i);
      const titleMatch = trimmed.match(/title="([^"]+)"/i);
      const widthMatch = trimmed.match(/width="([^"]+)"/i);
      const heightMatch = trimmed.match(/height="([^"]+)"/i);
      const allowMatch = trimmed.match(/allow="([^"]+)"/i);
      const referrerMatch = trimmed.match(/referrerpolicy="([^"]+)"/i);
      const allowFullScreen = /allowfullscreen/i.test(trimmed);

      return {
        src: srcMatch?.[1] || "",
        title: titleMatch?.[1] || "YouTube video",
        width: widthMatch?.[1] || "100%",
        height: heightMatch?.[1] || "100%",
        allow: allowMatch?.[1] || "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        referrerPolicy: referrerMatch?.[1] || "strict-origin-when-cross-origin",
        allowFullScreen,
      };
    }

    try {
      const url = new URL(trimmed);
      if (url.hostname.includes("youtu.be")) {
        const id = url.pathname.replace("/", "");
        return { src: `https://www.youtube.com/embed/${id}` };
      }
      if (url.searchParams.get("v")) {
        const id = url.searchParams.get("v");
        return { src: `https://www.youtube.com/embed/${id}` };
      }
      if (url.pathname.includes("/embed/")) {
        return { src: trimmed };
      }
    } catch (err) {
      console.error("Invalid YouTube URL", err);
    }

    return null;
  };

//tags state
const [tagsText, setTagsText] = useState(
  (postSettings.tags || []).join(", ")
);

useEffect(() => {
  setTagsText((postSettings.tags || []).join(", "));
}, [postSettings.tags]);


//new code for cities selection
const CITIES = [
  "Bilaspur",
  "Raipur",
  "Durg",
  "Korba",
  "Raigarh",
];
//new code for drafts and seo things about the post


//const toUpperCase = (str) => str.toUpperCase();

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

//new code end

  useEffect(() => {
  setSelectedGalleryImage(null);
}, [selectedBlock?.id]);

/*Bacgkground image presets for author block*/
  const AUTHOR_BG_PRESETS = [
  "/images/author-bg/bg1.png",
  "/images/author-bg/bg2.png",
  "/images/author-bg/bg3.png",
  "/images/author-bg/bg4.png",
  "/images/author-bg/bg5.png",
  "/images/author-bg/bg6.png",
];
if (mode === "post") {
  return (
    <div className="properties-box post-mode">
      <div className="props-header">
        <h3>Post Settings</h3>
        <button
          className="close-btn"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* SLUG */}
      <label>Slug</label>
<input
  value={postSettings.slug || ""}
  onChange={(e) => {
    setPostSettings({
      ...postSettings,
      slug: e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-"),
    });
    markDraftDirty();
  }}
  placeholder="news-title-slug"
/>


      {/* CATEGORY */}
      <label>Category</label>
<input
  value={postSettings.category || ""}
  onChange={(e) => {
    setPostSettings({
      ...postSettings,
      category: e.target.value,
    });
    markDraftDirty();
  }}
  placeholder="politics / crime / sports"
/>


      {/* TAGS */}
      <label>Tags (comma separated)</label>
<input
  value={tagsText}
  onChange={(e) => {
    setTagsText(e.target.value); // 👈 allow typing freely
  }}
  onBlur={() => {
    const tagsArray = tagsText
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    setPostSettings({
      ...postSettings,
      tags: tagsArray,
    });

    markDraftDirty();
  }}
  placeholder="cg, bilaspur, breaking"
/>



      <hr style={{ opacity: 0.2, margin: "16px 0" }} />

      {/* SEO */}
      <h4>SEO</h4>

      <label>SEO/Meta Description</label>
      <input
        value={postSettings.seo}
        onChange={(e) => {
          setPostSettings({
            ...postSettings,
            seo: e.target.value,
            
          });
          markDraftDirty();
        }}
        placeholder="SEO optimized Keywords Or Sentences"
      />
 <hr style={{ opacity: 1, margin: "16px 0" }} />
      <label>News Date</label>

<input
  type="date"
  value={
    postSettings.createdDate
      ? postSettings.createdDate.slice(0, 10) // YYYY-MM-DD
      : ""
  }
  onChange={(e) => {
    setPostSettings(ps => ({
      ...ps,
      createdDate: e.target.value
        ? new Date(e.target.value).toISOString()
        : null,
    }));
    markDraftDirty();
  }}
/>

<p style={{ fontSize: 12, opacity: 0.7 }}>
  If no date is selected, publish date will be used
</p>



     

<h4>Location</h4>

<LocationPicker
  value={postSettings.location}
  onChange={(loc) => {
    setPostSettings({
      ...postSettings,
      location: loc,
    });
    markDraftDirty();
  }}
/>

{postSettings.location?.lat && (
  <p style={{ fontSize: "12px", opacity: 0.7 }}>
    Lat: {postSettings.location.lat.toFixed(5)},
    Lng: {postSettings.location.lng.toFixed(5)}
  </p>
)}

    </div>
  );
}

  if (!selectedBlock) {
    return (
      <div className="block-props empty">
        Select a block to edit its properties
      </div>
    );
  }



  const update = (key, value) => {
    onUpdateBlock({
      ...selectedBlock,
      [key]: value,
    });
  };
  

  const renderLinkControls = () => (
  <>
    <label>Link URL</label>
    <input
      placeholder="https://example.com"
      value={selectedBlock.link?.url || ""}
      onChange={(e) =>
        update("link", {
          ...(selectedBlock.link || {}),
          url: e.target.value,
        })
      }
    />

    <label>
      <input
        type="checkbox"
        checked={selectedBlock.link?.target === "_blank"}
        onChange={(e) =>
          update("link", {
            ...(selectedBlock.link || {}),
            target: e.target.checked ? "_blank" : "_self",
          })
        }
      />
      Open in new tab
    </label>
  </>
);

  const renderProperties = () => {



    switch (selectedBlock.type) {
      case "paragraph":
  return (
    <>
      <label>Text</label>
      <textarea
        value={selectedBlock.text || ""}
        onChange={(e) => update("text", e.target.value)}
      />
      <label className="checkbox">
  <input
    type="checkbox"
    checked={selectedBlock.isContent || false}
    onChange={(e) => {
      const checked = e.target.checked;

      onUpdateBlock((prevBlocks) =>
        prevBlocks.map((b) =>
          b.type === "paragraph"
            ? {
                ...b,
                isContent:
                  b.id === selectedBlock.id ? checked : false,
              }
            : b
        )
      );
    }}
  />
  Use as summary content
</label>


      <label>Font Size</label>
      <select
        value={selectedBlock.styles.fontSize}
        onChange={(e) =>
          update("styles", {
            ...selectedBlock.styles,
            fontSize: e.target.value,
          })
        }
      >
        <option value="14px">14px</option>
        <option value="16px">16px</option>
        <option value="18px">18px</option>
        <option value="20px">20px</option>
      </select>

      <label>Font Color</label>
      <input
        type="color"
        value={selectedBlock.styles.color}
        onChange={(e) =>
          update("styles", {
            ...selectedBlock.styles,
            color: e.target.value,
            isCustomColor: true,
          })
        }
      />

      <label>Font Weight</label>
      <select
        value={selectedBlock.styles.fontWeight}
        onChange={(e) =>
          update("styles", {
            ...selectedBlock.styles,
            fontWeight: e.target.value,
          })
        }
      >
        <option value="300">Light</option>
        <option value="400">Regular</option>
        <option value="600">Semi Bold</option>
        <option value="700">Bold</option>
      </select>

      <label>Text Decoration</label>
      <select
        value={selectedBlock.styles.textDecoration}
        onChange={(e) =>
          update("styles", {
            ...selectedBlock.styles,
            textDecoration: e.target.value,
          })
        }
      >
        <option value="none">None</option>
        <option value="underline">Underline</option>
        <option value="overline">Overline</option>
        <option value="line-through">Line Through</option>
      </select>
      {/* Paragraph Variant */}
<label>Paragraph Style</label>
<select
  value={selectedBlock.variant}
  onChange={(e) => update("variant", e.target.value)}
>
  <option value="normal">Normal</option>
  <option value="lead">Lead Paragraph</option>
  <option value="highlight">Highlighted</option>
</select>

<label>Text Align</label>
<select
  value={selectedBlock.styles.textAlign}
  onChange={(e) =>
    update("styles", {
      ...selectedBlock.styles,
      textAlign: e.target.value,
    })
  }
>
  <option value="left">Left</option>
  <option value="center">Center</option>
  <option value="right">Right</option>
  <option value="justify">Justify</option>
</select>

<label>Line Height</label>
<input
  type="number"
  step="0.1"
  value={selectedBlock.styles.lineHeight}
  onChange={(e) =>
    update("styles", {
      ...selectedBlock.styles,
      lineHeight: e.target.value,
    })
  }
/>

<label>Letter Spacing</label>
<input
  type="number"
  value={parseInt(selectedBlock.styles.letterSpacing)}
  onChange={(e) =>
    update("styles", {
      ...selectedBlock.styles,
      letterSpacing: `${e.target.value}px`,
    })
  }
/>

<label>Background</label>

<div style={{ display: "flex", gap: 8 }}>
  {/* NONE BUTTON */}
  <button
    type="button"
    onClick={() =>
      update("styles", {
        ...selectedBlock.styles,
        background: "transparent",
        padding: "0px",
        borderLeft: "none",
      })
    }
    style={{
      padding: "6px 10px",
      border: "1px solid #334155",
      background: "transparent",
      color: "#cbd5f5",
      cursor: "pointer",
      borderRadius: 4,
    }}
  >
    None
  </button>

  {/* COLOR PICKER */}
  <input
    type="color"
    value={
      selectedBlock.styles.background !== "transparent"
        ? selectedBlock.styles.background
        : "#000000"
    }
    onChange={(e) =>
      update("styles", {
        ...selectedBlock.styles,
        background: e.target.value,
        padding: "12px",
      })
    }
  />
</div>


<label>Border Highlight</label>
<select
  value={selectedBlock.styles.borderLeft}
  onChange={(e) =>
    update("styles", {
      ...selectedBlock.styles,
      borderLeft: e.target.value,
    })
  }
>
  <option value="none">None</option>
  <option value="4px solid #3b82f6">Blue</option>
  <option value="4px solid #22c55e">Green</option>
  <option value="4px solid #ef4444">Red</option>
</select>




    </>
  );


      case "subheading":
        return (
          <>
  <label>Text</label>
  <input
    type="text"
    value={selectedBlock.text || ""}
    onChange={(e) => update("text", e.target.value)}
  />

  <label>Font Size</label>
  <select
    value={selectedBlock.styles.fontSize}
    onChange={(e) =>
      update("styles", {
        ...selectedBlock.styles,
        fontSize: e.target.value,
        
      })
    }
  >
    <option value="16px">Small</option>
    <option value="18px">Medium</option>
    <option value="22px">Large</option>
  </select>

  <label>Font Weight</label>
  <select
    value={selectedBlock.styles.fontWeight}
    onChange={(e) =>
      update("styles", {
        ...selectedBlock.styles,
        fontWeight: e.target.value,
      })
    }
  >
    <option value="100">Thin</option>
    <option value="300">Light</option>
    <option value="500">Regular</option>
    <option value="700">Bold</option>
    <option value="900">Extra Bold</option>
    <option value="1000">Ultra Bold</option>
    
  </select>

  <label>Text Color</label>
  <input
    type="color"
    value={selectedBlock.styles.color}
    onChange={(e) =>
      update("styles", {
        ...selectedBlock.styles,
        color: e.target.value,
        isCustomColor: true,
      })
    }
  />

  <label>Text Align</label>
  <select
    value={selectedBlock.styles.textAlign}
    onChange={(e) =>
      update("styles", {
        ...selectedBlock.styles,
        textAlign: e.target.value,
      })
    }
  >
    <option value="left">Left</option>
    <option value="center">Center</option>
    <option value="right">Right</option>
  </select>

  <label>
    <input
      type="checkbox"
      checked={selectedBlock.styles.textTransform === "uppercase"}
      onChange={(e) =>
        update("styles", {
          ...selectedBlock.styles,
          textTransform: e.target.checked
            ? "uppercase"
            : "none",
        })
      }
    />
    Uppercase
  </label>

  <label>
    <input
      type="checkbox"
      checked={selectedBlock.styles.divider}
      onChange={(e) =>
        update("styles", {
          ...selectedBlock.styles,
          divider: e.target.checked,
        })
      }
    />
    Show Divider Line
  </label>
</>

        );



        case "author":
  return (
    <>
      <label>Layout Style</label>
      <select
        value={selectedBlock.style || "default"}
        onChange={(e) =>
          update("style", e.target.value)
        }
      >
        <option value="default">Default (Image Left)</option>
        <option value="cover">Background Cover</option>
        <option value="default-social">Default With Social Links</option>
        <option value="centered-social">Centered Layout With Social Links</option>
      </select>

      <label>Name</label>
      <input
        value={selectedBlock.author.name}
        onChange={(e) =>
          update("author", {
            ...selectedBlock.author,
            name: e.target.value,
          })
        }
      />

      <label>Role</label>
      <input
        value={selectedBlock.author.role}
        onChange={(e) =>
          update("author", {
            ...selectedBlock.author,
            role: e.target.value,
          })
        }
      />

      <label>About</label>
      <textarea
        value={selectedBlock.author.about}
        onChange={(e) =>
          update("author", {
            ...selectedBlock.author,
            about: e.target.value,
          })
        }
      />

      {/* 🔥 Background Image */}
      {/* 🔥 Background Image */}
<label>Background Image</label>

<button
  className="replace-image-btn"
  onClick={() => setShowImageUploader(true)}
>
  Upload Background Image
</button>

{/* ✅ LOCAL PRESET BUTTONS */}
<div
  style={{
    display: "flex",
    gap: 8,
    marginTop: 8,
  }}
>
  {AUTHOR_BG_PRESETS.map((src, i) => (
    <button
      key={src}
      type="button"
      className="bg-preset-btn"
      onClick={() => update("backgroundImage", src)}
      style={{
        width: 36,
        height: 36,
        borderRadius: 6,
        border:
          selectedBlock.backgroundImage === src
            ? "2px solid #3b82f6"
            : "1px solid #334155",
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        cursor: "pointer",
        color: "#fff",
        fontSize: 12,
      }}
      title={`BG ${i + 1}`}
    >
      {i + 1}
    </button>
    
  ))}
</div>

<label style={{ marginTop: 8 }}>
  <input
    type="checkbox"
    checked={selectedBlock.applyBgToAll || false}
    onChange={(e) =>
      update("applyBgToAll", e.target.checked)
    }
  />
  Apply BG IMG to All Styles
</label>
{["default-social", "centered-social"].includes(selectedBlock.style) && (
  <>
    <h4 style={{ marginTop: 16 }}>Social Links</h4>

    <label>Your WhatsApp Link</label>
    <input
      placeholder="https://wa.me/91XXXXXXXXXX"
      value={selectedBlock.socials?.whatsapp || ""}
      onChange={(e) =>
        update("socials", {
          ...selectedBlock.socials,
          whatsapp: e.target.value,
        })
      }
    />

    <label>Your Instagram Link</label>
    <input
      value={selectedBlock.socials?.instagram || ""}
      onChange={(e) =>
        update("socials", {
          ...selectedBlock.socials,
          instagram: e.target.value,
        })
      }
    />

    <label>Your Facebook Link</label>
    <input
      value={selectedBlock.socials?.facebook || ""}
      onChange={(e) =>
        update("socials", {
          ...selectedBlock.socials,
          facebook: e.target.value,
        })
      }
    />

    <label>Your Twitter (X) Link</label>
    <input
      value={selectedBlock.socials?.twitter || ""}
      onChange={(e) =>
        update("socials", {
          ...selectedBlock.socials,
          twitter: e.target.value,
        })
      }
    />
  </>
)}



      {showImageUploader && (
        <div className="image-uploader-overlay">
          <ImageUploader
            onUpload={({ src }) => {
              update("backgroundImage", src);
              setShowImageUploader(false);
            }}
            onClose={() => setShowImageUploader(false)}
          />
        </div>
      )}
    </>
  );







      case "image":
  return (
    <>
      <label>Alignment</label>
      <select
        value={selectedBlock.align}
        onChange={(e) => update("align", e.target.value)}
      >
        <option value="center">Center</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>

      <label>Size</label>
      <select
        value={selectedBlock.size}
        onChange={(e) => update("size", e.target.value)}
      >
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="huge">Huge</option>
        <option value="fit">Fit to width</option>
      </select>

      <label>Caption</label>
      <input
        value={selectedBlock.caption}
        onChange={(e) => update("caption", e.target.value)}
      />
      
      <label>Alt Text (SEO)</label>
<input
  value={selectedBlock.alt || ""}
  onChange={(e) => update("alt", e.target.value)}
/>

<label>Image Credit / Source</label>
<input
  value={selectedBlock.credit || ""}
  onChange={(e) => update("credit", e.target.value)}
/>
<label>Border Radius</label>
<input
  type="range"
  min="0"
  max="32"
  value={parseInt(selectedBlock.radius || 0)}
  onChange={(e) =>
    update("radius", `${e.target.value}px`)
  }
/>
<label>Shadow</label>
<select
  value={selectedBlock.shadow || "none"}
  onChange={(e) => update("shadow", e.target.value)}
>
  <option value="none">None</option>
  <option value="soft">Soft</option>
  <option value="strong">Strong</option>
</select>
<label>Image Background</label>

<div style={{ display: "flex", gap: 8 }}>
  <button
    type="button"
    onClick={() => update("background", "transparent")}
  >
    None
  </button>

  <input
    type="color"
    onChange={(e) =>
      update("background", e.target.value)
    }
  />
</div>
<label>
  <input
    type="checkbox"
    checked={selectedBlock.isAd || false}
    onChange={(e) => update("isAd", e.target.checked)}
  />
  Mark as Advertisement
</label>




      <button
  className="replace-image-btn"
  onClick={() => setShowImageUploader(true)}
>
  Replace Image
</button>


{showImageUploader && (
  <div className="image-uploader-overlay">
    <ImageUploader
      onUpload={(uploadedImages) => {
  const img = uploadedImages[0];

  onUpdateBlock({
    ...selectedBlock,
    fileId: img.fileId,
    src: img.src,
  });

  setShowImageUploader(false);
}}

    />

    <button
      className="cancel-upload-btn"
      onClick={() => setShowImageUploader(false)}
    >
      Cancel
    </button>
  </div>
)}


    </>
  );


      case "video":
  return (
    <>
      <label>Alignment</label>
      <select
        value={selectedBlock.align || "center"}
        onChange={(e) => update("align", e.target.value)}
      >
        <option value="center">Center</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>

      <label>Caption</label>
      <input
        value={selectedBlock.caption || ""}
        onChange={(e) => update("caption", e.target.value)}
      />

      <label className="checkbox">
        <input
          type="checkbox"
          checked={selectedBlock.controls !== false}
          onChange={(e) => update("controls", e.target.checked)}
        />
        Show Controls
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={selectedBlock.autoplay || false}
          onChange={(e) => update("autoplay", e.target.checked)}
        />
        Autoplay
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={selectedBlock.muted || false}
          onChange={(e) => update("muted", e.target.checked)}
        />
        Muted
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={selectedBlock.loop || false}
          onChange={(e) => update("loop", e.target.checked)}
        />
        Loop
      </label>

      <button
        className="replace-image-btn"
        onClick={() => setShowVideoUploader(true)}
      >
        Replace Video
      </button>

      {showVideoUploader && (
        <div className="image-uploader-overlay">
          <VideoUploader
            onUpload={(uploadedVideos) => {
              const vid = uploadedVideos[0];

              onUpdateBlock({
                ...selectedBlock,
                fileId: vid.fileId,
                src: vid.src,
              });

              setShowVideoUploader(false);
            }}
            onClose={() => setShowVideoUploader(false)}
          />
        </div>
      )}
    </>
  );

      case "youtube":
  return (
    <>
      <label>Embed URL or iframe</label>
      <textarea
        placeholder="Paste YouTube URL or iframe embed code"
        value={selectedBlock.src || ""}
        onChange={(e) => update("src", e.target.value)}
        onBlur={(e) => {
          const parsed = parseYouTubeInput(e.target.value);
          if (!parsed?.src) return;
          onUpdateBlock({
            ...selectedBlock,
            src: parsed.src,
            title: parsed.title || selectedBlock.title || "YouTube video",
            width: parsed.width || selectedBlock.width,
            height: parsed.height || selectedBlock.height,
            allow: parsed.allow || selectedBlock.allow,
            referrerPolicy:
              parsed.referrerPolicy || selectedBlock.referrerPolicy,
            allowFullScreen:
              parsed.allowFullScreen !== undefined
                ? parsed.allowFullScreen
                : selectedBlock.allowFullScreen,
          });
        }}
      />

      <label>Title</label>
      <input
        value={selectedBlock.title || ""}
        onChange={(e) => update("title", e.target.value)}
      />

      <label>Caption</label>
      <input
        value={selectedBlock.caption || ""}
        onChange={(e) => update("caption", e.target.value)}
      />

      <label>Alignment</label>
      <select
        value={selectedBlock.align || "center"}
        onChange={(e) => update("align", e.target.value)}
      >
        <option value="center">Center</option>
        <option value="left">Left</option>
        <option value="right">Right</option>
      </select>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={selectedBlock.allowFullScreen !== false}
          onChange={(e) => update("allowFullScreen", e.target.checked)}
        />
        Allow Fullscreen
      </label>

      <label>Referrer Policy</label>
      <input
        value={
          selectedBlock.referrerPolicy || "strict-origin-when-cross-origin"
        }
        onChange={(e) => update("referrerPolicy", e.target.value)}
      />
    </>
  );

      case "gallery": {
  const images = selectedBlock.images || [];

  return (
    <>
      <button
        className="replace-image-btn"
        onClick={() => setShowImageUploader(true)}
      >
        + Add Image to Gallery
      </button>

      <label>Image Size</label>
<select
  value={selectedBlock.columns || 3}
  onChange={(e) =>
    onUpdateBlock({
      ...selectedBlock,
      columns: Number(e.target.value),
    })
  }
>
 <option value={1}>1 IPR (100%)</option>
<option value={2}>2 IPR (1:2)</option>
<option value={3}>3 IPR (1:3)</option>
<option value={4}>4 IPR (1:4)</option>
<option value={5}>5 IPR (1:5)</option>

</select>


      {images.length === 0 && (
        <p style={{ fontSize: 12, color: "#64748b" }}>
          No images added yet
        </p>
      )}

      {images.map((img, index) => (
        
        <div
          key={img.id}
          style={{
            border: "1px solid #1e293b",
            borderRadius: 8,
            padding: 10,
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          
          {/* Preview */}
          <img
            src={img.src}
            alt={img.alt || ""}
            style={{
              width: "100%",
              height: 120,
              objectFit: "cover",
              borderRadius: 6,
            }}
          />

          {/* Caption */}
          <input
            placeholder="Caption"
            value={img.caption || ""}
            onChange={(e) => {
              const updated = [...images];
              updated[index] = {
                ...img,
                caption: e.target.value,
              };
              onUpdateBlock({ ...selectedBlock, images: updated });
            }}
          />

          {/* Alt Text */}
          <input
            placeholder="Alt text (SEO)"
            value={img.alt || ""}
            onChange={(e) => {
              const updated = [...images];
              updated[index] = {
                ...img,
                alt: e.target.value,
              };
              onUpdateBlock({ ...selectedBlock, images: updated });
            }}
          />

          {/* Credit */}
          <input
            placeholder="Image source / credit"
            value={img.credit || ""}
            onChange={(e) => {
              const updated = [...images];
              updated[index] = {
                ...img,
                credit: e.target.value,
              };
              onUpdateBlock({ ...selectedBlock, images: updated });
            }}
          />



          <input
  placeholder="Image link (optional)"
  value={img.link?.url || ""}
  onChange={(e) => {
    const updated = [...images];
    updated[index] = {
      ...img,
      link: {
        ...(img.link || {}),
        url: e.target.value,
      },
    };
    onUpdateBlock({ ...selectedBlock, images: updated });
  }}
/>

<label style={{ fontSize: 12 }}>
  <input
    type="checkbox"
    checked={img.link?.target === "_blank"}
    onChange={(e) => {
      const updated = [...images];
      updated[index] = {
        ...img,
        link: {
          ...(img.link || {}),
          target: e.target.checked ? "_blank" : "_self",
        },
      };
      onUpdateBlock({ ...selectedBlock, images: updated });
    }}
  />
  Open in new tab
</label>


          {/* Remove */}
          <button
            onClick={() =>
              onUpdateBlock({
                ...selectedBlock,
                images: images.filter((_, i) => i !== index),
              })
            }
            style={{
              color: "#f87171",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              alignSelf: "flex-end",
            }}
          >
            ✕ Remove image
          </button>
        </div>
      ))}

      {showImageUploader && (
  <div className="image-uploader-overlay">
    <ImageUploader
      onUpload={(uploadedImages) => {
  onUpdateBlock({
    ...selectedBlock,
    images: [
      ...images,
      ...uploadedImages.map(img => ({
        id: Date.now() + Math.random(),
        fileId: img.fileId,
        src: img.src,
        caption: "",
        alt: "",
        credit: "",
      })),
    ],
  });
  setShowImageUploader(false);
}}

      onClose={() => setShowImageUploader(false)}
    />
  </div>
)}

    </>
  );
}




      case "quote":
  return (
    <>
      <label>Quote Text</label>
      <textarea
        value={selectedBlock.text || ""}
        onChange={(e) => update("text", e.target.value)}
      />
    </>
  );


      case "ad":
  return (
    <>
      <label>Ad Variant</label>
      <select
        value={selectedBlock.variant}
        onChange={(e) => update("variant", e.target.value)}
      >
        <option value="Ad1">Ad 1</option>
        <option value="Ad4">Ad 4</option>
        <option value="Ad7">Ad 7</option>
        <option value="Ad12">Ad 12</option>
      </select>
    </>
  );


        case "list":
  return (
    <>
      <label>List Items (one per line)</label>
      <textarea
        value={(selectedBlock.items || []).join("\n")}
        onChange={(e) =>
          update(
            "items",
            e.target.value.split("\n")
          )
        }
      />
    </>
  );



      default:
        return <div>No properties available</div>;
    }
  };

  return (
    <div className="block-props post-mode">
      <div className="props-header">
        <span>
  {(selectedBlock?.type || "block").toUpperCase()} BLOCK
</span>

        <button
  className="delete-btn"
  onClick={() => onDeleteBlock(selectedBlock)}
>
  Delete
</button>

      </div>

      <div className="props-body">
  {/* UNIVERSAL LINK CONTROLS */}
  {selectedBlock.type !== "ad" && (
    <>
      <h4 style={{ marginTop: 0 }}>Block Link</h4>
      {renderLinkControls()}
      <hr style={{ opacity: 0.2, margin: "12px 0" }} />
    </>
  )}

  {/* BLOCK-SPECIFIC CONTROLS */}
  {renderProperties()}
</div>

    </div>
  );
};

export default BlockPropertiesBox;

