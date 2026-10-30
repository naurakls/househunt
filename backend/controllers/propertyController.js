// Fitur publik/renter: mencari, memfilter, dan melihat detail properti
const Property = require("../models/PropertySchema");
const { sendSuccess, sendError, handleError } = require("../utils/response");
const {
  escapeRegex,
  parseList,
  toBoolean,
  getPagination,
  buildPaginationMeta,
} = require("../utils/validators");

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { rentAmount: 1, createdAt: -1 },
  price_desc: { rentAmount: -1, createdAt: -1 },
};

// GET /api/users/properties?city=&minRent=&maxRent=&propertyType=&amenities=&page=&limit=
const getProperties = async (req, res) => {
  try {
    const { city, minRent, maxRent, propertyType, amenities, adType, available, sort, minBedrooms } = req.query;
    const filter = {};

    // Kota: cocok dari awal kata, tidak peka huruf besar/kecil ("jak" -> "Jakarta")
    if (city && city.trim()) {
      filter.city = { $regex: `^${escapeRegex(city.trim())}`, $options: "i" };
    }

    // Rentang harga
    const min = minRent ? Number(minRent) : NaN;
    const max = maxRent ? Number(maxRent) : NaN;
    if (!Number.isNaN(min) && !Number.isNaN(max) && min > max) {
      return sendError(res, "Harga minimum tidak boleh lebih besar dari maksimum", 400);
    }
    if (!Number.isNaN(min) || !Number.isNaN(max)) {
      filter.rentAmount = {};
      if (!Number.isNaN(min)) filter.rentAmount.$gte = min;
      if (!Number.isNaN(max)) filter.rentAmount.$lte = max;
    }

    // Tipe properti bisa lebih dari satu: ?propertyType=rumah,kos
    const types = parseList(propertyType).filter((t) => Property.PROPERTY_TYPES.includes(t));
    if (types.length) filter.propertyType = { $in: types };

    // Fasilitas: properti harus punya SEMUA fasilitas yang dipilih ($all)
    const amenityList = parseList(amenities);
    if (amenityList.length) filter.amenities = { $all: amenityList };

    if (Property.AD_TYPES.includes(adType)) filter.adType = adType;
    if (toBoolean(available)) filter.isAvailable = true;

    // Minimal jumlah kamar tidur: ?minBedrooms=2
    const beds = parseInt(minBedrooms, 10);
    if (beds > 0) filter.bedrooms = { $gte: beds };

    // Pagination: hanya mengambil satu halaman data, bukan semuanya
    const { page, limit, skip } = getPagination(req.query);
    const [items, total] = await Promise.all([
      Property.find(filter)
        .sort(SORT_OPTIONS[sort] || SORT_OPTIONS.newest)
        .skip(skip)
        .limit(limit)
        .lean(), // lean() = objek JS biasa, lebih ringan untuk data read-only
      Property.countDocuments(filter),
    ]);

    return sendSuccess(res, "Daftar properti", {
      items,
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    return handleError(res, error, "Gagal mengambil daftar properti");
  }
};

// Market insight di halaman detail: bandingkan harga properti dengan rata-rata
// properti sejenis (tipe sama, disewakan) di kota yang sama. Jika di kota itu belum ada
// pembanding, dipakai rata-rata nasional untuk tipe tersebut.
const compareWithMarket = async (property) => {
  if (property.adType !== "rent") return null;
  const base = { _id: { $ne: property._id }, propertyType: property.propertyType, adType: "rent" };
  const averageOf = async (match) => {
    const [row] = await Property.aggregate([
      { $match: match },
      { $group: { _id: null, avg: { $avg: "$rentAmount" }, count: { $sum: 1 } } },
    ]);
    return row;
  };

  const cityRow = await averageOf({ ...base, city: property.city });
  const row = cityRow || (await averageOf(base));
  if (!row) return null;

  return {
    scope: cityRow ? "city" : "national",
    average: Math.round(row.avg),
    count: row.count,
    // positif = lebih mahal dari rata-rata, negatif = lebih murah
    diffPercent: Math.round(((property.rentAmount - row.avg) / row.avg) * 100),
  };
};

// GET /api/users/properties/:id
const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("ownerId", "name phone") // hanya field aman dari data owner
      .lean();
    if (!property) return sendError(res, "Properti tidak ditemukan", 404);
    property.market = await compareWithMarket(property);
    return sendSuccess(res, "Detail properti", property);
  } catch (error) {
    return handleError(res, error, "Gagal mengambil detail properti");
  }
};

// GET /api/users/cities -> jumlah properti per kota (untuk bagian "Jelajahi per kota" di beranda)
const getCities = async (req, res) => {
  try {
    const cities = await Property.aggregate([
      {
        $group: {
          _id: "$city",
          total: { $sum: 1 },
          available: { $sum: { $cond: ["$isAvailable", 1, 0] } },
          image: { $first: { $arrayElemAt: ["$images", 0] } },
        },
      },
      { $sort: { total: -1, _id: 1 } },
      { $project: { _id: 0, city: "$_id", total: 1, available: 1, image: 1 } },
    ]);
    return sendSuccess(res, "Daftar kota", cities);
  } catch (error) {
    return handleError(res, error, "Gagal mengambil daftar kota");
  }
};

module.exports = { getProperties, getPropertyById, getCities };
