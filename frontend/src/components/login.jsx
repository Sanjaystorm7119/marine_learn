import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "../pages/login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Send email and password to FastAPI
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      // 2. Handle the response
      if (response.ok) {
        const data = await response.json();

        // MAGIC HAPPENS HERE: Save the "Keycard" (Token) to the browser!
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);
        localStorage.setItem("full_name", data.full_name);

        // Redirect based on role
        if (data.role === "admin") {
          navigate("/admin"); // → Admin dashboard
        } else {
          navigate("/dashboard"); // → Normal user dashboard
        }
      } else {
        const errorData = await response.json();
        alert(errorData.detail || "Invalid email or password");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to the server.");
    }
  };

  return (
    <div className="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-container"
      >
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to access your courses and certificates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Sign In <ArrowRight className="btn-icon" />
          </button>
        </form>

        <div className="login-footer">
          <Link to="/signup" className="link-primary">
            Don't have an account? Sign up
          </Link>
          <div>
            <Link to="/" className="link-muted">
              <ArrowLeft className="back-icon" /> Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
