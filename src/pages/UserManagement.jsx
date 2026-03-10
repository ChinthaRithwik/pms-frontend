import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { useUsers } from "../hooks/useUsers";

import Navbar  from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  createUser, getUserById,
  deleteUser, getUserTasks, getUserProjects,
} from "../api/userApi";

function UserManagement() {

  const [listPage,     setListPage]     = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading: listLoading } = useUsers(listPage);
  const users = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const listLoaded = !!data;

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createName,      setCreateName]      = useState("");
  const [createEmail,     setCreateEmail]     = useState("");
  const [createPassword,  setCreatePassword]  = useState("");
  const [createLoading,   setCreateLoading]   = useState(false);

  const [detailUser,     setDetailUser]     = useState(null);
  const [detailTasks,    setDetailTasks]    = useState([]);
  const [detailProjects, setDetailProjects] = useState([]);
  const [detailLoading,  setDetailLoading]  = useState(false);
  const [detailTab,      setDetailTab]      = useState("info");

  const handleCreate = async (e) => {
    e.preventDefault(); setCreateLoading(true);
    try {
      await createUser({ name: createName, email: createEmail, password: createPassword });
      toast.success("User created!");
      setShowCreateModal(false);
      setCreateName(""); setCreateEmail(""); setCreatePassword("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user.");
    } finally { setCreateLoading(false); }
  };

  const openDetail = async (userId) => {
    setDetailLoading(true);
    setDetailUser(null); setDetailTasks([]); setDetailProjects([]);
    setDetailTab("info");
    try {
      const [userRes, tasksRes, projectsRes] = await Promise.all([
        getUserById(userId),
        getUserTasks(userId),
        getUserProjects(userId),
      ]);
      setDetailUser(userRes.data);
      setDetailTasks(tasksRes.data?.data?.content ?? []);
      setDetailProjects(projectsRes.data?.data?.content ?? []);
    } catch (err) {
      toast.error("Failed to load user details.");
    } finally { setDetailLoading(false); }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(
      `Delete user "${userName}"?\n\nThis will fail if they own projects or have assigned tasks — reassign those first.`
    )) return;
    try {
      await deleteUser(userId);
      toast.success("User deleted.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (detailUser?.id === userId) setDetailUser(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8">
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">👥 User Management</h1>
              <p className="text-sm text-red-500 mt-1">Admin only — not visible to regular users</p>
            </div>
            <div className="flex gap-3">
              
              <button onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
                🔄 Refresh
              </button>
              
              <button onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                + Create User
              </button>
            </div>
          </div>

          <div className="flex gap-6">

            <div className="flex-1">
              {!listLoaded && !listLoading && (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-5xl mb-4">👥</p>
                  <p>Click "Load All Users" to fetch the user list.</p>
                </div>
              )}

              {listLoading && <p className="text-gray-400">Loading users…</p>}

              {listLoaded && !listLoading && (
                <>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr className="text-xs text-gray-500 uppercase">
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.length === 0 ? (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No users found.</td></tr>
                        ) : users.map((u) => (
                          <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400 text-xs">#{u.id}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                            <td className="px-4 py-3 text-gray-500">{u.email}</td>
                            <td className="px-4 py-3">
                              
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                u.role === "ADMIN"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                
                                <button onClick={() => openDetail(u.id)}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                  🔍 Details
                                </button>
                                
                                <button onClick={() => handleDelete(u.id, u.name)}
                                  className="text-red-500 hover:text-red-700 text-xs font-medium">
                                  🗑️ Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <button onClick={() => setListPage(listPage - 1)} disabled={listPage === 0}
                      className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40">← Prev</button>
                    <span className="text-sm text-gray-500">Page {listPage + 1} of {totalPages}</span>
                    <button onClick={() => setListPage(listPage + 1)} disabled={listPage >= totalPages - 1}
                      className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40">Next →</button>
                  </div>
                </>
              )}
            </div>

            {(detailLoading || detailUser) && (
              <div className="w-80 bg-white rounded-xl shadow-sm p-5 self-start sticky top-8">
                {detailLoading ? (
                  <p className="text-gray-400 text-sm text-center py-8">Loading…</p>
                ) : (
                  <>
                    
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-800">{detailUser.name}</h3>
                      <button onClick={() => setDetailUser(null)}
                        className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
                    </div>

                    <div className="flex gap-1 mb-4">
                      {["info","tasks","projects"].map((tab) => (
                        <button key={tab} onClick={() => setDetailTab(tab)}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            detailTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}>
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>

                    {detailTab === "info" && (
                      <div className="space-y-2 text-sm">
                        {[
                          ["ID",    `#${detailUser.id}`],
                          ["Name",  detailUser.name],
                          ["Email", detailUser.email],
                          ["Role",  detailUser.role],
                        ].map(([label, val]) => (
                          <div key={label} className="flex gap-2">
                            <span className="font-medium text-gray-500 w-16">{label}:</span>
                            <span className="text-gray-800">{val}</span>
                          </div>
                        ))}
                        <button onClick={() => handleDelete(detailUser.id, detailUser.name)}
                          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm font-medium">
                          🗑️ Delete This User
                        </button>
                      </div>
                    )}

                    {detailTab === "tasks" && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">
                          {detailTasks.length} assigned task(s) shown (first page)
                        </p>
                        {detailTasks.length === 0 ? (
                          <p className="text-gray-400 text-sm">No assigned tasks.</p>
                        ) : detailTasks.map((t) => (
                          <div key={t.id} className="mb-2 p-2 bg-gray-50 rounded-lg text-xs">
                            <p className="font-medium text-gray-800">{t.title}</p>
                            <p className="text-gray-400">Status: {t.status} · Due: {t.dueDate ?? "—"}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {detailTab === "projects" && (
                      <div>
                        <p className="text-xs text-gray-400 mb-2">
                          {detailProjects.length} project(s) shown (first page)
                        </p>
                        {detailProjects.length === 0 ? (
                          <p className="text-gray-400 text-sm">No owned projects.</p>
                        ) : detailProjects.map((p) => (
                          <div key={p.id} className="mb-2 p-2 bg-gray-50 rounded-lg text-xs">
                            <p className="font-medium text-gray-800">{p.name}</p>
                            <p className="text-gray-400">Status: {p.status?.replace("_"," ")}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New User</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required placeholder="John Doe"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={createName} onChange={(e) => setCreateName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" required placeholder="user@example.com"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input type="password" required minLength={8} placeholder="Min. 8 characters"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} />
              </div>
              <p className="text-xs text-gray-400">
                Note: Users created here will have the USER role by default.
              </p>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg font-medium">
                  {createLoading ? "Creating…" : "Create User"}
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-medium">
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

export default UserManagement;
