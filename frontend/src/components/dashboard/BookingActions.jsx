import { useState } from "react";
import { Button } from "react-bootstrap";
import { Popconfirm } from "antd";
import Icon from "../common/Icon";
import api, { getErrorMessage } from "../../api/axios";
import useNotify from "../../hooks/useNotify";

// Tombol Setujui / Tolak / Batalkan untuk booking (dipakai owner), dengan konfirmasi Popconfirm
export default function BookingActions({ booking, onChanged }) {
  const notify = useNotify();
  const [busy, setBusy] = useState(false);

  const update = async (status) => {
    setBusy(true);
    try {
      const { data } = await api.patch(`/owner/bookings/${booking._id}/status`, { status });
      notify.success(data.message);
      onChanged?.();
    } catch (err) {
      notify.error(getErrorMessage(err, "Gagal memperbarui booking"));
    } finally {
      setBusy(false);
    }
  };

  if (booking.bookingStatus === "rejected") return <span className="cell-sub">Tidak ada aksi</span>;

  if (booking.bookingStatus === "booked") {
    return (
      <Popconfirm
        title="Batalkan booking ini?"
        description="Properti akan kembali berstatus tersedia."
        okText="Ya, batalkan"
        cancelText="Tidak"
        okButtonProps={{ danger: true }}
        onConfirm={() => update("rejected")}
      >
        <Button variant="outline-danger" size="sm" disabled={busy}>Batalkan</Button>
      </Popconfirm>
    );
  }

  return (
    <div className="actions">
      <Popconfirm
        title="Setujui booking ini?"
        description="Booking lain yang masih menunggu untuk properti ini akan otomatis ditolak."
        okText="Setujui"
        cancelText="Batal"
        onConfirm={() => update("booked")}
      >
        <Button size="sm" disabled={busy}><Icon name="check" size={15} /> Setujui</Button>
      </Popconfirm>
      <Popconfirm
        title="Tolak booking ini?"
        okText="Tolak"
        cancelText="Batal"
        okButtonProps={{ danger: true }}
        onConfirm={() => update("rejected")}
      >
        <Button variant="outline-danger" size="sm" disabled={busy}><Icon name="x" size={15} /> Tolak</Button>
      </Popconfirm>
    </div>
  );
}
