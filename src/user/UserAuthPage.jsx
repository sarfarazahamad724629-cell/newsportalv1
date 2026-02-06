import { useEffect, useMemo, useState } from "react";
import { ID, Query } from "appwrite";
import { account } from "../../admin/appwrite/auth";
import { databases, DATABASE_ID } from "../../admin/appwrite/appwrite";
import ImageUploader from "../../admin/components/ImageUploader";
import "./UserAuth.css";

const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;

const buildUserPayload = (authUser, overrides = {}) => ({
  userId: authUser.$id,
  name: overrides.name?.trim() || authUser.name || "",
  username: overrides.username?.trim() || "",
  avatar: overrides.avatar || "",
  role: "user",
  status: "active",
  isVerified: false,
  joinedAt: authUser.$createdAt || new Date().toISOString(),
});

export default function UserAuthPage() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [success, setSuccess] = useState("");

  const isAuthed = useMemo(() => Boolean(sessionUser), [sessionUser]);

  const loadSession = async () => {
    try {
      const user = await account.get();
      setSessionUser(user);
      await ensureUserDocument(user, {});
    } catch (err) {
      setSessionUser(null);
      setUserDoc(null);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const ensureUniqueUsername = async (value, currentUserId) => {
    if (!value.trim()) return;
    const res = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("username", value.trim())]
    );
    const match = res.documents.find(
      (doc) => doc.userId !== currentUserId
    );
    if (match) {
      throw new Error("Username is already taken.");
    }
  };

  const ensureUserDocument = async (authUser, overrides) => {
    if (!USERS_COLLECTION_ID) {
      throw new Error("Users collection id is missing.");
    }
    const existing = await databases.listDocuments(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      [Query.equal("userId", authUser.$id)]
    );
    if (existing.documents.length > 0) {
      const doc = existing.documents[0];
      setUserDoc(doc);
      return doc;
    }
    await ensureUniqueUsername(overrides.username || "", authUser.$id);
    const payload = buildUserPayload(authUser, overrides);
    const created = await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      ID.unique(),
      payload
    );
    setUserDoc(created);
    return created;
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await ensureUniqueUsername(username, "");
      const newUser = await account.create(
        ID.unique(),
        email.trim(),
        password,
        name.trim()
      );
      await account.createEmailPasswordSession(
        email.trim(),
        password
      );
      setSessionUser(newUser);
      await ensureUserDocument(newUser, {
        name,
        username,
        avatar,
      });
      setSuccess("Account created.");
      setMode("signin");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Unable to sign up.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await account.createEmailPasswordSession(
        email.trim(),
        password
      );
      const user = await account.get();
      setSessionUser(user);
      await ensureUserDocument(user, {});
      setSuccess("Signed in.");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setProfileError("");
    setSuccess("");
    await account.deleteSession("current");
    setSessionUser(null);
    setUserDoc(null);
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setSuccess("");

    try {
      const currentUser = await account.get();
      await ensureUniqueUsername(username, currentUser.$id);
      const currentDoc = await ensureUserDocument(currentUser, {});
      const updated = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        currentDoc.$id,
        {
          name: name.trim(),
          username: username.trim(),
          avatar,
        }
      );
      setUserDoc(updated);
      setSuccess("Profile updated.");
    } catch (err) {
      setProfileError(err.message || "Profile update failed.");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (userDoc) {
      setName(userDoc.name || "");
      setUsername(userDoc.username || "");
      setAvatar(userDoc.avatar || "");
    }
  }, [userDoc]);

  return (
    <div className="user-auth-page">
      <div className="user-auth-card">
        <div className="user-auth-header">
          <h2>Member Access</h2>
          <p>Sign in or create a user account</p>
        </div>

        <div className="user-auth-tabs">
          <button
            type="button"
            className={mode === "signin" ? "active" : ""}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {error && <p className="user-auth-error">{error}</p>}
        {success && <p className="user-auth-success">{success}</p>}

        {mode === "signup" ? (
          <form className="user-auth-form" onSubmit={handleSignUp}>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            <div className="avatar-row">
              {avatar ? (
                <img src={avatar} alt="avatar" />
              ) : (
                <div className="avatar-placeholder">+</div>
              )}
              <button
                type="button"
                onClick={() => setShowUploader(true)}
              >
                Upload avatar
              </button>
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>
        ) : (
          <form className="user-auth-form" onSubmit={handleSignIn}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

        {isAuthed && (
          <div className="user-auth-profile">
            <div className="profile-header">
              <h3>Profile</h3>
              <button type="button" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
            {profileError && (
              <p className="user-auth-error">{profileError}</p>
            )}
            <form onSubmit={handleProfileSave}>
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </label>
              <label>
                Username
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </label>
              <label>
                Avatar
                <div className="avatar-row">
                  {avatar ? (
                    <img src={avatar} alt="avatar" />
                  ) : (
                    <div className="avatar-placeholder">+</div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowUploader(true)}
                  >
                    Change avatar
                  </button>
                </div>
              </label>
              <button type="submit" disabled={profileLoading}>
                {profileLoading ? "Saving..." : "Save profile"}
              </button>
            </form>
          </div>
        )}
      </div>

      {showUploader && (
        <ImageUploader
          onUpload={(uploaded) => {
            const file = uploaded[0];
            if (file) {
              setAvatar(file.src);
            }
            setShowUploader(false);
          }}
          onClose={() => setShowUploader(false)}
        />
      )}
    </div>
  );
}
