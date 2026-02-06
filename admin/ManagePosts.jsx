import { useEffect, useMemo, useState } from "react";
import { useSettings } from "../Context/SettingsContext";
import {
  databases,
  DATABASE_ID,
  POSTS_COLLECTION_ID,
  Query,
} from "./appwrite/appwrite";
import "./Stylings/Manage.css";

const Manage = () => {
  const { settings, setSettings } = useSettings();
  const [saveMessage, setSaveMessage] = useState("");
  const [breakingOptions, setBreakingOptions] = useState([]);
  const [breakingSelection, setBreakingSelection] = useState("");
  const [breakingCurrent, setBreakingCurrent] = useState(null);
  const [breakingStatus, setBreakingStatus] = useState({
    loading: true,
    saving: false,
    error: "",
    message: "",
  });

  const sortedBreakingOptions = useMemo(
    () =>
      [...breakingOptions].sort((a, b) =>
        (b.publishedAt || b.$createdAt).localeCompare(
          a.publishedAt || a.$createdAt
        )
      ),
    [breakingOptions]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    setSettings((prev) => ({
      ...prev,
      [e.target.name]: url,
    }));

  };

  const handleSave = async () => {
    console.log("Saved:", settings);
    setSaveMessage(`Saved locally • ${new Date().toLocaleTimeString()}`);
  };

  const fetchBreakingOptions = async ({ preserveMessage = false } = {}) => {
    setBreakingStatus((prev) => ({
      ...prev,
      loading: true,
      error: "",
      message: preserveMessage ? prev.message : "",
    }));

    try {
      const res = await databases.listDocuments(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        [
          Query.equal("status", "published"),
          Query.orderDesc("publishedAt"),
          Query.limit(50),
        ]
      );

      setBreakingOptions(res.documents);

      const current = res.documents.find((doc) => doc.isBreakingMain);
      setBreakingCurrent(current || null);
      setBreakingSelection(current?.$id || "");
    } catch (err) {
      console.error("Failed to load breaking main options", err);
      setBreakingStatus((prev) => ({
        ...prev,
        error: "Unable to load published news. Please try again.",
      }));
    } finally {
      setBreakingStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchBreakingOptions();
  }, []);

  const handleSetBreakingMain = async () => {
    if (!breakingSelection) return;

    if (breakingCurrent?.$id === breakingSelection) {
      setBreakingStatus((prev) => ({
        ...prev,
        message: "This story is already set as breaking main.",
        error: "",
      }));
      return;
    }

    setBreakingStatus((prev) => ({
      ...prev,
      saving: true,
      message: "",
      error: "",
    }));

    try {
      if (breakingCurrent?.$id) {
        await databases.updateDocument(
          DATABASE_ID,
          POSTS_COLLECTION_ID,
          breakingCurrent.$id,
          {
            isBreakingMain: false,
          }
        );
      }

      await databases.updateDocument(
        DATABASE_ID,
        POSTS_COLLECTION_ID,
        breakingSelection,
        {
          isBreakingMain: true,
        }
      );

      await fetchBreakingOptions({ preserveMessage: true });
      setBreakingStatus((prev) => ({
        ...prev,
        message: "Breaking main news updated successfully.",
      }));
    } catch (err) {
      console.error("Failed to update breaking main news", err);
      setBreakingStatus((prev) => ({
        ...prev,
        error: "Update failed. Please check your connection.",
      }));
    } finally {
      setBreakingStatus((prev) => ({ ...prev, saving: false }));
    }
  };

  return (
    <div className="manage-container">
      <h1 className="manage-title">Site Management</h1>

      <div className="manage-form">
        <section className="manage-section">
          <div className="manage-section-header">
            <div>
              <h2>General</h2>
              <p>Update the site identity and metadata used across the app.</p>
            </div>
          </div>

          <div className="manage-grid">
            <div className="manage-group">
              <label>Site Title</label>
              <input
                type="text"
                name="siteTitle"
                value={settings.siteTitle}
                onChange={handleChange}
                placeholder="Enter the portal title"
              />
              <span className="manage-help">
                Appears in the browser tab and search metadata.
              </span>
            </div>

            <div className="manage-group">
              <label>Site Description</label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleChange}
                rows={4}
                placeholder="Write a short description for SEO"
              />
            </div>
          </div>
        </section>

        <section className="manage-section">
          <div className="manage-section-header">
            <div>
              <h2>Branding</h2>
              <p>Upload branding assets for the header and browser tab.</p>
            </div>
          </div>

          <div className="manage-grid manage-grid-half">
            <div className="manage-group">
              <label>Favicon</label>
              <input
                type="file"
                name="favicon"
                accept="image/*"
                onChange={handleFileChange}
              />
              {settings.favicon && (
                <div className="manage-file-preview">
                  <img src={settings.favicon} alt="Favicon preview" />
                  <span>Current favicon</span>
                </div>
              )}
            </div>

            <div className="manage-group">
              <label>Site Logo</label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                onChange={handleFileChange}
              />
              {settings.logo && (
                <div className="manage-file-preview">
                  <img src={settings.logo} alt="Logo preview" />
                  <span>Current logo</span>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="manage-section">
          <div className="manage-section-header">
            <div>
              <h2>Theme & Status</h2>
              <p>Control color accents and availability.</p>
            </div>
          </div>

          <div className="manage-grid manage-grid-half">
            <div className="manage-group manage-color">
              <label>Theme Color</label>
              <div className="manage-color-input">
                <input
                  type="color"
                  name="themeColor"
                  value={settings.themeColor}
                  onChange={handleChange}
                />
                <span>{settings.themeColor}</span>
              </div>
            </div>

            <div className="manage-group">
              <label>Maintenance Mode</label>
              <div className="manage-toggle">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleChange}
                />
                <span>
                  {settings.maintenanceMode
                    ? "Enabled: visitors will see maintenance screen"
                    : "Disabled: site is live"}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="manage-section breaking-section">
          <div className="manage-section-header">
            <div>
              <h2>Breaking Main News</h2>
              <p>
                Select a published story to feature in the main breaking news
                slider.
              </p>
            </div>
            <button
              type="button"
              className="manage-secondary-btn"
              onClick={fetchBreakingOptions}
              disabled={breakingStatus.loading}
            >
              Refresh list
            </button>
          </div>

          {breakingStatus.error && (
            <div className="manage-alert error">{breakingStatus.error}</div>
          )}

          {breakingStatus.message && (
            <div className="manage-alert success">{breakingStatus.message}</div>
          )}

          {breakingStatus.loading ? (
            <p className="manage-loading">Loading published news…</p>
          ) : (
            <>
              <div className="breaking-current">
                <span>Current breaking main:</span>
                <strong>
                  {breakingCurrent?.title || "Not set yet"}
                </strong>
              </div>

              {sortedBreakingOptions.length === 0 ? (
                <p className="manage-loading">
                  No published news found yet.
                </p>
              ) : (
                <div className="breaking-options">
                  {sortedBreakingOptions.map((doc) => (
                    <label
                      key={doc.$id}
                      className={`breaking-option-card${
                        breakingSelection === doc.$id ? " selected" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="breakingMain"
                        value={doc.$id}
                        checked={breakingSelection === doc.$id}
                        onChange={() => setBreakingSelection(doc.$id)}
                      />
                      <div>
                        <h4>{doc.title}</h4>
                        <p>
                          {doc.category || "Uncategorized"} •{" "}
                          {new Date(
                            doc.publishedAt || doc.$createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <button
                className="manage-save-btn"
                onClick={handleSetBreakingMain}
                disabled={
                  breakingStatus.saving || sortedBreakingOptions.length === 0
                }
              >
                {breakingStatus.saving
                  ? "Updating..."
                  : "Set this news as breaking main"}
              </button>
            </>
          )}
        </section>

        <div className="manage-actions">
          <button className="manage-save-btn" onClick={handleSave}>
            Save Settings
          </button>
          {saveMessage && <span className="manage-saved">{saveMessage}</span>}
        </div>
      </div>
    </div>
  );
};

export default Manage;
