import { useState } from "react";
import "./Stylings/SearchBox.css";

const SearchBox = ({ onSearch }) => {
  const [keyword, setKeyword] = useState("");

  const triggerSearch = () => {
    if (!keyword.trim()) return;
    onSearch?.(keyword.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") triggerSearch();
  };

  return (
    <div className="admin-search">
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>

        <input
          type="text"
          placeholder="Search news, authors, tags..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button onClick={triggerSearch}>Search</button>
      </div>
    </div>
  );
};

export default SearchBox;
