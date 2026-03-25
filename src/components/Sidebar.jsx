import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ logout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = (path) =>
    `cursor-pointer px-2 py-1 rounded ${
      location.pathname === path
        ? "bg-gray-700 text-white"
        : "text-gray-400 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-6">BMW Dashboard</h1>

        <nav className="space-y-2">
          <p className={linkClass("/overview")} onClick={() => navigate("/overview")}>
            Overview
          </p>

          <p className={linkClass("/analytics")} onClick={() => navigate("/analytics")}>
            Analytics
          </p>

          <p className={linkClass("/profile")} onClick={() => navigate("/profile")}>
            Profile
          </p>
        </nav>
      </div>

      <button
        onClick={logout}
        className="bg-gray-100 text-gray-900 w-full p-2 rounded-lg"
      >
        Logout
      </button>
    </aside>
  );
}