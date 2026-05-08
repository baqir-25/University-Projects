const DealRepository = require("../repositories/DealRepository");
const ApiResponse = require("../utils/ApiResponse");

class DealController {
  async listAllActive(req, res) {
    try {
      const deals = await DealRepository.findAllActiveNow();
      return ApiResponse.success(res, {
        message: "Deals fetched successfully",
        data: deals,
      });
    } catch (error) {
      return ApiResponse.error(res, { statusCode: 500, message: error.message });
    }
  }
}

module.exports = new DealController();
