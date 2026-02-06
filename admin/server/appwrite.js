//appwrite.js
import dotenv from "dotenv";
dotenv.config();

import { Client, Storage } from "node-appwrite";

// appwrite.js
export const POSTS_COLLECTION_ID = "posts";
export const DRAFTS_COLLECTION_ID = "drafts";



if (!process.env.APPWRITE_ENDPOINT) {
  throw new Error("❌ APPWRITE_ENDPOINT missing");
}
if (!process.env.APPWRITE_PROJECT_ID) {
  throw new Error("❌ APPWRITE_PROJECT_ID missing");
}
if (!process.env.APPWRITE_API_KEY) {
  throw new Error("❌ APPWRITE_API_KEY missing");
}

const client = new Client()
.setEndpoint(process.env.APPWRITE_ENDPOINT)
.setProject(process.env.APPWRITE_PROJECT_ID)

  .setKey(process.env.APPWRITE_API_KEY);

export const storage = new Storage(client);
