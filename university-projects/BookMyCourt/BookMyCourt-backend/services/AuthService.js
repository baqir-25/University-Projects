const RevokedToken = require("../models/RevokedToken");
const TokenService = require("./TokenService");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set(["player", "owner", "admin"]);

function toPublicUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
    disabled: Boolean(user.disabled),
  };
}

class AuthService {
  constructor(userRepo, passwordService, tokenService) {
    this.userRepo = userRepo;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  assertRegister(body) {
    if (!body || typeof body !== "object") throw new Error("Invalid request body.");

    const name = body.name != null ? String(body.name).trim() : "";
    if (!name) throw new Error("Name is required.");
    if (name.length > 120) throw new Error("Name is too long.");

    const email = body.email != null ? String(body.email).trim().toLowerCase() : "";
    if (!email) throw new Error("Email is required.");
    if (email.length > 254) throw new Error("Email is too long.");
    if (!EMAIL_RE.test(email)) throw new Error("Invalid email address.");

    const password = body.password;
    if (password == null || password === "") throw new Error("Password is required.");
    const pw = String(password);
    if (pw.length < 6) throw new Error("Password must be at least 6 characters.");
    if (pw.length > 128) throw new Error("Password is too long.");

    const roleRaw = body.role != null ? String(body.role).trim().toLowerCase() : "player";
    if (!ALLOWED_ROLES.has(roleRaw)) {
      throw new Error("Role must be one of: player, owner, admin.");
    }

    return { name, email, password: pw, role: roleRaw };
  }

  assertLogin(emailRaw, passwordRaw) {
    const email = emailRaw != null ? String(emailRaw).trim().toLowerCase() : "";
    const password = passwordRaw;
    if (!email || password == null || password === "") {
      throw new Error("Email and password are required.");
    }
    return { email, password };
  }

  async register(body) {
    const { name, email, password, role } = this.assertRegister(body);
    const exists = await this.userRepo.findByEmail(email);
    if (exists) throw new Error("An account with this email already exists.");

    const hashed = await this.passwordService.hash(password);
    let user;
    try {
      user = await this.userRepo.create({
        name,
        email,
        password: hashed,
        role,
      });
    } catch (e) {
      if (e.code === 11000) throw new Error("An account with this email already exists.");
      throw e;
    }

    const { accessToken, expiresIn } = this.tokenService.generate({ id: user._id });
    return {
      user: toPublicUser(user),
      accessToken,
      expiresIn,
    };
  }

  async login(emailRaw, passwordRaw) {
    const { email, password } = this.assertLogin(emailRaw, passwordRaw);

    const user = await this.userRepo.findByEmail(email);
    if (!user || !(await this.passwordService.compare(password, user.password))) {
      throw new Error("Invalid email or password.");
    }
    if (user.disabled) {
      throw new Error("Account is disabled.");
    }

    const { accessToken, expiresIn } = this.tokenService.generate({ id: user._id });
    return {
      user: toPublicUser(user),
      accessToken,
      expiresIn,
    };
  }

  async logout(token) {
    const decoded = this.tokenService.verify(token);
    const tokenHash = TokenService.hashToken(token);
    const existing = await RevokedToken.findOne({ tokenHash });
    if (existing) {
      return;
    }
    const expiresAt = new Date(decoded.exp * 1000);
    await RevokedToken.create({ tokenHash, expiresAt });
  }

}

module.exports = AuthService;
