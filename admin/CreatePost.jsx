import { useState,useEffect } from "react";
import {useNavigate} from "react-router-dom";
import "./Stylings/CreatePost.css";
import { Query } from "appwrite";
import { DEFAULT_ADMIN_IMAGE } from "../config/defaults";
import ConfigureHead from "./components/ConfigureHead";
import NewsBlocksStrip from "./components/NewsBlocksStrip";
import LeftPreview from "./components/LeftPreview";
import BlockPropertiesBox from "./components/BlockPropertiesBox";
import { normalizePostPayload } from "../admin/components/utils/normalizePostPayload";
import { saveDraft } from "../services/draftService";
import ParagraphSplitter from "./ParagraphSplitter";
import SeoTool from "./SeoTool";
import SocialliaGen from "./SocialliaGen";
import {
  databases,
  DATABASE_ID,
  POSTS_COLLECTION_ID,
  DRAFTS_COLLECTION_ID,
} from "./appwrite/appwrite";
import { ID } from "appwrite";
import { account } from "../admin/appwrite/auth";
import ImageUploader from "./components/ImageUploader";
import VideoUploader from "./components/VideoUploader";



const CreatePost = () => {
  const [userId, setUserId] = useState(null);
  const [title, setTitle] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [tabs, setTabs] = useState([
  { id: "create", label: "Create Post", type: "editor" }
]);


const navigate = useNavigate();

const [activeTab, setActiveTab] = useState("create");
const [activePanel, setActivePanel] = useState(null); 
const [postSettings, setPostSettings] = useState({
  id: "",
  userID: "",
  slug: "",
  category: "",
  tags: [],
  location: {
    lat: null,
    lng: null,
  },
  seo:"",
  status: "published", // or draft
  createdDate:null,
});

//SEOTOOL DATA SAVE
const [seoToolState, setSeoToolState] = useState({
  input: {
    title: "",
    content: "",
  },
  output: {
    title: "",
    slug: "",
    tags: [],
    description: "",
  },
  loading: false,
});
//PARAGRAPH SPLITTER DATA SAVE
// PARAGRAPH SPLITTER STATE
const [paragraphSplitterState, setParagraphSplitterState] = useState({
  inputText: "",
  parts: [],
  targetWords: 300,
});


  const [language, setLanguage] = useState("hi");
  const [currentUser, setCurrentUser] = useState({
    name: "शेख सरफराज अहमद",
  });
  const [blocks, setBlocks] = useState([]);

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

  //safety JSON parse
  const safeJSONParseWithDefault = (value, fallback) => {
  if (!value || typeof value !== "string") return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

//finde tab utility function
const openUtilityTab = (utility) => {
  // already open?
  const exists = tabs.find(t => t.id === utility.id);
  if (exists) {
    setActiveTab(utility.id);
    return;
  }

  setTabs(prev => [
    ...prev,
    utility
  ]);

  setActiveTab(utility.id);
};

//close tabs
const closeTab = (tabId) => {
  // ❌ Create Post kabhi close nahi hoga
  if (tabId === "create") return;

  setTabs(prevTabs => {
    const updatedTabs = prevTabs.filter(tab => tab.id !== tabId);

    // agar wahi tab active tha jo close ho raha
    if (activeTab === tabId) {
      setActiveTab("create");
    }

    return updatedTabs;
  });
};


//extract content
// function extractContent(blocks, limit = 90) {
//   if (!Array.isArray(blocks)) return "";

//   // 1️⃣ Explicit content paragraph
//   const explicit = blocks.find(
//     b => b.type === "paragraph" && b.isContent
//   );

//   const fallbackParagraphs = blocks.filter(
//     b => b.type === "paragraph"
//   );

//   const source =
//     explicit ||
//     fallbackParagraphs[1] ||
//     fallbackParagraphs[0];

//   if (!source) return "";

//   const text =
//     source.richText
//       ? source.richText.map(n => n.text).join("")
//       : source.text || "";

//   return text.trim().slice(0, limit);
// }

function extractContent(blocks) {
  if (!Array.isArray(blocks)) return "";

  // 1️⃣ Explicit content paragraph
  const explicit = blocks.find(
    b => b.type === "paragraph" && b.isContent
  );

  const fallbackParagraphs = blocks.filter(
    b => b.type === "paragraph"
  );

  const source =
    explicit ||
    fallbackParagraphs[1] ||
    fallbackParagraphs[0];

  if (!source) return "";

  const text =
    source.richText
      ? source.richText.map(n => n.text).join("")
      : source.text || "";

  return text.trim();
}




//extract hero block image
function extractHero(blocks) {
  const imageBlock = blocks.find(
    (b) => b.type === "image" && b.src
  );
  return imageBlock ? imageBlock.src : null;
}


  //useEffect to get user id
  useEffect(() => {
  const loadUser = async () => {
    try {
      const user = await account.get();
      setUserId(user.$id);
    } catch (err) {
      console.error("User not logged in", err);
    }
  };

  loadUser();
}, []);

useEffect(() => {
  console.log("Logged in userId:", userId);
}, [userId]);

//normalized category
const normalizedCategory = postSettings.category && postSettings.category.trim()
  ? postSettings.category
  : "other";







  // Live save or draft feature states
  const [draftId, setDraftId] = useState(null);
  const [draftStatus, setDraftStatus] = useState("saved");
// "idle" | "dirty" | "saving" | "saved" | "error"

 // Appwrite document id

 const markDraftDirty = () => {
  setDraftStatus((prev) =>
    prev === "saving" ? prev : "dirty"
  );
};



const buildDraftPayload = () => {
  return normalizePostPayload({
    title,
    slug: postSettings.slug,
    category: postSettings.category,
    seo: postSettings.seo,
    tags: postSettings.tags,
    location: postSettings.location,
    language,
    blocks,
    author: currentUser,
    hero: extractHero(blocks),
    content: extractContent(blocks),
    createdDate: postSettings.createdDate, // ✅ SAME FIELD
  });
};



useEffect(() => {
  if (!userId) return; // 🔒 IMPORTANT
  if (!title && blocks.length === 0) return;

  const timer = setTimeout(() => {
    markDraftDirty(); // only mark dirty
  }, 2000);

  return () => clearTimeout(timer);
}, [
  title,
  blocks,
  postSettings.slug,
  postSettings.category,
  postSettings.tags,
  postSettings.seo,
  userId
]);




useEffect(() => {
  if (!userId) return;
  if (draftStatus !== "dirty") return;

  const timer = setTimeout(async () => {
    try {
      setDraftStatus("saving");
      await handleDraftSave();
      setDraftStatus("saved");
    } catch {
      setDraftStatus("error");
    }
  }, 1500);

  return () => clearTimeout(timer);
}, [draftStatus, userId]);

const handleDraftSave = async () => {
  if (!userId) return; // 🔒 safety net

  console.log("Draft save location:", postSettings.location);
  const payload = buildDraftPayload();
  console.log("FINAL PAYLOAD:", payload);
  const res = await saveDraft({ draftId, payload, userId });

  if (!draftId) setDraftId(res.$id);
};



useEffect(() => {
  const offline = () => setDraftStatus("error");
  const online = () => setDraftStatus("saved");

  window.addEventListener("offline", offline);
  window.addEventListener("online", online);

  return () => {
    window.removeEventListener("offline", offline);
    window.removeEventListener("online", online);
  };
}, []);


useEffect(() => {
  const loadDraft = async () => {
    const res = await databases.listDocuments(
      DATABASE_ID,
      DRAFTS_COLLECTION_ID,
      [
        Query.orderDesc("$updatedAt"),
        Query.limit(1),
      ]
    );

    if (res.documents.length) {
      const d = res.documents[0];

      setDraftId(d.$id);

      // 📝 BASIC + POST SETTINGS
      setTitle(d.title || "");
      setBlocks(d.blocks ? JSON.parse(d.blocks) : []);

      setPostSettings({
        id: d.$id,
        userID: d.userID || userId,
        slug: d.slug || "",
        category: d.category || "other",
        tags: d.tags
          ? d.tags.split(",").map(t => t.trim()).filter(Boolean)
          : [],
        location: d.location ? JSON.parse(d.location) : { lat: null, lng: null },
        seo: typeof d.seo === "string" ? d.seo : "",
        status: d.status || "draft",
        createdDate: d.createdDate || null, // 👈 RESTORE
      });
    }
  };

  loadDraft();
}, [userId]);






// ✅ CENTRALIZED DIRTY WRAPPERS

const addBlock = (block) => {
  setBlocks(prev => [...prev, block]);
  markDraftDirty();
};

const updateBlock = (updatedBlock) => {
  setBlocks(prev =>
    prev.map(b => (b.id === updatedBlock.id ? updatedBlock : b))
  );
  markDraftDirty();
};

const deleteBlock = async (block) => {
  if (block.type === "image" && block.fileId) {
    await fetch(`http://localhost:5000/upload/${block.fileId}`, {
      method: "DELETE",
    });
  }
  if (block.type === "video" && block.fileId) {
    await fetch(`http://localhost:5000/upload/${block.fileId}`, {
      method: "DELETE",
    });
  }

  setBlocks(prev => prev.filter(b => b.id !== block.id));
  setSelectedBlockId(null);
  markDraftDirty();
};















//live save feature ends here

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  


  const onReorderBlocks = (from, to) => {
  if (from === to) return;

  const updated = [...blocks];
  const [moved] = updated.splice(from, 1);
  updated.splice(to, 0, moved);

  setBlocks(updated);
  markDraftDirty();

};

const handleAddBlock = (input) => {

  // 🟢 STRING COMMANDS
  if (typeof input === "string") {
    if (input === "author") {
      const hasAuthorBlock = blocks.some(
        b => b?.type === "author"
      );
      if (hasAuthorBlock) return;

      setBlocks(prev => [
        ...prev,
        {
          id: Date.now(),
          type: "author",
          author: {
            name: "Author Name",
            role: "Reporter",
            image: null,
            about: "",
          },
          socials: {},
          style: "default",
        },
      ]);

      markDraftDirty();
      return;
    }

    return; // ignore unknown strings
  }

  // 🟢 NORMAL BLOCK OBJECTS
  setBlocks(prev => [...prev, input]);
  markDraftDirty();
};




  /* ───── REAL HANDLERS (logic baad me heavy hogi) ───── */

  const handleBack = () => {
    console.log("Back to dashboard");
  };

  const handlePreview = () => {
  navigate("/admin/preview", {
    state: {
      title,
      blocks,
      theme,
      postSettings,
      author: currentUser,
    },
  });
};



  const handleImageUpload = ({ fileId, imageUrl }) => {
  const imageBlock = {
    id: Date.now(),
    type: "image",
    fileId,
    imageUrl,
    credit: "",
    align: "center",
    size: "medium",
    caption: "",
    radius: "0px",
    shadow: "none",
    background: "transparent",
    margin: "16px 0",
    lightbox: false,
    fullBleed: false,
  };

  setBlocks((prev) => [...prev, imageBlock]);
};



const handlePublish = async () => {
  try {
    if (!draftId) {
      alert("Draft not found");
      return;
    }


     // 🧠 RESOLVE createdDate HERE (THIS WAS MISSING)
    const resolvedCreatedDate = postSettings.createdDate
      ? new Date(postSettings.createdDate).toISOString()
      : new Date().toISOString();
    // 1️⃣ base payload (single source of truth)
    const basePayload = buildDraftPayload();

    // 2️⃣ extend payload for publish
    const publishPayload = {
      ...basePayload,
      status: "published",
      draftId,
      createdDate: resolvedCreatedDate,
      publishedAt: new Date().toISOString(),
    };

    // 3️⃣ create post
    await databases.createDocument(
      DATABASE_ID,
      POSTS_COLLECTION_ID,
      ID.unique(),
      publishPayload
    );

    // 4️⃣ (optional) mark draft as published
    await databases.updateDocument(
      DATABASE_ID,
      DRAFTS_COLLECTION_ID,
      draftId,
      {
        status: "published",
        createdDate: resolvedCreatedDate,
        publishedAt: publishPayload.publishedAt,
      }
    );

    // 5️⃣ ✅ delete draft (cleanup)
    await databases.deleteDocument(
      DATABASE_ID,
      DRAFTS_COLLECTION_ID,
      draftId
    );

    alert("🚀 News Published Successfully");
    navigate("/admin");

  } catch (err) {
    console.error("❌ Publish failed", err);
    alert("Publish failed");
  }
};






  const handleUndo = () => {
    console.log("Undo clicked");
  };

  const handleRedo = () => {
    console.log("Redo clicked");
  };


  const selectedBlock = blocks.find(
  (b) => b.id === selectedBlockId
);








  return (
    <div className="create-post">

      {/* ───────── TOP BAR ───────── */}
        <ConfigureHead
        title={title}
        setTitle={setTitle}
        draftStatus={draftStatus}
        markDraftDirty={markDraftDirty}
        onBack={handleBack}
        onPreview={handlePreview}
        onPublish={handlePublish}
        onUndo={handleUndo}
        onRedo={handleRedo}
        theme={theme}
        blocks={blocks}
        setTheme={setTheme}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddUtility={openUtilityTab}
        closeTab={closeTab}
      />


<div className="cp-content">
 {/* ───────── MAIN CONTENT BASED ON ACTIVE TAB ───────── */}
      {activeTab === "create" && (
        <>



      {/* ───────── BLOCK TOOLBAR ───────── */}
      <NewsBlocksStrip
       onAddBlock={addBlock}
       onAddImage={() => setShowImageUploader(true)}
       onAddVideo={() => setShowVideoUploader(true)}
       onAddYoutube={() => {
         const input = window.prompt(
           "Paste a YouTube URL or iframe embed code"
         );
         const parsed = parseYouTubeInput(input);
         if (!parsed?.src) {
           alert("Please provide a valid YouTube URL or embed code.");
           return;
         }

         addBlock({
           id: Date.now(),
           type: "youtube",
           src: parsed.src,
           title: parsed.title || "YouTube video",
           width: parsed.width || "100%",
           height: parsed.height || "100%",
           allow:
             parsed.allow ||
             "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
           referrerPolicy:
             parsed.referrerPolicy || "strict-origin-when-cross-origin",
           allowFullScreen:
             parsed.allowFullScreen !== undefined
               ? parsed.allowFullScreen
               : true,
           align: "center",
           caption: "",
         });
       }}
       onOpenSettings={() => setActivePanel("post")}
  onSaveDraft={() =>
    setPostSettings((p) => ({ ...p, status: "draft" }))
  }
          />


      {/* ───────── MAIN BODY ───────── */}
      <div className="cp-body">

        {/* LEFT: PREVIEW */}
      <LeftPreview
         blocks={blocks}
         selectedBlockId={selectedBlockId}
         onSelectBlock={setSelectedBlockId}
         onReorderBlocks={onReorderBlocks}
         onUpdateBlock={updateBlock}
         theme={theme}
         onApplyInlineMark={(mark) => setPendingMark(mark)}
          />
          
        {/* RIGHT: PROPERTIES */}
        <BlockPropertiesBox
  mode={activePanel === "post" ? "post" : "block"}
  selectedBlock={selectedBlock}
  onUpdateBlock={updateBlock}
  onDeleteBlock={deleteBlock}
  postSettings={postSettings}
  setPostSettings={setPostSettings}
  onClose={() => setActivePanel(null)}
  markDraftDirty={markDraftDirty}
/>


      </div>
         </>
      )}

       {activeTab === "paragraph-splitter" && (
        <div className="utility-shell">
          
          <ParagraphSplitter
          state={paragraphSplitterState}
  setState={setParagraphSplitterState}
  onInsert={(text) => {
    addBlock({
      id: Date.now(),
      type: "paragraph",
      text,
    });
  }} />
        </div>
      )}
        {activeTab === "news-maker" && (
        <div className="utility-shell-ai">
          <SeoTool
          state={seoToolState}
    setState={setSeoToolState}
    onApply={(output) => {
      setTitle(output.title || title);
      setSlug(output.slug || slug);
      setTags(output.tags || tags);

      setSeo(prev => ({
        ...prev,
        description: output.description,
      }));

      markDraftDirty();
    }}  />
        </div>
      )}
      {activeTab === "sociallia-gen" && (
        <div className="utility-shell-ai">
          <SocialliaGen />
        </div>
      )}
      

</div>

{showImageUploader && (
  <ImageUploader
    onUpload={(uploadedImages) => {
  const img = uploadedImages[0]; // first image

  addBlock({
  id: Date.now(),
  type: "image",
  fileId: img.fileId,
  src: img.src,
  align: "center",
  size: "medium",
  caption: "",
  radius: "0px",
  shadow: "none",
  background: "transparent",
});


  setShowImageUploader(false);
}}

    onClose={() => setShowImageUploader(false)}
  />
)}

{showVideoUploader && (
  <VideoUploader
    onUpload={(uploadedVideos) => {
      const vid = uploadedVideos[0];

      addBlock({
        id: Date.now(),
        type: "video",
        fileId: vid.fileId,
        src: vid.src,
        caption: "",
        align: "center",
        controls: true,
        autoplay: false,
        muted: false,
        loop: false,
      });

      setShowVideoUploader(false);
    }}
    onClose={() => setShowVideoUploader(false)}
  />
)}



    </div>

    


  );
};

export default CreatePost;

