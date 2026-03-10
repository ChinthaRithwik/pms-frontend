import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../api/authApi";
import { toast } from "react-toastify";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signupUser({ name, email, password });
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      const raw = err.response?.data?.message;
      const message =
        typeof raw === "object" && raw !== null
          ? Object.values(raw).join(", ")
          : raw || "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join the Project Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="Min. 8 characters"
              minLength={8}
              className="border border-gray-300 rounded-lg w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white w-full py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? "Creating account…" : "Register"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
