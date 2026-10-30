import { imageUrl, PLACEHOLDER_IMAGE } from "../../utils/format";

// <img> untuk foto properti: path backend / URL Unsplash -> URL lengkap, dan placeholder jika gagal dimuat.
// width = lebar gambar yang diminta (khusus Unsplash), sesuaikan dengan ukuran tampilnya.
export default function SafeImage({ path, alt = "", width = 800, ...props }) {
  return (
    <img
      src={imageUrl(path, width)}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        if (e.currentTarget.src !== PLACEHOLDER_IMAGE) e.currentTarget.src = PLACEHOLDER_IMAGE;
      }}
      {...props}
    />
  );
}
