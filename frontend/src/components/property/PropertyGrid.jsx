import { Col, Row } from "react-bootstrap";
import PropertyCard from "./PropertyCard";
import PropertyCardSkeleton from "./PropertyCardSkeleton";
import EmptyState from "../common/EmptyState";

// Grid responsif: 1 kolom di HP, 2 di tablet, 3 di desktop.
// Menangani tiga keadaan: loading (skeleton), kosong (empty state), dan ada data.
export default function PropertyGrid({
  items,
  loading,
  skeletonCount = 6,
  renderFooter,
  emptyTitle = "Belum ada properti",
  emptyText,
  emptyAction,
  colProps = { xs: 12, sm: 6, lg: 4 },
}) {
  if (loading) {
    return (
      <Row className="g-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Col key={i} {...colProps}>
            <PropertyCardSkeleton />
          </Col>
        ))}
      </Row>
    );
  }

  if (!items?.length) {
    return <EmptyState icon="home" title={emptyTitle} text={emptyText} action={emptyAction} />;
  }

  return (
    <Row className="g-4">
      {items.map((property) => (
        <Col key={property._id} {...colProps}>
          <PropertyCard property={property} footer={renderFooter?.(property)} />
        </Col>
      ))}
    </Row>
  );
}
