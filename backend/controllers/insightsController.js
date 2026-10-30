// Market insights: ringkasan harga pasar sewa dari seluruh listing
const Property = require("../models/PropertySchema");
const { sendSuccess, handleError } = require("../utils/response");
const { escapeRegex } = require("../utils/validators");

// Rentang harga sewa per bulan untuk grafik sebaran
const PRICE_BUCKETS = [0, 1000000, 2000000, 5000000, 10000000, 1e12];

// GET /api/users/insights?city=Bandung
// Hanya listing "disewakan" yang dihitung di statistik harga (harga jual tidak dicampur).
const getInsights = async (req, res) => {
  try {
    const cityFilter = req.query.city?.trim()
      ? { city: { $regex: `^${escapeRegex(req.query.city.trim())}$`, $options: "i" } }
      : {};
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // $facet: beberapa perhitungan sekaligus dalam satu query ke database
    const [result] = await Property.aggregate([
      { $match: { adType: "rent", ...cityFilter } },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                average: { $avg: "$rentAmount" },
                median: { $median: { input: "$rentAmount", method: "approximate" } },
                available: { $sum: { $cond: ["$isAvailable", 1, 0] } },
                newThisMonth: { $sum: { $cond: [{ $gte: ["$createdAt", monthAgo] }, 1, 0] } },
              },
            },
          ],
          byCity: [
            {
              $group: {
                _id: "$city",
                count: { $sum: 1 },
                average: { $avg: "$rentAmount" },
                min: { $min: "$rentAmount" },
                max: { $max: "$rentAmount" },
                available: { $sum: { $cond: ["$isAvailable", 1, 0] } },
              },
            },
            { $sort: { average: -1 } },
          ],
          byType: [
            {
              $group: {
                _id: "$propertyType",
                count: { $sum: 1 },
                average: { $avg: "$rentAmount" },
                min: { $min: "$rentAmount" },
                max: { $max: "$rentAmount" },
                // harga per m² hanya dari listing yang mengisi luas bangunan
                perM2: { $avg: { $cond: [{ $gt: ["$area", 0] }, { $divide: ["$rentAmount", "$area"] }, null] } },
              },
            },
            { $sort: { average: -1 } },
          ],
          distribution: [
            { $bucket: { groupBy: "$rentAmount", boundaries: PRICE_BUCKETS, default: "other", output: { count: { $sum: 1 } } } },
          ],
          amenities: [
            { $unwind: "$amenities" },
            { $group: { _id: "$amenities", count: { $sum: 1 } } },
            { $sort: { count: -1, _id: 1 } },
            { $limit: 8 },
          ],
        },
      },
    ]);

    const summary = result.summary[0] || { count: 0, average: 0, median: 0, available: 0, newThisMonth: 0 };
    const round = (n) => (n == null ? null : Math.round(n));
    const mapGroup = (key) => (g) => ({
      [key]: g._id,
      count: g.count,
      average: round(g.average),
      min: g.min,
      max: g.max,
      ...(g.available !== undefined && { available: g.available }),
      ...(g.perM2 !== undefined && { perM2: round(g.perM2) }),
    });

    return sendSuccess(res, "Market insights", {
      summary: {
        count: summary.count,
        average: round(summary.average),
        median: round(summary.median),
        availableRate: summary.count ? Math.round((summary.available / summary.count) * 100) : 0,
        newThisMonth: summary.newThisMonth,
      },
      byCity: result.byCity.map(mapGroup("city")),
      byType: result.byType.map(mapGroup("type")),
      // Semua rentang selalu dikirim (yang kosong bernilai 0) agar grafik konsisten
      distribution: PRICE_BUCKETS.slice(0, -1).map((from, i) => ({
        from,
        to: PRICE_BUCKETS[i + 1] === 1e12 ? null : PRICE_BUCKETS[i + 1],
        count: result.distribution.find((b) => b._id === from)?.count || 0,
      })),
      amenities: result.amenities.map((a) => ({
        name: a._id,
        count: a.count,
        share: summary.count ? Math.round((a.count / summary.count) * 100) : 0,
      })),
    });
  } catch (error) {
    return handleError(res, error, "Gagal mengambil data pasar");
  }
};

module.exports = { getInsights };
