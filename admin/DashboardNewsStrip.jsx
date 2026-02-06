import "./Stylings/DashboardNewsStrip.css";
import { DEFAULT_ADMIN_IMAGE } from "../config/defaults";
import { getFirstImageFromBlocks } from "../admin/components/utils/newsHelpers";

const formatDate = (timestamp) => {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const toCamelCase = (str = "") => {
  return str
    .replace(/[_-]/g, " ")
    .split(" ")
    .map(
      word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};


const DashboardNewsStrip = ({ item }) => {
  const imageSrc = getFirstImageFromBlocks(item.blocks);

  return (
    <div className="news-strip">

      {/* Image */}
      <div className="news-image">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.classList.add("image-error");
            }}
          />
        ) : null}

        <span className="image-fallback">Image Not Found</span>
      </div>

      {/* Content */}
      <div className="news-content">
        <h4 title={item.title}>
          {item.title.length > 90
            ? item.title.slice(0, 90) + "..."
            : item.title}
        </h4>

        <div className="news-tags">
          <span>{toCamelCase(item.category)}</span>
        </div>

        <p className="news-date">
          Published – {formatDate(item.createdDate || item.$createdAt)}
        </p>
      </div>

      {/* Right */}
      <div className="news-actions">
        <span className="publisher">
          Sheikh Sarfaraz Ahmed
          <img src={DEFAULT_ADMIN_IMAGE} alt="admin" />
        </span>

        <div className="action-buttons">
          <button title="Edit">✏️</button>
          <button title="View">👁️</button>
          <button title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNewsStrip;
