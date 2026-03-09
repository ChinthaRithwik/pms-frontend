import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  PLANNED:     "bg-gray-100 text-gray-600",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  ON_HOLD:     "bg-yellow-100 text-yellow-700",
  COMPLETED:   "bg-green-100 text-green-700",
  CANCELLED:   "bg-red-100 text-red-600",
};

function ProjectCard({ project, onViewDetails, onEdit, onDelete }) {
  const navigate = useNavigate();

  const badgeClass = STATUS_COLORS[project.status] || "bg-gray-100 text-gray-600";

  return (
    <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col gap-3">

      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-800 leading-tight">{project.name}</h2>
        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${badgeClass}`}>
          {project.status?.replace("_", " ")}
        </span>
      </div>

      <p className="text-gray-500 text-sm line-clamp-2">
        {project.description || "No description provided."}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-gray-100">

        {onViewDetails && (
          <button onClick={() => onViewDetails(project.id)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors">
            🔍 Details
          </button>
        )}

        <button onClick={() => navigate(`/tasks?projectId=${project.id}`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
          📋 Tasks
        </button>

        {onEdit && (
          <button onClick={() => onEdit(project)}
            className="bg-amber-400 hover:bg-amber-500 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
            ✏️
          </button>
        )}

        {onDelete && (
          <button onClick={() => onDelete(project.id)}
            className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}

export default ProjectCard;
