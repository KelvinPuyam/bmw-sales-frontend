import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", form);
      login(res.data.access_token);
      navigate("/overview");
    } catch (err) {
      // Handle different error cases
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid username or password");
        } else {
          setError(err.response.data?.detail || "Login failed");
        }
      } else {
        setError("Network error. Please try again.");
      }
    }
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setError(""); // clear error while typing
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm text-center">
              {error}
            </div>
          )}

          <input
            className="w-full p-3 border rounded"
            placeholder="Username"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
          />

          <input
            type="password"
            className="w-full p-3 border rounded"
            placeholder="Password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />

          <button className="w-full bg-black text-white p-3 rounded hover:bg-gray-800 transition">
            Login
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}