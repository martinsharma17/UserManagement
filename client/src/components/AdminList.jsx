const AdminList = ({ admins }) => (
  <div className="card">
    <div className="font-semibold mb-3">Admins</div>
    <div className="space-y-2">
      {admins.map((a) => (
        <div key={a.id} className="flex justify-between items-center border p-2 rounded">
          <div>
            <div className="font-medium">{a.displayName || a.email}</div>
            <div className="text-xs text-gray-500">{a.email}</div>
          </div>
          <span className="text-xs bg-blue-50 text-brand px-2 py-1 rounded">Admin</span>
        </div>
      ))}
    </div>
  </div>
);

export default AdminList;

