import { Link } from "react-router-dom";
import { Table } from "antd";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import TableSkeleton from "../../components/common/TableSkeleton";
import Icon from "../../components/common/Icon";
import UserCell from "../../components/dashboard/UserCell";
import OwnerApprovalActions from "../../components/dashboard/OwnerApprovalActions";
import api from "../../api/axios";
import useApi from "../../hooks/useApi";
import usePolling from "../../hooks/usePolling";
import { formatDate, fromNow } from "../../utils/format";

export default function AdminOverview() {
  const stats = useApi(() => api.get("/admin/stats"), []);
  const pending = useApi(
    () => api.get("/admin/users", { params: { type: "owner", granted: "pending", limit: 5 } }),
    []
  );

  const refresh = () => {
    stats.reload({ silent: true });
    pending.reload({ silent: true });
  };
  // Pendaftar owner baru muncul otomatis tanpa refresh halaman
  usePolling(refresh, 20000);

  const s = stats.data;
  const pendingList = pending.data?.items || [];

  return (
    <>
      <PageHeader kicker="Admin" title="Ringkasan" subtitle="Pantau pengguna, properti, dan aktivitas booking." />

      <div className="stat-grid">
        <StatCard label="Renter" value={s?.users.renters} icon="users" loading={stats.loading} />
        <StatCard label="Owner" value={s?.users.owners} icon="key" loading={stats.loading} />
        <StatCard label="Owner menunggu" value={s?.users.pendingOwners} icon="clock" tone="warn" loading={stats.loading} />
        <StatCard
          label="Properti"
          value={s?.properties.total}
          hint={s && `${s.properties.available} tersedia · ${s.properties.rented} disewa`}
          icon="building"
          loading={stats.loading}
        />
        <StatCard
          label="Booking"
          value={s?.bookings.total}
          hint={s && `${s.bookings.pending} menunggu · ${s.bookings.booked} disetujui`}
          icon="calendar"
          tone="accent"
          loading={stats.loading}
        />
      </div>

      <div className="hh-panel hh-panel--flush">
        <div className="hh-panel__head">
          <h2>Owner menunggu persetujuan</h2>
          <Link to="/admin/users?type=owner&granted=pending" className="link-arrow">
            Semua user <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        {pending.loading && !pending.data ? (
          <TableSkeleton rows={3} />
        ) : pendingList.length === 0 ? (
          <EmptyState compact icon="check" title="Tidak ada antrean" text="Semua pendaftaran owner sudah ditinjau." />
        ) : (
          <Table
            rowKey="_id"
            className="mt-3"
            dataSource={pendingList}
            pagination={false}
            scroll={{ x: 640 }}
            columns={[
              { title: "Owner", key: "user", render: (_, u) => <UserCell user={u} /> },
              { title: "Telepon", dataIndex: "phone" },
              {
                title: "Mendaftar",
                dataIndex: "createdAt",
                render: (d) => <span title={formatDate(d)}>{fromNow(d)}</span>,
              },
              { title: "Aksi", key: "actions", render: (_, u) => <OwnerApprovalActions owner={u} onChanged={refresh} /> },
            ]}
          />
        )}
      </div>
    </>
  );
}
