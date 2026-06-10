import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

type JwtPayload = {
  id: number;
  role: "ADMIN" | "MANAGER";
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token não informado.",
    });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({
      message: "Token inválido.",
    });
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    ) as JwtPayload;
  } catch {
    return res.status(401).json({
      message: "Token inválido ou expirado.",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
    select: {
      id: true,
      role: true,
      active: true,
    },
  });

  if (!user || !user.active) {
    return res.status(401).json({
      message: "Usuário não encontrado ou inativo.",
    });
  }

  req.user = {
    id: user.id,
    role: user.role,
  };

  return next();
}
