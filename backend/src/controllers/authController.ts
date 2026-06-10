import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export class AuthController {
  async login(req: Request, res: Response) {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Usuário e senha são obrigatórios.",
      });
    }

    const normalizedUsername = String(username).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        username: normalizedUsername,
      },
    });

    if (!user || !user.active) {
      return res.status(401).json({
        message: "Usuário ou senha inválidos.",
      });
    }

    const passwordMatches = await bcrypt.compare(String(password), user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Usuário ou senha inválidos.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || "default_secret",
      {
        expiresIn: "8h",
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  }

  async profile(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({
        message: "Usuário não autenticado.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    if (!user || !user.active) {
      return res.status(401).json({
        message: "Usuário não encontrado ou inativo.",
      });
    }

    return res.json(user);
  }
}