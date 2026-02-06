import { useState, useRef } from "react";
import "./Stylings/ImageUploader.css";

export default function ImageUploader({ onUpload, onClose }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleSelect = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files));
  };

  const handleUpload = async () => {
  if (!files.length) return alert("Select images first");

  setLoading(true);

  try {
    const uploaded = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      uploaded.push({
        fileId: data.fileId,
        src: data.publicUrl || data.url,
      });
    }

    // 🔥 send array instead of single image
    onUpload(uploaded);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="iu-overlay">
      <div className="iu-modal">

        <div className="iu-header">
          <span>Add Images</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div
          className="iu-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <div className="cloud-icon">☁️</div>
          <button className="browse-btn">Browse</button>
          <p>or drag photos here</p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleSelect}
          />
        </div>

        {files.length > 0 && (
  <div className="iu-preview-grid">
    {files.map((file, i) => (
      <img
        key={i}
        src={URL.createObjectURL(file)}
        alt="preview"
      />
    ))}
  </div>
)}


        <div className="iu-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="upload-btn"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
