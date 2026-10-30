// Kumpulan helper validasi input yang dipakai banyak controller

const isEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Nomor HP: boleh diawali +, 9-15 digit (spasi dan tanda - diabaikan)
const isPhone = (value) =>
  typeof value === "string" && /^\+?[0-9]{9,15}$/.test(value.replace(/[\s-]/g, ""));

const isObjectId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

// Escape karakter spesial regex agar input user tidak bisa merusak query
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Menerima array, string JSON '["a","b"]', atau string "a,b" -> ["a", "b"]
// (form multipart mengirim array dalam berbagai bentuk)
const parseList = (value) => {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.flatMap(parseList);
  if (typeof value !== "string") return [String(value)];

  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    try {
      return parseList(JSON.parse(trimmed));
    } catch {
      return [];
    }
  }
  return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
};

const toBoolean = (value) => value === true || value === "true" || value === "1";

// Pagination aman: page minimal 1, limit dibatasi maksimal 50
const getPagination = (query, defaultLimit = 9) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

const buildPaginationMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

module.exports = {
  isEmail,
  isPhone,
  isObjectId,
  escapeRegex,
  parseList,
  toBoolean,
  getPagination,
  buildPaginationMeta,
};
