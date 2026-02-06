import { useState } from "react";
import { Link } from "react-router-dom";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import "./auth.css";

export default function AuthLayout() {
  const [mode, setMode] = useState("signin");
  const [toast, setToast] = useState({ message: "", type: "" });

  const showSignupDisabledToast = () => {
    setMode("signup");
    setToast({
      message: "🚫 New account creation is currently not available.",
      type: "error",
    });

    setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 2500);
  };

  return (
    <div className="auth-page">
      {toast.message && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="auth-card">
        {/* LEFT: AUTH FORM */}
        <div className="auth-form">
          {mode === "signin" ? (
            <>
              <SignInForm />

              <p className="switch-text">
                Don’t have an account?{" "}
                <span onClick={() => setMode("signup")}>
                  Create one
                </span>
              </p>

              {/* BACK TO HOME */}
              <p className="back-home">
                Or{" "}
                <Link to="/">
                  Back To Home
                </Link>
              </p>
            </>
          ) : (
            <>
              <SignUpForm onSignupBlocked={showSignupDisabledToast} />

              <p className="switch-text">
                Already have an account?{" "}
                <span onClick={() => setMode("signin")}>
                  Sign in
                </span>
              </p>

              {/* BACK TO HOME */}
              <p className="back-home">
                Or{" "}
                <Link to="/">
                  Back To Home
                </Link>
              </p>
            </>
          )}
        </div>

        {/* RIGHT: MINIMAL BRAND PANEL */}
        <div className="auth-panel brand-panel minimal-brand">
          <img
            src="/logo-square.png"
            alt="Social Activity BSP"
            className="brand-logo large"
          />

          <h2 className="brand-title">
            Social Activity BSP
          </h2>

          <p className="brand-slogan">
            Voice of Society, Power of Truth.
          </p>
        </div>
      </div>
    </div>
  );
}
