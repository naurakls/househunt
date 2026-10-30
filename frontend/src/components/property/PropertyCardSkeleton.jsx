import Skeleton from "@mui/material/Skeleton";

// Skeleton loading berbentuk kartu properti (MUI Skeleton)
export default function PropertyCardSkeleton() {
  return (
    <div className="hh-card property-card" aria-hidden="true">
      <Skeleton variant="rounded" sx={{ width: "100%", height: "auto", aspectRatio: "4 / 3", borderRadius: "10px" }} />
      <div className="property-card__body">
        <Skeleton variant="text" width="45%" height={18} />
        <Skeleton variant="text" width="60%" height={34} />
        <Skeleton variant="text" width="85%" />
        <div className="d-flex gap-2 pt-2">
          <Skeleton variant="rounded" width={56} height={24} sx={{ borderRadius: 99 }} />
          <Skeleton variant="rounded" width={64} height={24} sx={{ borderRadius: 99 }} />
          <Skeleton variant="rounded" width={48} height={24} sx={{ borderRadius: 99 }} />
        </div>
      </div>
    </div>
  );
}
