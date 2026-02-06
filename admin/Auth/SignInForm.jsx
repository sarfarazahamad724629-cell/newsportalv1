import { useState } from "react";
import { account } from "../../admin/appwrite/auth";
import { useNavigate } from "react-router-dom";
import "./Stylings/SignInForm.css";

export default function SignInForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ added
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = () => {
  account.createOAuth2Session(
    "google",
    "http://localhost:5173/admin", // success redirect
    "http://localhost:5173"        // failure redirect
  );
};


  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await account.createEmailPasswordSession(email, password);
      navigate("/admin");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="signin-form" onSubmit={handleSignIn}>
      <h2>Sign in</h2>

      <div className="signin-socials">
  <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
    <img
      src="/images/social-icons/google-logo.svg"
      alt="Google"
      className="google-logo"
    />
    <span>Sign in with Google</span>
  </button>
</div>



      <p className="signin-small-text">or use your account</p>

      {/* Email */}
      <div className="signin-field">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password with toggle */}
      <div className="signin-password-field">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="button"
          className="signin-toggle-password"
          onClick={() => setShowPassword((p) => !p)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {error && <p className="signin-error-text">{error}</p>}

      <button className="signin-primary-btn" disabled={loading}>
        {loading ? "Signing in..." : "SIGN IN"}
      </button>
    </form>
  );
}
