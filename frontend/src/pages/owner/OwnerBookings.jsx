import { useState } from "react";
import { Segmented, Table } from "antd";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import TableSkeleton from "../../components/common/TableSkeleton";
import PropertyCell from "../../components/dashboard/PropertyCell";
import BookingActions from "../../components/dashboard/BookingActions";
import api from "../../api/axios";
import useApi from "../../hooks/useApi";
import usePolling from "../../hooks/usePolling";
import { formatDate, fromNow } from "../../utils/format";

// Kolom tabel booking yang dipakai juga di ringkasan owner
export const ownerBookingColumns = (onChanged) => [
  { title: "Properti", key: "property", render: (_, b) => <PropertyCell property={b.propertyId} /> },
  {
    title: "Penyewa",
    key: "renter",
    render: (_, b) => (
      <>
        <div className="fw-medium">{b.renterName}</div>
        <div className="cell-sub">{b.renterContact}</div>
      </>
    ),
  },
  {
    title: "Diajukan",
    dataIndex: "createdAt",
    render: (date) => (
      <>
        <div className="text-nowrap">{formatDate(date)}</div>
        <div className="cell-sub">{fromNow(date)}</div>
      </>
    ),
  },
  { title: "Status", dataIndex: "bookingStatus", render: (s) => <StatusBadge status={s} /> },
  { title: "Aksi", key: "actions", render: (_, b) => <BookingActions booking={b} onChanged={onChanged} /> },
];

export default function OwnerBookings() {
  const [status, setStatus] = useState("all");
  const { data, loading, error, reload } = useApi(() => api.get("/owner/bookings"), []);
  // Booking baru dari renter muncul otomatis
  usePolling(() => reload({ silent: true }), 20000);

  const list = data || [];
  const count = (s) => list.filter((b) => b.bookingStatus === s).length;
  const filtered = status === "all" ? list : list.filter((b) => b.bookingStatus === status);

  return (
    <>
      <PageHeader kicker="Kelola" title="Booking masuk" subtitle="Setujui atau tolak pengajuan sewa dari calon penyewa." />

      <div className="hh-panel hh-panel--flush">
        <div className="hh-panel__head">
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { label: `Semua (${list.length})`, value: "all" },
              { label: `Menunggu (${count("pending")})`, value: "pending" },
              { label: `Disetujui (${count("booked")})`, value: "booked" },
              { label: `Ditolak (${count("rejected")})`, value: "rejected" },
            ]}
          />
        </div>
        {loading && !data ? (
          <TableSkeleton />
        ) : error ? (
          <EmptyState icon="alert" title="Gagal memuat booking" text={error} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="calendar"
            title={status === "all" ? "Belum ada booking" : "Tidak ada booking di kategori ini"}
            text="Pengajuan sewa dari renter akan muncul di sini."
          />
        ) : (
          <Table
            rowKey="_id"
            className="mt-3"
            columns={ownerBookingColumns(() => reload({ silent: true }))}
            dataSource={filtered}
            pagination={{ pageSize: 8, hideOnSinglePage: true }}
            scroll={{ x: 820 }}
          />
        )}
      </div>
    </>
  );
}
