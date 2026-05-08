const jwt = require("jsonwebtoken");
const crypto = require("crypto");

class TokenService {
  constructor(secret = process.env.JWT_SECRET) {
    this.secret = secret;
    const raw = Number.parseInt(process.env.JWT_EXPIRES_IN_SECONDS ?? "3600", 10);
    this.expiresInSeconds = Number.isFinite(raw) && raw > 0 ? raw : 3600;
  }

  static hashToken(token) {
    return crypto.createHash("sha256").update(token, "utf8").digest("hex");
  }

  generate(payload) {
    const expiresIn = this.expiresInSeconds;
    const accessToken = jwt.sign(payload, this.secret, { expiresIn });
    return { accessToken, expiresIn };
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = TokenService;
