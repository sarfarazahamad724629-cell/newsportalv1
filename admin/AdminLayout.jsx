import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuth from "../admin/appwrite/useAuth";
import { account } from "../admin/appwrite/auth"; // make sure this imports your Appwrite account
import SearchBox from "./SearchBox";
import "./Stylings/AdminLayout.css";
import { DEFAULT_ADMIN_IMAGE } from "../config/defaults";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userId, setUserId] = useState(null);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("admin-theme") === "dark"
  );

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

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("admin-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // 🔐 AUTH GUARD
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth"); // redirect to login if not logged in
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Checking session...</div>;

  // 🔒 Logout function
  const handleLogout = async () => {
    try {
      await account.deleteSession("current"); // logout current session
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="ap-wrapper">
      
      {/* Sidebar */}
      <aside className="ap-sidebar">
        <h2 className="ap-logo">SocialActivity BSP</h2>

        <nav className="ap-nav">
          <NavLink to="/admin" end className="ap-nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/admin/create" className="ap-nav-link">
            Create Post
          </NavLink>
          <NavLink to="/admin/manage" className="ap-nav-link">
            Manage
          </NavLink>
        </nav>

        {/* Logout button at the bottom */}
        <div className="ap-sidebar-bottom">
          <button className="ap-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="ap-main">
        
        {/* Header */}
        <header className="ap-header">
          <div className="ap-header-left">
            <h3 className="ap-title">Admin Panel</h3>
          </div>

          <div className="ap-header-center">
            <SearchBox onSearch={(v) => console.log("Searching:", v)} />
          </div>

          <div className="ap-header-right">
            <button
              className="ap-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle Dark Mode"
            >
              {darkMode ? "🌙" : "☀️"}
            </button>

            <div className="ap-user">
              <img src={DEFAULT_ADMIN_IMAGE} alt="admin" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="ap-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
