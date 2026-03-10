import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard      from "./pages/Dashboard";
import Projects       from "./pages/Projects";
import Tasks          from "./pages/Tasks";
import OverdueTasks   from "./pages/OverdueTasks";
import LoginPage      from "./pages/LoginPage";
import SignupPage     from "./pages/SignupPage";
import UserManagement from "./pages/UserManagement";
import NotFound       from "./pages/NotFound";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute     from "./routes/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/"       element={<LoginPage />} />
        <Route path="/login"  element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute><Projects /></ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute><Tasks /></ProtectedRoute>
        } />

        <Route path="/overdue" element={
          <ProtectedRoute><OverdueTasks /></ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <AdminRoute><UserManagement /></AdminRoute>
        } />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
