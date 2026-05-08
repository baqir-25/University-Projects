const UserRepository = require('../repositories/UserRepository');
const AuthService = require('../services/AuthService');
const PasswordService = require("../services/PasswordService");
const TokenService = require("../services/TokenService");
const ApiResponse = require("../utils/ApiResponse");

const authService = new AuthService(
  UserRepository,
  new PasswordService(),
  new TokenService()
);

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body);
      return ApiResponse.success(res, {
        statusCode: 201,
        message: "Registered successfully",
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      if (error.code === 11000 || error.message === "An account with this email already exists.") {
        return ApiResponse.error(res, {
          statusCode: 409,
          message: "An account with this email already exists.",
        });
      }
      if (error instanceof Error && error.message) {
        return ApiResponse.error(res, { statusCode: 400, message: error.message });
      }
      console.error(error);
      return ApiResponse.error(res, {
        statusCode: 500,
        message: "Something went wrong.",
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body || {};
      const result = await authService.login(email, password);
      return ApiResponse.success(res, {
        message: "Login successful",
        data: {
          user: result.user,
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      if (error.message === "Invalid email or password.") {
        return ApiResponse.error(res, { statusCode: 401, message: error.message });
      }
      if (error.message === "Account is disabled.") {
        return ApiResponse.error(res, { statusCode: 403, message: error.message });
      }
      if (error instanceof Error && error.message) {
        return ApiResponse.error(res, { statusCode: 400, message: error.message });
      }
      console.error(error);
      return ApiResponse.error(res, {
        statusCode: 500,
        message: "Something went wrong.",
      });
    }
  }

  async logout(req, res) {
    try {
      await authService.logout(req.authToken);
      return ApiResponse.success(res, {
        message: "Logged out successfully",
        data: null,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: 401, message: error.message });
    }
  }
}

module.exports = new AuthController();
