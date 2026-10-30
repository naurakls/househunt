import { useState } from "react";
import { Table } from "antd";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import EmptyState from "../../components/common/EmptyState";
import TableSkeleton from "../../components/common/TableSkeleton";
import PropertyCell from "../../components/dashboard/PropertyCell";
import UserCell from "../../components/dashboard/UserCell";
import api from "../../api/axios";
import useApi from "../../hooks/useApi";
import { formatDate, formatPrice, priceSuffix } from "../../utils/format";

const PAGE_SIZE = 10;

export default function AdminProperties() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useApi(
    () => api.get("/admin/properties", { params: { page, limit: PAGE_SIZE } }),
    [page]
  );

  const columns = [
    { title: "Properti", key: "property", render: (_, p) => <PropertyCell property={p} /> },
    { title: "Owner", key: "owner", render: (_, p) => <UserCell user={p.ownerId} /> },
    {
      title: "Harga",
      key: "price",
      render: (_, p) => (
        <span className="fw-semibold text-nowrap">
          {formatPrice(p.rentAmount, p.adType)}
          <span className="cell-sub"> {priceSuffix(p.adType)}</span>
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, p) => <StatusBadge status={p.isAvailable ? "available" : p.adType === "sale" ? "sold" : "rented"} />,
    },
    { title: "Dipasang", dataIndex: "createdAt", render: (d) => <span className="text-nowrap">{formatDate(d)}</span> },
  ];

  return (
    <>
      <PageHeader kicker="Admin" title="Semua properti" subtitle="Seluruh listing yang dipasang owner." />
      <div className="hh-panel hh-panel--flush">
        {loading && !data ? (
          <TableSkeleton />
        ) : error ? (
          <EmptyState icon="alert" title="Gagal memuat properti" text={error} />
        ) : (
          <Table
            rowKey="_id"
            columns={columns}
            dataSource={data?.items}
            loading={loading}
            scroll={{ x: 900 }}
            locale={{ emptyText: <EmptyState compact icon="building" title="Belum ada properti" /> }}
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
