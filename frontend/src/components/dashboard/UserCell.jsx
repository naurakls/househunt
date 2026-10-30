import Avatar from "@mui/material/Avatar";

// Avatar + nama + email (opsional: nomor HP) untuk sel tabel
export default function UserCell({ user, showPhone = false }) {
  if (!user) return <span className="cell-sub">-</span>;
  return (
    <div className="cell-user">
      <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>{user.name?.charAt(0).toUpperCase()}</Avatar>
      <div style={{ minWidth: 0 }}>
        <div className="fw-medium">{user.name}</div>
        <div className="cell-sub">{user.email}</div>
        {showPhone && user.phone && <div className="cell-sub">{user.phone}</div>}
      </div>
    </div>
  );
}
