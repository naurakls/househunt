// Fitur pesan: percakapan renter <-> owner untuk setiap properti.
// Satu "percakapan" = kombinasi (properti, owner properti, satu renter).
const mongoose = require("mongoose");
const Message = require("../models/MessageSchema");
const Property = require("../models/PropertySchema");
const User = require("../models/UserSchema");
const { sendSuccess, sendError, handleError } = require("../utils/response");
const { isObjectId } = require("../utils/validators");

// Menentukan lawan bicara user pada sebuah properti.
// Renter -> lawannya selalu owner properti. Owner -> wajib menyebut renter (withUser).
const resolveOtherUser = (property, me, withUser) => {
  if (property.ownerId.equals(me._id)) {
    if (!isObjectId(withUser)) return { error: "Parameter withUser (id renter) wajib diisi" };
    if (withUser === me._id.toString()) return { error: "Tidak bisa mengirim pesan ke diri sendiri" };
    return { otherId: new mongoose.Types.ObjectId(withUser), isOwner: true };
  }
  if (me.type !== "renter") return { error: "Hanya renter yang bisa bertanya tentang properti ini" };
  return { otherId: property.ownerId, isOwner: false };
};

// POST /api/messages  body: { propertyId, text, receiverId? (wajib jika pengirim = owner) }
const sendMessage = async (req, res) => {
  try {
    const { propertyId, receiverId, text } = req.body || {};
    if (!isObjectId(propertyId)) return sendError(res, "propertyId tidak valid", 400);
    if (!text || !text.trim()) return sendError(res, "Pesan tidak boleh kosong", 400);
    if (text.trim().length > 1000) return sendError(res, "Pesan maksimal 1000 karakter", 400);

    const property = await Property.findById(propertyId).select("ownerId");
    if (!property) return sendError(res, "Properti tidak ditemukan", 404);

    const { error, otherId, isOwner } = resolveOtherUser(property, req.user, receiverId);
    if (error) return sendError(res, error, 400);

    // Owner hanya bisa membalas renter yang sudah lebih dulu bertanya (anti-spam)
    if (isOwner) {
      const hasAsked = await Message.exists({ propertyId, senderId: otherId, receiverId: req.user._id });
      if (!hasAsked) return sendError(res, "Kamu hanya bisa membalas renter yang sudah bertanya", 403);
    }

    const message = await Message.create({
      propertyId,
      senderId: req.user._id,
      receiverId: otherId,
      text: text.trim(),
    });
    return sendSuccess(res, "Pesan terkirim", message, 201);
  } catch (error) {
    return handleError(res, error, "Gagal mengirim pesan");
  }
};

// GET /api/messages/property/:propertyId?withUser=<id renter, khusus owner>
const getConversation = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId)
      .select("ownerId address city propertyType rentAmount images")
      .lean();
    if (!property) return sendError(res, "Properti tidak ditemukan", 404);

    // lean() menghasilkan ObjectId biasa, .equals tetap tersedia
    const { error, otherId } = resolveOtherUser(property, req.user, req.query.withUser);
    if (error) return sendError(res, error, 400);

    const me = req.user._id;
    const [messages, otherUser] = await Promise.all([
      Message.find({
        propertyId: property._id,
        $or: [
          { senderId: me, receiverId: otherId },
          { senderId: otherId, receiverId: me },
        ],
      })
        .sort({ createdAt: 1 }) // urut dari yang paling lama, seperti aplikasi chat
        .lean(),
      User.findById(otherId).select("name type").lean(),
    ]);

    if (!otherUser) return sendError(res, "Lawan bicara tidak ditemukan", 404);
    return sendSuccess(res, "Percakapan", { property, otherUser, messages });
  } catch (error) {
    return handleError(res, error, "Gagal mengambil percakapan");
  }
};

// GET /api/messages/conversations -> daftar percakapan milik user + pesan terakhir + jumlah belum dibaca
const getConversations = async (req, res) => {
  try {
    const me = req.user._id;

    // Aggregation pipeline: kelompokkan pesan per (properti, lawan bicara)
    const conversations = await Message.aggregate([
      { $match: { $or: [{ senderId: me }, { receiverId: me }] } },
      { $sort: { createdAt: -1 } },
      { $addFields: { otherUser: { $cond: [{ $eq: ["$senderId", me] }, "$receiverId", "$senderId"] } } },
      {
        $group: {
          _id: { propertyId: "$propertyId", otherUser: "$otherUser" },
          lastMessage: { $first: "$$ROOT" }, // sudah diurutkan, jadi $first = pesan terbaru
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ["$receiverId", me] }, { $eq: ["$isRead", false] }] }, 1, 0] },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      {
        $lookup: {
          from: "properties",
          localField: "_id.propertyId",
          foreignField: "_id",
          as: "property",
          pipeline: [{ $project: { address: 1, city: 1, propertyType: 1, images: { $slice: ["$images", 1] } } }],
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.otherUser",
          foreignField: "_id",
          as: "otherUser",
          pipeline: [{ $project: { name: 1, type: 1 } }],
        },
      },
      { $unwind: "$property" },
      { $unwind: "$otherUser" },
      {
        $project: {
          _id: 0,
          property: 1,
          otherUser: 1,
          unreadCount: 1,
          lastMessage: {
            text: "$lastMessage.text",
            senderId: "$lastMessage.senderId",
            isRead: "$lastMessage.isRead",
            createdAt: "$lastMessage.createdAt",
          },
        },
      },
    ]);

    return sendSuccess(res, "Daftar percakapan", conversations);
  } catch (error) {
    return handleError(res, error, "Gagal mengambil daftar percakapan");
  }
};

// GET /api/messages/unread-count -> angka badge notifikasi di navbar
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.user._id, isRead: false });
    return sendSuccess(res, "Jumlah pesan belum dibaca", { count });
  } catch (error) {
    return handleError(res, error, "Gagal menghitung pesan");
  }
};

// PATCH /api/messages/property/:propertyId/read  body: { withUser? }
// Menandai pesan yang DITERIMA user pada properti ini sebagai sudah dibaca
const markAsRead = async (req, res) => {
  try {
    if (!isObjectId(req.params.propertyId)) return sendError(res, "propertyId tidak valid", 400);

    const { withUser } = req.body || {};
    const filter = { propertyId: req.params.propertyId, receiverId: req.user._id, isRead: false };
    if (isObjectId(withUser)) filter.senderId = withUser;

    const result = await Message.updateMany(filter, { isRead: true });
    return sendSuccess(res, "Pesan ditandai sudah dibaca", { updated: result.modifiedCount });
  } catch (error) {
    return handleError(res, error, "Gagal menandai pesan");
  }
};

module.exports = { sendMessage, getConversation, getConversations, getUnreadCount, markAsRead };
