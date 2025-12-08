import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const UserDashboard = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    password: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm({
      displayName: user?.displayName || "",
      email: user?.email || "",
      password: "",
    });
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.put(`/api/users/${user.id}`, form);
    setMessage("Profile updated");
    setForm({ ...form, password: "" });
    setUser(res.data);
  };

  return (
    <div className="card">
      <div className="font-semibold mb-3">My Profile</div>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          placeholder="Display name"
        />
        <input
          className="w-full border rounded px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="New password (optional)"
        />
        <button className="bg-brand text-white px-4 py-2 rounded w-full">
          Save
        </button>
        {message && <div className="text-sm text-green-600">{message}</div>}
      </form>
    </div>
  );
};

export default UserDashboard;

