import { config } from "../config/config";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const AuthServices = {
  hashPassword: async function (password: string) {
    return bcrypt.hash(password, 10);
  },

  validatePassword: async function(password: string, encryptedPassword: string) {
    return bcrypt.compare(password, encryptedPassword);
  },

  generateToken: async function(payload: any) {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '1d' });
  },

  validateToken: async function(token: string) {
    return jwt.verify(token, config.JWT_SECRET);
  },
}