import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // ── Allow requests carrying a valid admin API key ────────────────────────
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey && req.headers["x-admin-key"] === adminKey) {
    req.user = { id: "admin", role: "admin" };
    return next();
  }

  // ── Standard JWT bearer token ────────────────────────────────────────────
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: string;
      role: string;
    };

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}