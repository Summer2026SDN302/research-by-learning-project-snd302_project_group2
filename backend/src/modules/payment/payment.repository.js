import { toObjectId } from "../../shared/helpers/mongo.helper.js";
import { PAYMENT_TRANSACTION_CODE_LOCKED_STATUSES } from "./payment.constants.js";
import Payment from "./payment.model.js";

const applyListPopulates = (query) =>
  query
    .populate({
      path: "orderId",
      select: "orderNumber staffId",
    })
    .sort({ createdAt: -1 });

const paymentRepository = {
  async create(payload, session) {
    const [payment] = await Payment.create([payload], session ? { session } : {});
    return payment;
  },

  async findById(id, { session = null, populate = true } = {}) {
    const query = populate
      ? applyListPopulates(Payment.findOne({ _id: toObjectId(id) }))
      : Payment.findOne({ _id: toObjectId(id) });

    if (session) {
      query.session(session);
    }

    return query;
  },

  async isTransactionCodeTaken(
    transactionCode,
    {
      excludePaymentId = null,
      paymentStatuses = PAYMENT_TRANSACTION_CODE_LOCKED_STATUSES,
    } = {},
  ) {
    if (!transactionCode) {
      return false;
    }

    const filter = { transactionCode };

    if (Array.isArray(paymentStatuses) && paymentStatuses.length > 0) {
      filter.paymentStatus = { $in: paymentStatuses };
    }

    if (excludePaymentId) {
      filter._id = { $ne: toObjectId(excludePaymentId) };
    }

    const existing = await Payment.findOne(filter).select("_id");
    return Boolean(existing);
  },
  async findAll({
    searchKeyword,
    matchingOrderIds = [],
    paymentStatus,
    paymentMethod,
    startDate,
    endDate,
    page,
    limit,
  }) {
    const filter = {};

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (searchKeyword) {
      const regex = new RegExp(searchKeyword, "i");
      const searchOr = [
        { paymentNumber: regex },
        { transactionCode: regex },
      ];

      if (matchingOrderIds.length > 0) {
        searchOr.push({ orderId: { $in: matchingOrderIds.map(toObjectId) } });
      }

      filter.$or = searchOr;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      applyListPopulates(Payment.find(filter).skip(skip).limit(limit)),
      Payment.countDocuments(filter),
    ]);

    return { items, total };
  },
};

export default paymentRepository;
