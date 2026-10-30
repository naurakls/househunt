// Validasi form di sisi frontend (aturannya sama dengan backend)
export const isEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export const isPhone = (value = "") => /^\+?[0-9]{9,15}$/.test(value.replace(/[\s-]/g, ""));

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
export const MAX_IMAGES = 6;

// Mengembalikan pesan error untuk file yang tidak valid, atau null jika aman
export const validateImageFile = (file) => {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name}: format harus JPG, PNG, atau WEBP`;
  if (file.size > MAX_IMAGE_SIZE) return `${file.name}: ukuran maksimal 2 MB`;
  return null;
};
