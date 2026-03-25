import { useEffect, useState } from "react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { logout } = useAuth();

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    username: "",
    role: "",
  });

  const [password, setPassword] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data);
    } catch (err) {
      console.error("Failed to load user:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/update", user);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (password.new !== password.confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.put("/users/change-password", {
        old_password: password.old,
        new_password: password.new,
      });
      alert("Password updated successfully");
      setShowPasswordModal(false);
      setPassword({ old: "", new: "", confirm: "" });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 text-sm">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <Sidebar logout={logout} />

      <div className="flex-1 flex flex-col">
        <Header title="Your Profile" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Profile Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm w-full">
            <h3 className="mb-5 font-semibold text-gray-800">Profile Information</h3>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">First Name</label>
                  <input
                    value={user.first_name}
                    placeholder="First Name"
                    className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    onChange={(e) => setUser({ ...user, first_name: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">Last Name</label>
                  <input
                    value={user.last_name}
                    placeholder="Last Name"
                    className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    onChange={(e) => setUser({ ...user, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Username</label>
                <input
                  value={user.username}
                  placeholder="Username"
                  disabled
                  className="border border-gray-200 p-2 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Email</label>
                <input
                  value={user.email}
                  placeholder="Email"
                  className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">Phone</label>
                  <input
                    value={user.phone || ""}
                    placeholder="Phone"
                    className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-500 font-medium">Date of Birth</label>
                  <input
                    type="date"
                    value={user.dob || ""}
                    className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    onChange={(e) => setUser({ ...user, dob: e.target.value })}
                  />
                </div>
              </div>

              {/* Left-aligned small save button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition"
                >
                  Save Changes
                </button>

                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>

      {/* ── Change Password Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password.old}
                  className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => setPassword({ ...password, old: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password.new}
                  className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => setPassword({ ...password, new: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password.confirm}
                  className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded-lg transition"
                >
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}