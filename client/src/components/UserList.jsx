const UserList = ({ users, canEdit, onDelete, onPromote, onDemote }) => {
  return (
    <div className="card">
      <div className="font-semibold mb-3">Users</div>
      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between border p-2 rounded"
          >
            <div>
              <div className="font-medium">{u.displayName || u.email}</div>
              <div className="text-xs text-gray-500">
                {u.email} · {u.roles?.join(", ")}
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                {onPromote && (
                  <button
                    onClick={() => onPromote(u)}
                    className="text-xs text-brand"
                  >
                    Promote
                  </button>
                )}
                {onDemote && (
                  <button
                    onClick={() => onDemote(u)}
                    className="text-xs text-brand"
                  >
                    Demote
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(u)}
                    className="text-xs text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;

