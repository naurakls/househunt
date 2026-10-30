import { Link } from "react-router-dom";
import { Table } from "antd";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import EmptyState from "../../components/common/EmptyState";
import TableSkeleton from "../../components/common/TableSkeleton";
import Icon from "../../components/common/Icon";
import api from "../../api/axios";
import useApi from "../../hooks/useApi";
import usePolling from "../../hooks/usePolling";
import { useAuth } from "../../context/AuthContext";
import { useUnread } from "../../context/UnreadContext";
import { ownerBookingColumns } from "./OwnerBookings";

export default function OwnerOverview() {
  const { user } = useAuth();
  const { unread } = useUnread();
  // Dua request paralel: properti & booking milik owner
  const { data, loading, reload } = useApi(async () => {
    const [properties, bookings] = await Promise.all([api.get("/owner/properties"), api.get("/owner/bookings")]);
    return { data: { data: { properties: properties.data.data, bookings: bookings.data.data } } };
  }, []);
  usePolling(() => reload({ silent: true }), 20000);

  const properties = data?.properties || [];
  const bookings = data?.bookings || [];
  const pending = bookings.filter((b) => b.bookingStatus === "pending");

  return (
    <>
      <PageHeader
        kicker={`Halo, ${user.name.split(" ")[0]}`}
        title="Ringkasan"
        subtitle="Gambaran singkat properti dan booking kamu hari ini."
        actions={<Link to="/owner/properties" className="btn btn-accent"><Icon name="plus" size={18} /> Tambah properti</Link>}
      />

      <div className="stat-grid">
        <StatCard label="Total properti" value={properties.length} icon="building" loading={loading} />
        <StatCard label="Tersedia" value={properties.filter((p) => p.isAvailable).length} icon="home" loading={loading} />
        <StatCard label="Booking menunggu" value={pending.length} icon="clock" tone="warn" loading={loading} />
        <StatCard label="Pesan belum dibaca" value={unread} icon="message" tone="accent" />
      </div>

      <div className="hh-panel hh-panel--flush">
        <div className="hh-panel__head">
          <h2>Perlu tindakan</h2>
          <Link to="/owner/bookings" className="link-arrow">Semua booking <Icon name="arrowRight" size={16} /></Link>
        </div>
        {loading && !data ? (
          <TableSkeleton rows={3} />
        ) : pending.length === 0 ? (
          <EmptyState compact icon="check" title="Semua beres" text="Tidak ada booking yang menunggu persetujuan." />
        ) : (
          <Table
            rowKey="_id"
            className="mt-3"
            columns={ownerBookingColumns(() => reload({ silent: true }))}
            dataSource={pending.slice(0, 5)}
            pagination={false}
            scroll={{ x: 820 }}
          />
        )}
      </div>
    </>
  );
}
