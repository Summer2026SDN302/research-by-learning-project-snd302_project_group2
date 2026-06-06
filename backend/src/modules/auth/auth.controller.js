import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import * as authService from "./auth.service.js";

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body, res);
  return successResponse(res, data, "Login successfully");
});

export const refreshToken = asyncHandler(async (req, res) => {
  const data = await authService.refresh(req, res);
  return successResponse(res, data, "Refresh token successfully");
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req, res);
  return successResponse(res, null, "Logout successfully");
});
