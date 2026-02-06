import express from "express";
import multer from "multer";
import { storage } from "../appwrite.js";
import { ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

const router = express.Router();

/* ===============================
   MULTER (MEMORY – OLD SAFE)
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
});

/* ===============================
   ENV
================================ */
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const ENDPOINT = process.env.APPWRITE_ENDPOINT;
/* ===============================
Delete Image From Appwrite Storage
================================ */
router.delete("/:fileId", async (req, res) => {
  try {
    await storage.deleteFile(
      process.env.APPWRITE_BUCKET_ID,
      req.params.fileId
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






/* ===============================
   🔥 HELPER: BUILD PUBLIC URL
   (new functionality)
================================ */
const buildPublicFileUrl = (fileId) => {
  return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
};

/* ======================================================
   ✅ OLD ROUTE (100% BACKWARD COMPATIBLE)
====================================================== */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // OLD WAY (BUFFER)
    const file = InputFile.fromBuffer(
      req.file.buffer,
      req.file.originalname
    );

    const uploaded = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      file
    );

    const fileId = uploaded.$id;

    // OLD METHOD (Appwrite SDK)
    const sdkUrl = storage.getFileView(BUCKET_ID, fileId);

    // NEW METHOD (manual public URL)
    const publicUrl = buildPublicFileUrl(fileId);

    console.log("✅ UPLOAD SUCCESS:", {
      sdkUrl: sdkUrl.href,
      publicUrl,
    });

    res.json({
      fileId,
      url: sdkUrl.href,       // ✅ old consumers safe
      publicUrl,              // 🔥 new clean url
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/* ======================================================
   🆕 OPTIONAL NEW CONTROLLER STYLE (FUTURE USE)
   (agar tum baad me diskStorage use karo)
====================================================== */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await storage.createFile(
      BUCKET_ID,
      ID.unique(),
      req.file.path // disk storage case
    );

    const fileId = result.$id;
    const imageUrl = buildPublicFileUrl(fileId);

    console.log("✅ IMAGE URL:", imageUrl);

    res.json({
      fileId,
      url: imageUrl,
    });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export default router;
