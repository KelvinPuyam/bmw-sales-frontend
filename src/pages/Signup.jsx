import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/auth/signup", form);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input className="border p-2" placeholder="First Name"
            onChange={(e)=>setForm({...form,first_name:e.target.value})}/>
          <input className="border p-2" placeholder="Last Name"
            onChange={(e)=>setForm({...form,last_name:e.target.value})}/>

          <input className="col-span-2 border p-2" placeholder="Username"
            onChange={(e)=>setForm({...form,username:e.target.value})}/>
          <input className="col-span-2 border p-2" placeholder="Email"
            onChange={(e)=>setForm({...form,email:e.target.value})}/>

          <input type="password" className="col-span-2 border p-2" placeholder="Password"
            onChange={(e)=>setForm({...form,password:e.target.value})}/>

          <input className="border p-2" placeholder="Phone"
            onChange={(e)=>setForm({...form,phone:e.target.value})}/>
          <input type="date" className="border p-2"
            onChange={(e)=>setForm({...form,dob:e.target.value})}/>

          <button className="col-span-2 bg-black text-white p-3 rounded">
            Sign Up
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}