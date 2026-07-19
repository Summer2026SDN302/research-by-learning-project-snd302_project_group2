import asyncHandler from "../../shared/helpers/asyncHandler.js";
import {
  getRefreshTokenFromRequest,
  setAuthCookies,
  clearAuthCookies,
} from "../../shared/helpers/token.helper.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import * as authService from "./auth.service.js";

const toAuthResponseBody = ({ user, accessToken }) => {
  return {
    user,
    accessToken,
  };
};

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);

  setAuthCookies(res, data.accessToken, data.refreshToken);

  return successResponse(res, toAuthResponseBody(data), "Login successfully");
});

export const refreshToken = asyncHandler(async (req, res) => {
  const currentRefreshToken = getRefreshTokenFromRequest(req);
  const data = await authService.refresh(currentRefreshToken);

  setAuthCookies(res, data.accessToken, data.refreshToken);

  return successResponse(
    res,
    toAuthResponseBody(data),
    "Refresh token successfully",
  );
});

export const logout = asyncHandler(async (req, res) => {
  const currentRefreshToken = getRefreshTokenFromRequest(req);

  await authService.logout(currentRefreshToken);

  clearAuthCookies(res);

  return successResponse(res, null, "Logout successfully");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);

  return successResponse(
    res,
    null,
    "If the email exists, a reset OTP has been sent",
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);

  return successResponse(res, null, "Password reset successfully");
});