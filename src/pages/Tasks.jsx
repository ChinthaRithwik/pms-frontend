import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import Navbar  from "../components/Navbar";
import Sidebar from "../components/Sidebar";

import {
  createTask, deleteTask, updateTaskStatus, updateTask,
  updateTaskAssignee, searchTasks,
} from "../api/taskApi";

import { useTasksByProject, useSearchTasks } from "../hooks/useTasks";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = {
  TODO:        "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  BLOCKED:     "bg-red-100 text-red-600",
};
const ALL_STATUSES = ["TODO","IN_PROGRESS","COMPLETED","BLOCKED"];

// Mirror the backend's AllowedTransitions map
const VALID_TASK_TRANSITIONS = {
  TODO:        ["TODO", "IN_PROGRESS"],
  IN_PROGRESS: ["IN_PROGRESS", "COMPLETED", "BLOCKED"],
  BLOCKED:     ["BLOCKED", "IN_PROGRESS"],
  COMPLETED:   ["COMPLETED"],
};

function Tasks() {
  const { isAdmin } = useAuth();

  const [mode, setMode] = useState("browse");

  const [searchParams] = useSearchParams();
  const urlProjectId = searchParams.get("projectId");
  const [projectId, setProjectId] = useState(urlProjectId ?? "");
  const [statusFilter, setStatusFilter] = useState("");
  const [browsePage, setBrowsePage] = useState(0);

  const [searchProjectId,    setSearchProjectId]    = useState("");
  const [searchStatus,       setSearchStatus]       = useState("");
  const [searchAssignedUser, setSearchAssignedUser] = useState("");
  const [searchDueBefore,    setSearchDueBefore]    = useState("");
  const [searchPage,         setSearchPage]         = useState(0);
  const [searchFilters,      setSearchFilters]      = useState({});

  const [showModal,          setShowModal]          = useState(false);
  const [editingTask,        setEditingTask]        = useState(null);
  const [formTitle,          setFormTitle]          = useState("");
  const [formDueDate,        setFormDueDate]        = useState("");
  const [formAssignedUserId, setFormAssignedUserId] = useState("");
  const [formSubmitting,     setFormSubmitting]     = useState(false);

  const [reassignTask,    setReassignTask]    = useState(null);
  const [reassignUserId,  setReassignUserId]  = useState("");
  const [reassignLoading, setReassignLoading] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (urlProjectId) { setProjectId(urlProjectId); setMode("browse"); }
  }, [urlProjectId]);

  const browseQuery = useTasksByProject(
    mode === "browse" ? (projectId || null) : null,
    statusFilter || null,
    browsePage
  );

  const searchQuery = useSearchTasks(
    mode === "search" ? searchFilters : {},
    searchPage
  );

  const activeQuery = mode === "browse" ? browseQuery : searchQuery;
  const tasks       = activeQuery.data?.data?.content  ?? [];
  const totalPages  = activeQuery.data?.data?.totalPages ?? 1;
  const page        = mode === "browse" ? browsePage : searchPage;
  const setPage     = mode === "browse" ? setBrowsePage : setSearchPage;

  const openCreateModal = () => {
    setEditingTask(null); setFormTitle(""); setFormDueDate(""); setFormAssignedUserId("");
    setShowModal(true);
  };
  const openEditModal = (task) => {
    setEditingTask(task); setFormTitle(task.title); setFormDueDate(task.dueDate ?? "");
    setFormAssignedUserId("");
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingTask(null); };

  const handleFormSubmit = async (e) => {
    e.preventDefault(); setFormSubmitting(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, { title: formTitle, dueDate: formDueDate || null });
        toast.success("Task updated!");
      } else {
        await createTask(projectId, {
          title: formTitle, dueDate: formDueDate || null,
          assignedUserId: Number(formAssignedUserId),
        });
        toast.success("Task created!");
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed.");
    } finally { setFormSubmitting(false); }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(taskId);
      toast.success("Task deleted.");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success("Status updated!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid status transition.");
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault(); setReassignLoading(true);
    try {
      await updateTaskAssignee(reassignTask.id, Number(reassignUserId));
      toast.success("Task reassigned!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setReassignTask(null); setReassignUserId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reassignment failed.");
    } finally { setReassignLoading(false); }
  };

  const handleSearch = () => {
    setSearchFilters({
      projectId:      searchProjectId      || undefined,
      status:         searchStatus         || undefined,
      assignedUserId: searchAssignedUser   || undefined,
      dueBefore:      searchDueBefore      || undefined,
    });
    setSearchPage(0);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
            {mode === "browse" && projectId && (
              <button onClick={openCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                + Add Task
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setMode("browse")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "browse" ? "bg-blue-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
              📁 Browse by Project
            </button>
            
            <button onClick={() => setMode("search")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === "search" ? "bg-blue-600 text-white" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
              🔍 Search Tasks
            </button>
          </div>

          {mode === "browse" && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Project ID</label>
                <input type="number" placeholder="Enter project ID"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-44 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={projectId} onChange={(e) => { setProjectId(e.target.value); setBrowsePage(0); }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setBrowsePage(0); }}>
                  <option value="">All Statuses</option>
                  {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
              </div>
            </div>
          )}

          {mode === "search" && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <p className="text-sm font-medium text-gray-600 mb-3">
                Filter across all projects — all fields are optional:
              </p>
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Project ID</label>
                  <input type="number" placeholder="Any project"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-36 text-sm"
                    value={searchProjectId} onChange={(e) => setSearchProjectId(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                    <option value="">Any</option>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Assigned User ID</label>
                  <input type="number" placeholder="Any user"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-36 text-sm"
                    value={searchAssignedUser} onChange={(e) => setSearchAssignedUser(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Due Before</label>
                  <input type="date"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={searchDueBefore} onChange={(e) => setSearchDueBefore(e.target.value)} />
                </div>
                <button onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                  Search
                </button>
                <button onClick={() => {
                  setSearchProjectId(""); setSearchStatus(""); setSearchAssignedUser("");
                  setSearchDueBefore(""); setSearchFilters({}); setSearchPage(0);
                }} className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm">
                  Clear
                </button>
              </div>
            </div>
          )}

          {mode === "browse" && !projectId && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">✅</p>
              <p>Enter a Project ID above or click "Tasks" on a project card.</p>
            </div>
          )}
          {activeQuery.isLoading && <p className="text-gray-400">Loading tasks…</p>}
          {activeQuery.isError   && <p className="text-red-500">Failed to load tasks.</p>}

          {!activeQuery.isLoading && !activeQuery.isError &&
            (mode === "search" || projectId) && (
            <>
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p>No tasks found.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="px-4 py-3">Title</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Due Date</th>
                        <th className="px-4 py-3">Project</th>
                        <th className="px-4 py-3">Assigned User</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{task.title}</td>

                          <td className="px-4 py-3">
                            <select value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUS_COLORS[task.status] ?? "bg-gray-100"}`}>
                              {(VALID_TASK_TRANSITIONS[task.status] ?? ALL_STATUSES).map((s) => (
                                <option key={s} value={s}>{s.replace("_"," ")}</option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-3 text-gray-500">{task.dueDate ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-500">#{task.projectId ?? "—"}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {task.assignedUserId ? `User #${task.assignedUserId}` : "—"}
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => openEditModal(task)}
                                className="text-amber-500 hover:text-amber-700 text-xs font-medium">
                                ✏️ Edit
                              </button>
                              <button onClick={() => handleDelete(task.id)}
                                className="text-red-500 hover:text-red-700 text-xs font-medium">
                                🗑️ Delete
                              </button>
                              
                              {isAdmin && (
                                <button
                                  onClick={() => { setReassignTask(task); setReassignUserId(""); }}
                                  className="text-purple-500 hover:text-purple-700 text-xs font-medium">
                                  👤 Reassign
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center gap-4 mt-4">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40">← Prev</button>
                <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40">Next →</button>
              </div>
            </>
          )}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input type="text" maxLength={100} required
                  placeholder="e.g. Design the login page"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
              </div>
              {!editingTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned User ID <span className="text-red-500">*</span>
                  </label>
                  <input type="number" required placeholder="e.g. 1"
                    className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formAssignedUserId} onChange={(e) => setFormAssignedUserId(e.target.value)} />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg font-medium">
                  {formSubmitting ? "Saving…" : editingTask ? "Save Changes" : "Create Task"}
                </button>
                <button type="button" onClick={closeModal}
                  className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reassignTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Reassign Task</h2>
            <p className="text-sm text-gray-500 mb-4">
              Task: <span className="font-medium text-gray-700">{reassignTask.title}</span>
            </p>
            <form onSubmit={handleReassign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Assigned User ID <span className="text-red-500">*</span>
                </label>
                <input type="number" required placeholder="e.g. 3"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={reassignUserId} onChange={(e) => setReassignUserId(e.target.value)} />
                <p className="text-xs text-gray-400 mt-1">
                  Current assignee: {reassignTask.assignedUserId ? `User #${reassignTask.assignedUserId}` : "None"}
                </p>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={reassignLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white py-2 rounded-lg font-medium">
                  {reassignLoading ? "Saving…" : "Reassign"}
                </button>
                <button type="button"
                  onClick={() => { setReassignTask(null); setReassignUserId(""); }}
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

export default Tasks;
