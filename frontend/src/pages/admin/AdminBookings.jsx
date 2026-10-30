import { useState } from "react";
import { Segmented, Table } from "antd";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import TableSkeleton from "../../components/common/TableSkeleton";
import PropertyCell from "../../components/dashboard/PropertyCell";
import UserCell from "../../components/dashboard/UserCell";
import api from "../../api/axios";
import useApi from "../../hooks/useApi";
import { cleanParams, formatDate, fromNow } from "../../utils/format";

const PAGE_SIZE = 10;

export default function AdminBookings() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, loading, error } = useApi(
    () => api.get("/admin/bookings", { params: cleanParams({ status, page, limit: PAGE_SIZE }) }),
    [status, page]
  );

  const columns = [
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
    { title: "Owner", key: "owner", render: (_, b) => <UserCell user={b.ownerId} /> },
    {
      title: "Diajukan",
      dataIndex: "createdAt",
      render: (d) => (
        <>
          <div className="text-nowrap">{formatDate(d)}</div>
          <div className="cell-sub">{fromNow(d)}</div>
        </>
      ),
    },
    { title: "Status", dataIndex: "bookingStatus", render: (s) => <StatusBadge status={s} /> },
  ];

  return (
    <>
      <PageHeader kicker="Admin" title="Semua booking" subtitle="Riwayat pengajuan sewa di seluruh platform." />
      <div className="hh-panel hh-panel--flush">
        <div className="hh-panel__head">
          <Segmented
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { label: "Semua", value: "" },
              { label: "Menunggu", value: "pending" },
              { label: "Disetujui", value: "booked" },
              { label: "Ditolak", value: "rejected" },
            ]}
          />
        </div>
        {loading && !data ? (
          <TableSkeleton />
        ) : error ? (
          <EmptyState icon="alert" title="Gagal memuat booking" text={error} />
        ) : (
          <Table
            rowKey="_id"
            className="mt-3"
            columns={columns}
            dataSource={data?.items}
            loading={loading}
            scroll={{ x: 900 }}
            locale={{ emptyText: <EmptyState compact icon="calendar" title="Belum ada booking" /> }}
            pagination={{
              current: page,
              pageSize: PAGE_SIZE,
              total: data?.pagination.total,
              onChange: setPage,
              showSizeChanger: false,
              hideOnSinglePage: true,
            }}
          />
        )}
      </div>
    </>
  );
}
