import PageHeader from "../components/common/PageHeader";
import MessagesPanel from "../components/chat/MessagesPanel";

// Tab "Pesan" di dalam dashboard renter & owner (memakai panel yang sama dengan /messages)
export default function DashboardMessages() {
  return (
    <>
      <PageHeader kicker="Kotak masuk" title="Pesan" subtitle="Balas pertanyaan dan lanjutkan percakapan per properti." />
      <MessagesPanel />
    </>
  );
}
