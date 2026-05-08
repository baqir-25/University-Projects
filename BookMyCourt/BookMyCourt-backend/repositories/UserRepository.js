const User = require('../models/User');
const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor() { super(User); }

  async findByEmail(email) {
    if (email == null) return null;
    const normalized = String(email).trim().toLowerCase();
    if (!normalized) return null;
    return await this.model.findOne({ email: normalized });
  }

  async findSafeById(id) {
    return await this.model.findById(id).select("-password");
  }
}
module.exports = new UserRepository();