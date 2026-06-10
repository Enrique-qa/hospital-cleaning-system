import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

export class UserController {
  async create(req: Request, res: Response) {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        message: "Nome, usuário e senha são obrigatórios.",
      });
    }

    const normalizedUsername = String(username).trim().toLowerCase();

    const userExists = await prisma.user.findUnique({
      where: {
        username: normalizedUsername,
      },
    });

    if (userExists) {
      return res.status(400).json({
        message: "Já existe um usuário com este login.",
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 8);

    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        username: normalizedUsername,
        password: passwordHash,
        role: role === "ADMIN" ? "ADMIN" : "MANAGER",
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

    return res.status(201).json(user);
  }

  async list(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json(users);
  }
}