const normalizeAuditText = (value) => {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
};

export const createPaymentAuditEvent = ({
  eventType,
  actorId = null,
  note = null,
  metadata = null,
  occurredAt = new Date(),
}) => ({
  eventType,
  actorId,
  note: normalizeAuditText(note),
  metadata: metadata ?? null,
  occurredAt,
});
