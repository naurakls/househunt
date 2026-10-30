import { useState } from "react";
import { Button } from "react-bootstrap";
import { Popconfirm } from "antd";
import PageHeader from "../../components/common/PageHeader";
import Icon from "../../components/common/Icon";
import EmptyState from "../../components/common/EmptyState";
import PropertyGrid from "../../components/property/PropertyGrid";
import PropertyFormModal from "../../components/owner/PropertyFormModal";
import api, { getErrorMessage } from "../../api/axios";
import useApi from "../../hooks/useApi";
import useNotify from "../../hooks/useNotify";
import { fromNow } from "../../utils/format";

export default function OwnerProperties() {
  const notify = useNotify();
  const { data, loading, error, reload } = useApi(() => api.get("/owner/properties"), []);
  const [modal, setModal] = useState({ open: false, property: null });

  const openCreate = () => setModal({ open: true, property: null });
  const openEdit = (property) => setModal({ open: true, property });

  const remove = async (property) => {
    try {
      const { data: res } = await api.delete(`/owner/properties/${property._id}`);
      notify.success(res.message);
      reload({ silent: true });
    } catch (err) {
      notify.error(getErrorMessage(err, "Gagal menghapus properti"));
    }
  };

  return (
    <>
      <PageHeader
        kicker="Kelola"
        title="Properti saya"
        subtitle="Tambah, ubah, atau hapus listing kamu."
        actions={<Button variant="accent" onClick={openCreate}><Icon name="plus" size={18} /> Tambah properti</Button>}
      />

      {error ? (
        <EmptyState icon="alert" title="Gagal memuat properti" text={error} />
      ) : (
        <PropertyGrid
          items={data}
          loading={loading && !data}
          skeletonCount={3}
          colProps={{ xs: 12, md: 6, xl: 4 }}
          emptyTitle="Belum ada properti"
          emptyText="Pasang properti pertamamu. Lengkapi foto dan fasilitas supaya calon penyewa tertarik."
          emptyAction={<Button variant="accent" onClick={openCreate}><Icon name="plus" size={18} /> Tambah properti</Button>}
          renderFooter={(property) => (
            <>
              <span className="cell-sub">Diperbarui {fromNow(property.updatedAt)}</span>
              <div className="actions">
                <Button variant="outline-primary" size="sm" onClick={() => openEdit(property)} aria-label="Edit">
                  <Icon name="edit" size={15} /> Edit
                </Button>
                <Popconfirm
                  title="Hapus properti ini?"
                  description="Booking dan pesan terkait juga ikut terhapus."
                  okText="Hapus"
                  cancelText="Batal"
                  okButtonProps={{ danger: true }}
                  onConfirm={() => remove(property)}
                >
                  <Button variant="outline-danger" size="sm" aria-label="Hapus">
                    <Icon name="trash" size={15} />
                  </Button>
                </Popconfirm>
              </div>
            </>
          )}
        />
      )}

      <PropertyFormModal
        open={modal.open}
        property={modal.property}
        onClose={() => setModal({ open: false, property: null })}
        onSaved={() => reload({ silent: true })}
      />
    </>
  );
}
