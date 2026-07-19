import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/response/responseFormatter.js";
import * as userService from "./user.service.js";

export const getProfile = asyncHandler(async (req, res) => {
  const data = await userService.getProfile(req.userId);
  return successResponse(res, data, "Get profile successfully");
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await userService.updateProfile(req.userId, req.body);
  return successResponse(res, data, "Update profile successfully");
});

export const changeOwnPassword = asyncHandler(async (req, res) => {
  await userService.changeOwnPassword(req.userId, req.body);
  return successResponse(res, null, "Change password successfully");
});

export const getUsers = asyncHandler(async (req, res) => {
  const data = await userService.getUsers(req.query);
  return successResponse(res, data, "Get users successfully");
});

export const getUserById = asyncHandler(async (req, res) => {
  const data = await userService.getUserById(req.params.id);
  return successResponse(res, data, "Get user successfully");
});

export const createUser = asyncHandler(async (req, res) => {
  const data = await userService.createUser(req.body);
  return successResponse(res, data, "Create user successfully", 201);
});

export const updateUser = asyncHandler(async (req, res) => {
  const data = await userService.updateUser(req.params.id, req.body);
  return successResponse(res, data, "Update user successfully");
});

export const disableUser = asyncHandler(async (req, res) => {
  const data = await userService.disableUser(req.params.id, req.userId);
  return successResponse(res, data, "Disable user successfully");
});

export const enableUser = asyncHandler(async (req, res) => {
  const data = await userService.enableUser(req.params.id);
  return successResponse(res, data, "Enable user successfully");
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  await userService.resetUserPassword(req.params.id, req.body, req.userId);
  return successResponse(res, null, "Reset password successfully");
});
