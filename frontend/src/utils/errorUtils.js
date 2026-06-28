export const getApiErrorMsg = (
  errorMap,
  err,
  fallback = "Co loi xay ra, vui long thu lai.",
) => {
  const code = err?.code || err?.response?.data?.error?.code;

  if (code && errorMap?.[code]) {
    return errorMap[code];
  }

  return err?.message || err?.response?.data?.message || fallback;
};
