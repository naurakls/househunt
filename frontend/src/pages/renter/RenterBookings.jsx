import { Link } from "react-router-dom";
import { Table } from "antd";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import TableSkeleton from "../../components/common/TableSkeleton";
import PropertyCell from "../../components/dashboard/PropertyCell";
import Icon from "../../components/common/Icon";
import api from "../../api/axios";
import useApi from "../../hooks/useApi";
import usePolling from "../../hooks/usePolling";
import { useAuth } from "../../context/AuthContext";
import { useUnread } from "../../context/UnreadContext";
import { formatDate, formatPrice, fromNow, priceSuffix } from "../../utils/format";

export default function RenterBookings() {
  const { user } = useAuth();
  const { unread } = useUnread();
  const { data: bookings, loading, error, reload } = useApi(() => api.get("/users/bookings"), []);
  // Status booking dicek ulang tiap 20 detik, jadi persetujuan owner langsung terlihat
  usePolling(() => reload({ silent: true }), 20000);

  const list = bookings || [];
  const count = (status) => list.filter((b) => b.bookingStatus === status).length;

  const columns = [
    { title: "Properti", key: "property", render: (_, b) => <PropertyCell property={b.propertyId} /> },
    {
      title: "Harga",
      key: "price",
      render: (_, b) =>
        b.propertyId && (
          <span className="fw-semibold text-nowrap">
            {formatPrice(b.propertyId.rentAmount, b.propertyId.adType)}
            <span className="cell-sub"> {priceSuffix(b.propertyId.adType)}</span>
          </span>
        ),
    },
    {
      title: "Pemilik",
      key: "owner",
      render: (_, b) => (
        <>
          <div className="fw-medium">{b.ownerId?.name}</div>
          <div className="cell-sub">{b.ownerId?.phone}</div>
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
    { title: "Status", dataIndex: "bookingStatus", render: (status) => <StatusBadge status={status} /> },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, b) =>
        b.propertyId && (
          <Link to={`/renter/messages?property=${b.propertyId._id}`} className="btn btn-outline-primary btn-sm">
            <Icon name="message" size={15} /> Tanya
          </Link>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        kicker={`Halo, ${user.name.split(" ")[0]}`}
        title="Booking saya"
        subtitle="Pantau status pengajuan sewa kamu di sini."
        actions={<Link to="/properties" className="btn btn-accent"><Icon name="search" size={18} /> Cari properti</Link>}
      />

      <div className="stat-grid">
        <StatCard label="Total booking" value={list.length} icon="calendar" loading={loading} />
        <StatCard label="Menunggu" value={count("pending")} icon="clock" tone="warn" loading={loading} />
        <StatCard label="Disetujui" value={count("booked")} icon="check" loading={loading} />
        <StatCard label="Pesan belum dibaca" value={unread} icon="message" tone="accent" />
      </div>

      <div className="hh-panel hh-panel--flush">
        <div className="hh-panel__head"><h2>Riwayat booking</h2></div>
        {loading && !bookings ? (
          <TableSkeleton />
        ) : error ? (
          <EmptyState icon="alert" title="Gagal memuat booking" text={error} />
        ) : list.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Belum ada booking"
            text="Temukan tempat yang kamu suka, lalu ajukan booking dari halaman detailnya."
            action={<Link to="/properties" className="btn btn-primary">Mulai mencari</Link>}
          />
        ) : (
          <Table rowKey="_id" columns={columns} dataSource={list} pagination={{ pageSize: 8, hideOnSinglePage: true }} scroll={{ x: 820 }} className="mt-3" />
        )}
      </div>
    </>
  );
}
