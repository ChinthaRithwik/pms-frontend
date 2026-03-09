import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useOverdueTasks } from "../hooks/useTasks";
import { updateTaskStatus } from "../api/taskApi";

const STATUS_COLORS = {
  TODO:        "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED:   "bg-green-100 text-green-700",
  BLOCKED:     "bg-red-100 text-red-600",
};

const ALL_STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED", "BLOCKED"];

function OverdueTasks() {
  const [page, setPage] = useState(0);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useOverdueTasks(page);

  const tasks = data?.data?.content ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const totalOverdue = data?.data?.totalElements ?? 0;

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.success("Status updated!");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (err) {
      const message = err.response?.data?.message || "Invalid status transition.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-8">

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800">⚠️ Overdue Tasks</h1>
            <p className="text-gray-500 mt-1">
              Tasks that have passed their due date and are not yet completed.
            </p>
          </div>

          {!isLoading && !isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-3 mb-6 text-sm font-medium">
              {totalOverdue === 0
                ? "🎉 No overdue tasks! Great work."
                : `⚠️  ${totalOverdue} overdue task${totalOverdue > 1 ? "s" : ""} found.`}
            </div>
          )}

          {isLoading && <p className="text-gray-400">Loading overdue tasks…</p>}
          {isError && <p className="text-red-500">Failed to load overdue tasks.</p>}

          {!isLoading && !isError && tasks.length > 0 && (
            <>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-red-50 border-b">
                    <tr className="text-xs text-gray-500 uppercase">
                      <th className="px-4 py-3">Task Title</th>
                      <th className="px-4 py-3">Project</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Assigned User</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr
                        key={task.id}
                        className="border-b last:border-0 hover:bg-red-50/50"
                      >

                        <td className="px-4 py-3 font-medium text-gray-800">
                          {task.title}
                        </td>

                        <td className="px-4 py-3 text-gray-500">
                          Project #{task.projectId ?? "—"}
                        </td>

                        <td className="px-4 py-3 text-red-600 font-medium">
                          {task.dueDate ?? "—"}
                        </td>

                        <td className="px-4 py-3 text-gray-500">
                          {task.assignedUserId
                            ? `User #${task.assignedUserId}`
                            : "—"}
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={task.status}
                            onChange={(e) =>
                              handleStatusChange(task.id, e.target.value)
                            }
                            className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${
                              STATUS_COLORS[task.status] ?? "bg-gray-100"
                            }`}
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 rounded-lg bg-white border text-sm disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            </>
          )}

          {!isLoading && !isError && tasks.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🎉</p>
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm">No overdue tasks at the moment.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default OverdueTasks;
