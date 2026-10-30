import { useState } from "react";
import { Button } from "react-bootstrap";
import { Popconfirm } from "antd";
import Icon from "../common/Icon";
import api, { getErrorMessage } from "../../api/axios";
import useNotify from "../../hooks/useNotify";

// Tombol admin untuk menyetujui / menolak akun owner
export default function OwnerApprovalActions({ owner, onChanged }) {
  const notify = useNotify();
  const [busy, setBusy] = useState(false);

  const setStatus = async (action) => {
    setBusy(true);
    try {
      const { data } = await api.patch(`/admin/owners/${owner._id}/${action}`);
      notify.success(data.message);
      onChanged?.();
    } catch (err) {
      notify.error(getErrorMessage(err, "Gagal memperbarui status owner"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="actions">
      {owner.granted !== "granted" && (
        <Button size="sm" disabled={busy} onClick={() => setStatus("approve")}>
          <Icon name="check" size={15} /> Setujui
        </Button>
      )}
      {owner.granted !== "rejected" && (
        <Popconfirm
          title={`Tolak ${owner.name}?`}
          description="Owner tidak akan bisa memasang properti."
          okText="Tolak"
          cancelText="Batal"
          okButtonProps={{ danger: true }}
          onConfirm={() => setStatus("reject")}
        >
          <Button variant="outline-danger" size="sm" disabled={busy}>
            <Icon name="x" size={15} /> Tolak
          </Button>
        </Popconfirm>
      )}
    </div>
  );
}
