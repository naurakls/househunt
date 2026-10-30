import Skeleton from "@mui/material/Skeleton";

// Placeholder baris tabel saat data pertama kali dimuat
export default function TableSkeleton({ rows = 4 }) {
  return (
    <div className="px-3 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="d-flex align-items-center gap-3 py-3 border-bottom" style={{ borderColor: "var(--line)" }}>
          <Skeleton variant="rounded" width={64} height={48} />
          <div className="flex-grow-1">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="25%" />
          </div>
          <Skeleton variant="rounded" width={84} height={26} sx={{ borderRadius: 99 }} />
        </div>
      ))}
    </div>
  );
}
