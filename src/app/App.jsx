import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../../admin/Auth/AuthLayout";
import AdminLayout from "../../admin/AdminLayout";
import Dashboard from "../../admin/Dashboard";
import CreatePost from "../../admin/CreatePost";
import ManagePosts from "../../admin/ManagePosts";
import UserAuthPage from "../user/UserAuthPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UserAuthPage />} />
        <Route path="/user/auth" element={<UserAuthPage />} />
        <Route path="/auth" element={<AuthLayout />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreatePost />} />
          <Route path="manage" element={<ManagePosts />} />
        </Route>
        <Route path="*" element={<Navigate to="/user/auth" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
