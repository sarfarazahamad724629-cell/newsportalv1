import { Client, Databases, Storage,Query } from "appwrite";

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const storage = new Storage(client);

// IDs from env
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const POSTS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID;
export const DRAFTS_COLLECTION_ID =
  import.meta.env.VITE_APPWRITE_DRAFTS_COLLECTION_ID;

export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;
export { Query };