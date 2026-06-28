import AppError from "../../shared/exceptions/AppError.js";
import { withTransaction } from "../../shared/helpers/transaction.helper.js";
import { USER_ROLES } from "../user/user.constants.js";
import paymentRepository from "../payment/payment.repository.js";
import { PAYMENT_AUDIT_EVENT } from "../payment/payment.constants.js";
import { createPaymentAuditEvent } from "../payment/payment.audit.js";
import {
  toInvoiceReceiptResponse,
  toInvoiceResponse,
} from "./invoice.dto.js";
import invoiceRepository from "./invoice.repository.js";

const normalizeEntityId = (entity) => {
  if (!entity) {
    return null;
  }

  if (typeof entity === "string") {
    return entity;
  }

  if (entity._id) {
    return entity._id.toString();
  }

  return entity.toString();
};

const getInvoiceOrThrow = async (id) => {
  const invoice = await invoiceRepository.findById(id);

  if (!invoice) {
    throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
  }

  return invoice;
};

const assertInvoiceAccess = (invoice, requestingUserId, requestingRole) => {
  if (
    requestingRole === USER_ROLES.STAFF &&
    normalizeEntityId(invoice.staffId) !== requestingUserId
  ) {
    throw new AppError(
      "You do not have permission to access this invoice",
      403,
      "INSUFFICIENT_PERMISSIONS",
    );
  }
};

const invoiceService = {
  async getInvoiceById(id, requestingUserId, requestingRole) {
    const invoice = await getInvoiceOrThrow(id);
    assertInvoiceAccess(invoice, requestingUserId, requestingRole);
    return toInvoiceResponse(invoice);
  },

  async getInvoiceReceipt(id, requestingUserId, requestingRole) {
    const invoice = await getInvoiceOrThrow(id);
    assertInvoiceAccess(invoice, requestingUserId, requestingRole);
    return toInvoiceReceiptResponse(invoice);
  },

  async printInvoiceReceipt(id, requestingUserId, requestingRole) {
    const invoice = await getInvoiceOrThrow(id);
    assertInvoiceAccess(invoice, requestingUserId, requestingRole);

    const updatedInvoice = await withTransaction(async (session) => {
      const nextInvoice = await invoiceRepository.updatePrintAudit(
        invoice._id,
        requestingUserId,
        session,
      );

      if (invoice.paymentId) {
        await paymentRepository.appendAuditEvents(
          invoice.paymentId,
          [
            createPaymentAuditEvent({
              eventType: PAYMENT_AUDIT_EVENT.RECEIPT_PRINTED,
              actorId: requestingUserId,
              note: `Receipt printed for ${invoice.invoiceNumber}`,
              metadata: {
                invoiceId: invoice._id.toString(),
                invoiceNumber: invoice.invoiceNumber,
                printCount: nextInvoice.printCount,
              },
              occurredAt: nextInvoice.lastPrintedAt ?? new Date(),
            }),
          ],
          session,
        );
      }

      return nextInvoice;
    });

    return toInvoiceReceiptResponse(updatedInvoice);
  },
};

export default invoiceService;
