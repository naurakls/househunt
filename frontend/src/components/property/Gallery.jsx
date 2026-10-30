import { useState } from "react";
import SafeImage from "../common/SafeImage";

// Galeri foto: foto utama 4:3 + penanda jumlah foto + thumbnail untuk berganti foto
export default function Gallery({ images = [], alt }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [null];

  return (
    <div className="gallery">
      <div className="gallery__main">
        <SafeImage path={list[active]} alt={alt} width={1400} loading="eager" />
        {list.length > 1 && (
          <span className="gallery__count">
            {active + 1} / {list.length}
          </span>
        )}
      </div>
      {list.length > 1 && (
        <div className="gallery__thumbs">
          {list.map((img, i) => (
            <button
              type="button"
              key={img}
              className={`gallery__thumb${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1}`}
            >
              <SafeImage path={img} alt="" width={240} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
