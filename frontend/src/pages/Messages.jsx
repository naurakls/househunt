import { Container } from "react-bootstrap";
import PageHeader from "../components/common/PageHeader";
import MessagesPanel from "../components/chat/MessagesPanel";

// Halaman pesan mandiri (/messages), dibuka dari navbar atau tombol "Tanya Owner"
export default function Messages() {
  return (
    <Container className="py-4 py-lg-5">
      <PageHeader kicker="Kotak masuk" title="Pesan" subtitle="Percakapan kamu dikelompokkan per properti." />
      <MessagesPanel />
    </Container>
  );
}
