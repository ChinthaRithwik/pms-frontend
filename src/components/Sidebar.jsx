import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const { isAdmin } = useAuth();

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-300"
    }`;

  return (
    <aside className="w-56 min-h-screen bg-gray-100 border-r border-gray-200 p-4 flex-shrink-0">

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Navigation
      </p>
      <ul className="space-y-1 mb-6">
        <li><NavLink to="/dashboard" className={linkClass}>🏠 Dashboard</NavLink></li>
        <li><NavLink to="/projects"  className={linkClass}>📁 Projects</NavLink></li>
        <li><NavLink to="/tasks"     className={linkClass}>✅ Tasks</NavLink></li>
        <li><NavLink to="/overdue"   className={linkClass}>⚠️ Overdue Tasks</NavLink></li>
      </ul>

      {isAdmin && (
        <>
          
          <div className="border-t border-gray-300 mb-3" />

          <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-3">
            Admin
          </p>
          <ul className="space-y-1">
            
            <li>
              <NavLink to="/admin/users" className={linkClass}>
                👥 User Management
              </NavLink>
            </li>
          </ul>
        </>
      )}
    </aside>
  );
}

export default Sidebar;
