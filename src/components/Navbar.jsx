import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow-md">

      <h1 className="font-bold text-lg tracking-wide">
        📋 Project Management System
      </h1>

      <div className="flex items-center gap-4">

        {user?.email && (
          <span className="text-sm text-blue-100">
            👤 {user.email}
          </span>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          Logout
        </button>

      </div>
    </nav>
  );
}

export default Navbar;
