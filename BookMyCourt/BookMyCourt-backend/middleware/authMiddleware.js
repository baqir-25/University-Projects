const UserRepository = require("../repositories/UserRepository");
const TokenService = require("../services/TokenService");
const ApiResponse = require("../utils/ApiResponse");
const RevokedToken = require("../models/RevokedToken");

const tokenService = new TokenService();

// Protect route — must be logged in
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = tokenService.verify(token);

      const tokenHash = TokenService.hashToken(token);
      const revoked = await RevokedToken.findOne({ tokenHash });
      if (revoked) {
        return ApiResponse.error(res, {
          statusCode: 401,
          message: "Not authorized, token revoked",
        });
      }

      req.authToken = token;
      req.user = await UserRepository.findSafeById(decoded.id);
      if (!req.user) {
        return ApiResponse.error(res, {
          statusCode: 401,
          message: "Not authorized, user not found",
        });
      }
      if (req.user.disabled) {
        return ApiResponse.error(res, {
          statusCode: 403,
          message: "Account is disabled",
        });
      }
      next();
    } else {
      return ApiResponse.error(res, { statusCode: 401, message: "Not authorized, no token" });
    }

  } catch (error) {
    return ApiResponse.error(res, { statusCode: 401, message: "Not authorized, token failed" });
  }
};

// Authorize by role — must be owner
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return ApiResponse.error(res, {
        statusCode: 403,
        message: `Role '${req.user.role}' is not authorized`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };