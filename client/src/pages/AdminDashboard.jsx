import { useEffect, useState } from "react";
import api from "../api/axios";
import UserList from "../components/UserList";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  const fetchUsers = async () => {
    const res = await api.get("/api/users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/api/users", {
      ...form,
      role: "User",
      managedByAdminId: null,
    });
    setForm({ email: "", password: "", displayName: "" });
    fetchUsers();
  };

  const remove = async (u) => {
    if (!confirm("Delete user?")) return;
    await api.delete(`/api/users/${u.id}`);
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="font-semibold mb-3">Create User</div>
        <form onSubmit={create} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Display name"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          />
          <button className="bg-brand text-white rounded px-4 py-2">
            Create
          </button>
        </form>
      </div>
      <UserList users={users} canEdit onDelete={remove} />
    </div>
  );
};

export default AdminDashboard;

