import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Input, Segmented, Select, Table } from "antd";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import TableSkeleton from "../../components/common/TableSkeleton";
import UserCell from "../../components/dashboard/UserCell";
import OwnerApprovalActions from "../../components/dashboard/OwnerApprovalActions";
import api from "../../api/axios";
import useApi from "../../hooks/useApi";
import { cleanParams, formatDate } from "../../utils/format";

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const [params] = useSearchParams();
  // Filter awal bisa datang dari URL, misal dari tombol "Semua user" di ringkasan
  const [filters, setFilters] = useState({
    type: params.get("type") || "",
    granted: params.get("granted") || "",
    search: "",
    page: 1,
  });
  const { data, loading, error, reload } = useApi(
    () => api.get("/admin/users", { params: cleanParams({ ...filters, limit: PAGE_SIZE }) }),
    [filters.type, filters.granted, filters.search, filters.page]
  );

  const update = (patch) => setFilters((f) => ({ ...f, ...patch, page: patch.page ?? 1 }));

  const columns = [
    { title: "Nama", key: "user", render: (_, u) => <UserCell user={u} showPhone /> },
    { title: "Role", dataIndex: "type", render: (type) => <StatusBadge status={type} plain /> },
    {
      title: "Status",
      key: "granted",
      render: (_, u) => (u.type === "owner" ? <StatusBadge status={u.granted} /> : <span className="cell-sub">-</span>),
    },
    { title: "Bergabung", dataIndex: "createdAt", render: (d) => <span className="text-nowrap">{formatDate(d)}</span> },
    {
      title: "Aksi",
      key: "actions",
      render: (_, u) => (u.type === "owner" ? <OwnerApprovalActions owner={u} onChanged={() => reload({ silent: true })} /> : null),
    },
  ];

  return (
    <>
      <PageHeader kicker="Admin" title="Kelola user" subtitle="Lihat semua pengguna dan tinjau pendaftaran owner." />

      <div className="hh-panel hh-panel--flush">
        <div className="hh-panel__head">
          <div className="toolbar mb-0 w-100">
            <Segmented
              value={filters.type}
              onChange={(type) => update({ type, granted: type === "owner" ? filters.granted : "" })}
              options={[
                { label: "Semua", value: "" },
                { label: "Renter", value: "renter" },
                { label: "Owner", value: "owner" },
                { label: "Admin", value: "admin" },
              ]}
            />
            {filters.type === "owner" && (
              <Select
                value={filters.granted}
                onChange={(granted) => update({ granted })}
                style={{ width: 180 }}
                options={[
                  { label: "Semua status", value: "" },
                  { label: "Menunggu", value: "pending" },
                  { label: "Disetujui", value: "granted" },
                  { label: "Ditolak", value: "rejected" },
                ]}
              />
            )}
            <Input.Search
              allowClear
              placeholder="Cari nama atau email"
              onSearch={(search) => update({ search: search.trim() })}
              style={{ maxWidth: 280, marginLeft: "auto" }}
            />
          </div>
        </div>

        {loading && !data ? (
          <TableSkeleton />
        ) : error ? (
          <EmptyState icon="alert" title="Gagal memuat user" text={error} />
        ) : (
          <Table
            rowKey="_id"
            className="mt-3"
            columns={columns}
            dataSource={data?.items}
            loading={loading}
            scroll={{ x: 760 }}
            locale={{ emptyText: <EmptyState compact icon="users" title="Tidak ada user" text="Coba ubah filter atau kata kunci." /> }}
            pagination={{
              current: filters.page,
              pageSize: PAGE_SIZE,
              total: data?.pagination.total,
              onChange: (page) => update({ page }),
              showSizeChanger: false,
              hideOnSinglePage: true,
            }}
          />
        )}
      </div>
    </>
  );
}
