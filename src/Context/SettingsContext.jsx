import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("site_settings");
    return saved
      ? JSON.parse(saved)
      : {
          siteTitle: "My Site",
          siteDescription: "",
          favicon: "",
          logo: "",
          themeColor: "#0d6efd",
          maintenanceMode: false,
        };
  });

  // 🔥 APPLY CHANGES TO REAL SITE
  useEffect(() => {
    // Title
    document.title = settings.siteTitle || "My Site";

    // Meta Description
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = settings.siteDescription || "";

    // Favicon
    if (settings.favicon) {
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.favicon;
    }

    // Theme color
    document.documentElement.style.setProperty(
      "--theme-color",
      settings.themeColor
    );

    // Persist
    localStorage.setItem("site_settings", JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

