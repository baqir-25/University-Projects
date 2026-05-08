const ApiResponse = require("../utils/ApiResponse");
const { AdminService, parseDisabledPatch, parseCascadeFlag } = require("../services/AdminService");

const adminService = new AdminService();

function statusForError(message) {
  if (typeof message !== "string" || message.length === 0) {
    return 500;
  }
  if (
    message === "player not found" ||
    message === "owner not found" ||
    message === "arena not found" ||
    message === "court not found"
  ) {
    return 404;
  }
  if (
    message.startsWith("Invalid ") ||
    message.includes("required") ||
    message.includes("must be")
  ) {
    return 400;
  }
  return 500;
}

class AdminController {
  async listUsers(req, res) {
    try {
      const result = await adminService.listUsers({
        role: "player",
        q: req.query.q,
        status: req.query.status,
        page: req.query.page,
        limit: req.query.limit,
      });
      return ApiResponse.success(res, {
        message: "Users fetched successfully",
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async patchUser(req, res) {
    try {
      const disabled = parseDisabledPatch(req.body);
      const user = await adminService.patchUserDisabled(req.params.userId, disabled, "player");
      return ApiResponse.success(res, {
        message: "User updated successfully",
        data: user,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const result = await adminService.deletePlayerUser(req.params.userId);
      return ApiResponse.success(res, {
        message: "User removed successfully",
        data: result,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async listOwners(req, res) {
    try {
      const result = await adminService.listUsers({
        role: "owner",
        q: req.query.q,
        status: req.query.status,
        page: req.query.page,
        limit: req.query.limit,
      });
      return ApiResponse.success(res, {
        message: "Owners fetched successfully",
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async patchOwner(req, res) {
    try {
      const disabled = parseDisabledPatch(req.body);
      const cascade = parseCascadeFlag(req.body);
      const result = await adminService.patchOwnerDisabled(req.params.ownerId, disabled, cascade);
      return ApiResponse.success(res, {
        message: "Owner updated successfully",
        data: result,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async deleteOwner(req, res) {
    try {
      const result = await adminService.deleteOwner(req.params.ownerId);
      return ApiResponse.success(res, {
        message: "Owner removed successfully",
        data: result,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async listArenas(req, res) {
    try {
      const result = await adminService.listArenas({
        q: req.query.q,
        status: req.query.status,
        ownerId: req.query.ownerId,
        page: req.query.page,
        limit: req.query.limit,
      });
      return ApiResponse.success(res, {
        message: "Arenas fetched successfully",
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async patchArena(req, res) {
    try {
      const disabled = parseDisabledPatch(req.body);
      const result = await adminService.patchArenaDisabled(req.params.arenaId, disabled);
      return ApiResponse.success(res, {
        message: "Arena updated successfully",
        data: result,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async deleteArena(req, res) {
    try {
      const result = await adminService.deleteArena(req.params.arenaId);
      return ApiResponse.success(res, {
        message: "Arena removed successfully",
        data: result,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async listCourts(req, res) {
    try {
      const result = await adminService.listCourts({
        q: req.query.q,
        status: req.query.status,
        arenaId: req.query.arenaId,
        page: req.query.page,
        limit: req.query.limit,
      });
      return ApiResponse.success(res, {
        message: "Courts fetched successfully",
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async patchCourt(req, res) {
    try {
      const disabled = parseDisabledPatch(req.body);
      const result = await adminService.patchCourtDisabled(req.params.courtId, disabled);
      return ApiResponse.success(res, {
        message: "Court updated successfully",
        data: result,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async deleteCourt(req, res) {
    try {
      const result = await adminService.deleteCourt(req.params.courtId);
      return ApiResponse.success(res, {
        message: "Court removed successfully",
        data: result,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }

  async analyticsOverview(req, res) {
    try {
      const data = await adminService.analyticsOverview({
        from: req.query.from,
        to: req.query.to,
      });
      return ApiResponse.success(res, {
        message: "Analytics overview fetched successfully",
        data,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: statusForError(error.message), message: error.message });
    }
  }
}

module.exports = new AdminController();
