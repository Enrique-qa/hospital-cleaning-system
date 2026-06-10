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

  async findById(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Usuário inválido.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
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

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado.",
      });
    }

    return res.json(user);
  }

  async update(req: Request, res: Response) {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: "Usuário inválido.",
      });
    }

    const { name, username, role, active, password } = req.body;

    const userExists = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!userExists) {
      return res.status(404).json({
        message: "Usuário não encontrado.",
      });
    }

    const normalizedName =
      name === undefined ? userExists.name : String(name).trim();
    const normalizedUsername =
      username === undefined
        ? userExists.username
        : String(username).trim().toLowerCase();

    if (!normalizedName || !normalizedUsername) {
      return res.status(400).json({
        message: "Nome e usuário são obrigatórios.",
      });
    }

    if (role !== undefined && role !== "ADMIN" && role !== "MANAGER") {
      return res.status(400).json({
        message: "Perfil de usuário inválido.",
      });
    }

    if (active !== undefined && typeof active !== "boolean") {
      return res.status(400).json({
        message: "Status de usuário inválido.",
      });
    }

    const normalizedRole = role ?? userExists.role;
    const normalizedActive = active ?? userExists.active;

    if (req.user?.id === id && !normalizedActive) {
      return res.status(400).json({
        message: "Você não pode inativar o próprio usuário.",
      });
    }

    const usernameExists = await prisma.user.findFirst({
      where: {
        username: normalizedUsername,
        NOT: {
          id,
        },
      },
    });

    if (usernameExists) {
      return res.status(400).json({
        message: "Já existe um usuário com este login.",
      });
    }

    const normalizedPassword =
      typeof password === "string" ? password.trim() : "";

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: normalizedName,
        username: normalizedUsername,
        role: normalizedRole,
        active: normalizedActive,
        ...(normalizedPassword
          ? { password: await bcrypt.hash(normalizedPassword, 8) }
          : {}),
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

    return res.json(user);
  }
}
