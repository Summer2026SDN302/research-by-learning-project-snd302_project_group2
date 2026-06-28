import { toObjectId } from "../../shared/helpers/mongo.helper.js";
import Invoice from "./invoice.model.js";

const applyDefaultPopulates = (query) =>
  query
    .populate("staffId", "username fullName role")
    .populate("lastPrintedBy", "username fullName role");

const invoiceRepository = {
  async create(payload, session) {
    const [invoice] = await Invoice.create([payload], session ? { session } : {});
    return invoice;
  },

  async findById(id, { session = null } = {}) {
    const query = applyDefaultPopulates(
      Invoice.findOne({ _id: toObjectId(id) }),
    );

    if (session) {
      query.session(session);
    }

    return query;
  },

  async updatePrintAudit(id, printedBy, session = null) {
    return applyDefaultPopulates(
      Invoice.findOneAndUpdate(
        { _id: toObjectId(id) },
        {
          $inc: { printCount: 1 },
          $set: {
            lastPrintedAt: new Date(),
            lastPrintedBy: toObjectId(printedBy),
          },
        },
        { new: true, runValidators: true, session },
      ),
    );
  },
};

export default invoiceRepository;
