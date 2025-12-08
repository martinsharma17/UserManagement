import { useEffect, useState } from "react";
import api from "../api/axios";
import UserList from "../components/UserList";
import AdminList from "../components/AdminList";

const SuperAdminDashboard = () => {
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "User",
  });
  const [error, setError] = useState("");

  const fetchAll = async () => {
    const [adminsRes, usersRes] = await Promise.all([
      api.get("/api/admin"),
      api.get("/api/users"),
    ]);
    setAdmins(adminsRes.data);
    setUsers(usersRes.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const promote = async (user) => {
    await api.patch(`/api/users/${user.id}/role`, { role: "Admin" });
    fetchAll();
  };

  const demote = async (user) => {
    await api.patch(`/api/users/${user.id}/role`, { role: "User" });
    fetchAll();
  };

  const remove = async (user) => {
    if (!confirm("Delete account?")) return;
    await api.delete(`/api/users/${user.id}`);
    fetchAll();
  };

  // Create user/admin
  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/users", {
        ...form,
        managedByAdminId: form.role === "Admin" ? null : undefined,
      });
      setForm({ email: "", password: "", displayName: "", role: "User" });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2 card mb-6">
        <div className="font-semibold mb-3">Create User or Admin</div>
        {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-5 gap-3"
        >
          <input
            className="border rounded px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Display name"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </select>
          <button className="bg-brand text-white rounded px-4 py-2">Create</button>
        </form>
      </div>
      <AdminList admins={admins} />
      <UserList
        users={users}
        canEdit
        onDelete={remove}
        onPromote={promote}
        onDemote={demote}
      />
    </div>
  );
};

export default SuperAdminDashboard;

