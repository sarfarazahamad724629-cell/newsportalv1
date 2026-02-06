import { useNavigate } from "react-router-dom";
import "./Stylings/ConfigureHead.css";

const ConfigureHead = ({
  title,
  setTitle,
  onPreview,
  onPublish,
  onUndo,
  onRedo,
  theme,
  setTheme,
  blocks,
  draftStatus,
  markDraftDirty,
  tabs,
  setTabs,
  activeTab,
  setActiveTab,
  onAddUtility,
  closeTab,
}) => {
  const navigate = useNavigate();

  return (
    <header className="configure-head">

      {/* ───────── TOP BAR ───────── */}
      <div className="ch-topbar">

        {/* Left */}
        <div className="ch-topbar-left">
          <button
            className="back-btn"
            onClick={() => navigate("/admin")}
          >
            ← Back To Dashboard
          </button>
        </div>

        {/* Center */}
        <div className="ch-topbar-center">
          <div className="ch-tabs">
  {tabs.map(tab => (
    <div
      key={tab.id}
      className={`ch-tab-wrapper ${
        activeTab === tab.id ? "active" : ""
      }`}
    >
      <button
        className="ch-tab"
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>

      {tab.id !== "create" && (
        <button
          className="ch-tab-close"
          onClick={(e) => {
            e.stopPropagation(); // IMPORTANT
            closeTab(tab.id);
          }}
        >
          ×
        </button>
      )}
    </div>
  ))}

  <div className="ch-tab-plus">
    <button className="ch-tab">+</button>

    <div className="ch-dropdown">
      <button
        onClick={() =>
          onAddUtility({
            id: "paragraph-splitter",
            label: "Paragraph Splitter",
            type: "utility"
          })
        }
      >
        Paragraph Splitter
      </button>
      <button
        onClick={() =>
          onAddUtility({
            id: "news-maker",
            label: "News Maker Ai",
            type: "utility"
          })
        }
      >
        News Maker Ai
      </button>
      <button
        onClick={() =>
          onAddUtility({
            id: "sociallia-gen",
            label: "SocialliaGen",
            type: "utility"
          })
        }
      >
        SocialliaGen
      </button>
    </div>
  </div>
</div>

        </div>

        {/* Right */}
        <div className="ch-topbar-right">
          <div className="ch-history">
            <button className="ch-undo-btn" title="Undo" onClick={onUndo}>↶</button>
            <button className="ch-redo-btn" title="Redo" onClick={onRedo}>↷</button>
          </div>

          <button
            className="theme-toggler"
            title="Toggle Theme"
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

      </div>

      {/* ───────── TITLE BAR ───────── */}
      <div className="ch-titlebar">

        <div className="ch-title-input">
          <input
            type="text"
            placeholder="Enter News Title"
            value={title}
            onChange={(e) => {
  setTitle(e.target.value);
  markDraftDirty();
}}

          />
        </div>
        <span className={`draft-indicator status-${draftStatus}`}>
  {draftStatus === "saving" && "⌛ Saving…"}
  {draftStatus === "saved" && "✅ Saved"}
  {draftStatus === "error" && "❌ Save failed"}
  {draftStatus === "dirty" && "● Unsaved changes"}
</span>




        <div className="ch-title-actions">
          <button
            className="preview-btn"
            onClick={onPreview}
          >
            Preview
          </button>

          <button
            className="publish-btn"
            onClick={onPublish}
          >
            Publish
          </button>
        </div>

      </div>

    </header>
  );
};

export default ConfigureHead;
