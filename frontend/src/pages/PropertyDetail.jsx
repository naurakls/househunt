import { useCallback, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import Icon from "../components/common/Icon";
import EmptyState from "../components/common/EmptyState";
import Gallery from "../components/property/Gallery";
import BookingCard from "../components/property/BookingCard";
import MarketBox from "../components/property/MarketBox";
import api from "../api/axios";
import useApi from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { formatDate, fromNow, propertyTitle, typeLabel, youtubeId } from "../utils/format";

function DetailSkeleton() {
  return (
    <Row className="g-5">
      <Col lg={7}>
        <Skeleton variant="rounded" sx={{ width: "100%", height: "auto", aspectRatio: "4 / 3" }} />
        <Skeleton variant="text" width="60%" height={60} sx={{ mt: 3 }} />
        <Skeleton variant="text" width="40%" />
      </Col>
      <Col lg={5}>
        <Skeleton variant="rounded" height={380} />
      </Col>
    </Row>
  );
}

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: property, loading, error } = useApi(() => api.get(`/users/properties/${id}`), [id]);
  const [myBooking, setMyBooking] = useState(null);

  // Renter: cek apakah sudah pernah booking properti ini (pending / disetujui)
  const loadMyBooking = useCallback(async () => {
    if (user?.type !== "renter") return;
    try {
      const { data } = await api.get("/users/bookings");
      setMyBooking(
        data.data.find((b) => b.propertyId?._id === id && ["pending", "booked"].includes(b.bookingStatus)) || null
      );
    } catch {
      /* tidak fatal */
    }
  }, [id, user?.type]);

  useEffect(() => {
    loadMyBooking();
  }, [loadMyBooking]);

  return (
    <Container className="py-4 py-lg-5">
      <Link to="/properties" className="back-link">
        <Icon name="arrowLeft" size={18} /> Kembali ke daftar
      </Link>

      {loading && <DetailSkeleton />}

      {!loading && error && (
        <EmptyState
          icon="home"
          title="Properti tidak ditemukan"
          text="Mungkin properti ini sudah dihapus pemiliknya."
          action={<Link to="/properties" className="btn btn-primary">Cari properti lain</Link>}
        />
      )}

      {!loading && property && (
        <Row className="g-4 g-lg-5">
          <Col lg={7}>
            <Gallery images={property.images} alt={propertyTitle(property)} />

            <div className="pt-4 pb-3">
              <h1 className="detail-title">{propertyTitle(property)}</h1>
              <p className="detail-address mb-0">
                <Icon name="mapPin" size={18} /> {property.address}, {property.city}
              </p>

              {/* Spesifikasi utama */}
              <ul className="detail-specs">
                <li><span>Kamar tidur</span><strong><Icon name="bed" size={18} /> {property.bedrooms ?? "-"}</strong></li>
                <li><span>Kamar mandi</span><strong><Icon name="bath" size={18} /> {property.bathrooms ?? "-"}</strong></li>
                <li><span>Luas bangunan</span><strong><Icon name="area" size={18} /> {property.area ? `${property.area} m²` : "-"}</strong></li>
                <li><span>Tipe</span><strong><Icon name="home" size={18} /> {typeLabel(property.propertyType)}</strong></li>
              </ul>
            </div>

            {/* Virtual tour: video YouTube dari pemilik */}
            {youtubeId(property.tourUrl) && (
              <div className="detail-section" id="video-tour">
                <h2>Video tour</h2>
                <div className="tour-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId(property.tourUrl)}`}
                    title={`Video tour ${propertyTitle(property)}`}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {property.amenities.length > 0 && (
              <div className="detail-section">
                <h2>Fasilitas</h2>
                <div className="chip-row">
                  {property.amenities.map((item) => (
                    <span className="chip chip--check" key={item}>
                      <Icon name="check" size={14} strokeWidth={2.2} /> {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h2>Tentang properti ini</h2>
              <p className="mb-0">{property.description || "Pemilik belum menambahkan deskripsi."}</p>
            </div>

            <div className="detail-section">
              <dl className="facts mb-0">
                <div><dt>Jenis iklan</dt><dd>{property.adType === "sale" ? "Dijual" : "Disewakan"}</dd></div>
                <div><dt>Kota</dt><dd>{property.city}</dd></div>
                <div><dt>Dipasang</dt><dd title={formatDate(property.createdAt)}>{fromNow(property.createdAt)}</dd></div>
                <div><dt>Diperbarui</dt><dd>{formatDate(property.updatedAt)}</dd></div>
              </dl>
            </div>
          </Col>

          <Col lg={5}>
            <div className="detail-aside">
              <BookingCard property={property} myBooking={myBooking} onBooked={setMyBooking} />
              <MarketBox property={property} />
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}
