import { useState } from "react";
import "./Stylings/SignUpForm.css";

export default function SignUpForm({ onSignupBlocked }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🚫 Google Signup blocked
  const handleGoogleSignUp = () => {
    onSignupBlocked();
  };

  // 🚫 Email Signup blocked
  const handleSignUp = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSignupBlocked();
    }, 500);
  };

  return (
    <form className="signup-form" onSubmit={handleSignUp}>
      <h2>Create Account</h2>

      <div className="signin-socials">
        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignUp}
        >
          <img
            src="/images/social-icons/google-logo.svg"
            alt="Google"
            className="google-logo"
          />
          <span>Sign up with Google</span>
        </button>
      </div>

      <p className="signup-small-text">or use your email</p>

      <div className="signup-email-field">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="signup-password-field">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="button"
          className="signup-toggle-password"
          onClick={() => setShowPassword((p) => !p)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <button className="signup-primary-btn" disabled={loading}>
        {loading ? "Checking..." : "SIGN UP"}
      </button>
    </form>
  );
}
