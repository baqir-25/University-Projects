const bcrypt = require("bcryptjs");

class PasswordService {
  constructor(rounds = 10) {
    this.rounds = rounds;
  }

  async hash(plainText) {
    return bcrypt.hash(plainText, this.rounds);
  }

  async compare(plainText, hash) {
    return bcrypt.compare(plainText, hash);
  }
}

module.exports = PasswordService;
