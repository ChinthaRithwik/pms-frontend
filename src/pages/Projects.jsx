import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import Navbar      from "../components/Navbar";
import Sidebar     from "../components/Sidebar";
import ProjectCard from "../components/ProjectCard";

import { useProjects, useAllSystemProjects }                 from "../hooks/useProjects";
import { createProject, updateProject, updateProjectStatus,
         deleteProject, getProjectById }                       from "../api/projectApi";
import { useAuth }                                             from "../context/AuthContext";

const STATUS_COLORS = {
  PLANNED:     "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_HOLD:     "bg-yellow-100 text-yellow-700",
  COMPLETED:   "bg-green-100 text-green-700",
  CANCELLED:   "bg-red-100 text-red-600",
};

const ALL_PROJECT_STATUSES = ["PLANNED","IN_PROGRESS","ON_HOLD","COMPLETED","CANCELLED"];

// Mirror the backend's projectStatusAllowedTransitions map
const VALID_PROJECT_TRANSITIONS = {
  PLANNED:     ["PLANNED", "IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"],
  ON_HOLD:     ["ON_HOLD", "IN_PROGRESS", "CANCELLED"],
  COMPLETED:   ["COMPLETED"],
  CANCELLED:   ["CANCELLED"],
};

function Projects() {
  const { isAdmin } = useAuth();

  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState("my"); // "my" or "all"

  const [showModal, setShowModal]         = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formName, setFormName]           = useState("");
  const [formDesc, setFormDesc]           = useState("");
  const [formStatus, setFormStatus]       = useState("PLANNED");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [detailProject, setDetailProject] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  const myProjectsQuery = useProjects(page);
  const allProjectsQuery = useAllSystemProjects(page, { enabled: isAdmin && viewMode === "all" });

  const activeQuery = (isAdmin && viewMode === "all") ? allProjectsQuery : myProjectsQuery;
  const { data, isLoading, isError, error } = activeQuery;
  const projects   = data?.data?.content  ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const openDetailModal = async (projectId) => {
    setLoadingDetail(true);
    setDetailProject(null);
    try {
      const res = await getProjectById(projectId);
      setDetailProject(res.data);
    } catch {
      toast.error("Failed to load project details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const openCreateModal = () => {
    setEditingProject(null);
    setFormName(""); setFormDesc(""); setFormStatus("PLANNED");
    setShowModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setFormName(project.name);
    setFormDesc(project.description ?? "");
    setFormStatus(project.status ?? "PLANNED");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, { name: formName, description: formDesc });

        if (isAdmin && formStatus !== editingProject.status) {
          await updateProjectStatus(editingProject.id, formStatus);
        }
        toast.success("Project updated!");
      } else {
        await createProject({ name: formName, description: formDesc, ownerId: 0 });
        toast.success("Project created!");
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["allSystemProjects"] });
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm("Delete this project? This also deletes all its tasks.")) return;
    try {
      await deleteProject(projectId);
      toast.success("Project deleted.");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["allSystemProjects"] });
      if (projects.length === 1 && page > 0) setPage((p) => p - 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete project.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
              {isAdmin && (
                <div className="bg-gray-200 p-1 rounded-lg flex items-center">
                  <button
                    onClick={() => { setViewMode("my"); setPage(0); }}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === "my" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    My Projects
                  </button>
                  <button
                    onClick={() => { setViewMode("all"); setPage(0); }}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === "all" ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    All System Projects
                  </button>
                </div>
              )}
            </div>
            <button onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap">
              + Create Project
            </button>
          </div>

          {(viewMode === "all" && isAdmin) && (
            <p className="text-sm text-red-500 mb-6 -mt-2">
              Viewing all projects in the system. You have admin privileges to edit any project.
            </p>
          )}

          {isLoading && <p className="text-gray-400">Loading projects…</p>}
          {isError   && <p className="text-red-500">Failed to load: {error?.message}</p>}
          {!isLoading && !isError && projects.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📁</p>
              <p>No projects yet. Click "Create Project" to get started.</p>
            </div>
          )}

          {!isLoading && !isError && projects.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewDetails={openDetailModal}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4 mt-6">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40">
                  ← Previous
                </button>
                <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40">
                  Next →
                </button>
              </div>
            </>
          )}
        </main>
      </div>

      {(loadingDetail || detailProject) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setDetailProject(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}  >

            {loadingDetail ? (
              <p className="text-center text-gray-400 py-8">Loading details…</p>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  📁 Project Details
                </h2>

                {[
                  ["ID",          detailProject.id],
                  ["Name",        detailProject.name],
                  ["Description", detailProject.description || "—"],
                  ["Status",      detailProject.status?.replace("_"," ")],
                  ["Created",     detailProject.createdAt
                                    ? new Date(detailProject.createdAt).toLocaleString()
                                    : "—"],
                  ["Updated",     detailProject.updatedAt
                                    ? new Date(detailProject.updatedAt).toLocaleString()
                                    : "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2 mb-2 text-sm">
                    <span className="font-medium text-gray-600 w-28">{label}:</span>
                    <span className="text-gray-800">{value}</span>
                  </div>
                ))}

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => {
                      setDetailProject(null);
                      navigate(`/tasks?projectId=${detailProject.id}`);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium">
                    View Tasks
                  </button>
                  <button onClick={() => setDetailProject(null)}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg text-sm">
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingProject ? "Edit Project" : "Create New Project"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input type="text" maxLength={100} required
                  placeholder="e.g. Website Redesign"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={formName} onChange={(e) => setFormName(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea maxLength={500} rows={3}
                  placeholder="Optional description…"
                  className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
              </div>

              {isAdmin && editingProject && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-xs text-red-400">(Admin only)</span>
                  </label>
                  <select
                    className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                    {(VALID_PROJECT_TRANSITIONS[editingProject.status] ?? ALL_PROJECT_STATUSES).map((s) => (
                      <option key={s} value={s}>{s.replace("_"," ")}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Current: {editingProject.status?.replace("_"," ")}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={formSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2 rounded-lg font-medium">
                  {formSubmitting ? "Saving…" : editingProject ? "Save Changes" : "Create"}
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
    </div>
  );
}

export default Projects;
