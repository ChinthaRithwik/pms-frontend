import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useProjects } from "../hooks/useProjects";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function StatCard({ label, count, color }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{count}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useProjects(0, 1000);

  const projects = data?.data?.content ?? [];
  const totalProjects = data?.data?.totalElements ?? 0;

  const countByStatus = (status) =>
    projects.filter((p) => p.status === status).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <Navbar />

      <div className="flex flex-1">

        <Sidebar />

        <main className="flex-1 p-8">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-medium text-blue-600">{user?.email}</span>!
            </p>
          </div>

          {isLoading ? (
            <p className="text-gray-400">Loading stats…</p>
          ) : isError ? (
            <p className="text-red-500">Failed to load project stats.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Total Projects"
                  count={totalProjects}
                  color="border-blue-500"
                />
                <StatCard
                  label="In Progress"
                  count={countByStatus("IN_PROGRESS")}
                  color="border-yellow-400"
                />
                <StatCard
                  label="Completed"
                  count={countByStatus("COMPLETED")}
                  color="border-green-500"
                />
                <StatCard
                  label="On Hold"
                  count={countByStatus("ON_HOLD")}
                  color="border-gray-400"
                />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Recent Projects
                  </h2>
                  <button
                    onClick={() => navigate("/projects")}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all →
                  </button>
                </div>

                {projects.length === 0 ? (
                  <p className="text-gray-400 text-sm">
                    No projects yet. Go to Projects to create one!
                  </p>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b text-gray-500 text-xs uppercase">
                        <th className="pb-2 pr-4">Name</th>
                        <th className="pb-2 pr-4">Status</th>
                        <th className="pb-2">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.slice(0, 5).map((p) => (
                        <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-2 pr-4 font-medium text-gray-800">
                            {p.name}
                          </td>
                          <td className="py-2 pr-4">
                            
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {p.status?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-2 text-gray-400">
                            
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
