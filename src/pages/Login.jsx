import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await api.post("/auth/login", form);
    login(res.data.access_token);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-3 border rounded" placeholder="Username"
            onChange={(e)=>setForm({...form,username:e.target.value})}/>
          <input type="password" className="w-full p-3 border rounded" placeholder="Password"
            onChange={(e)=>setForm({...form,password:e.target.value})}/>

          <button className="w-full bg-black text-white p-3 rounded">
            Login
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}