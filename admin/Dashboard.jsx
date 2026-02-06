import DashboardNewsStrip from "./DashboardNewsStrip";
import { useEffect, useState } from "react";
import { databases } from "../admin/appwrite/appwrite";

const DATABASE_ID = "news_db";
const COLLECTION_ID = "posts";

const Dashboard = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID
        );

        // only published + latest first
        const published = res.documents
          .filter(doc => doc.status === "published")
          .sort(
            (a, b) =>
              new Date(b.publishedAt || b.$createdAt) -
              new Date(a.publishedAt || a.$createdAt)
          );

        setNews(published);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <>
      <h2>Latest News</h2>

      {loading && <p>Loading news...</p>}

      {!loading && news.length === 0 && (
        <p>No news published yet</p>
      )}

      {news.map((item) => (
        <DashboardNewsStrip key={item.$id} item={item} />
      ))}
    </>
  );
};

export default Dashboard;
