import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function generateEmployeeCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function generateUniqueEmployeeCode() {
  let code = generateEmployeeCode();

  let existingEmployee = await prisma.employee.findUnique({
    where: {
      employeeCode: code,
    },
  });

  while (existingEmployee) {
    code = generateEmployeeCode();

    existingEmployee = await prisma.employee.findUnique({
      where: {
        employeeCode: code,
      },
    });
  }

  return code;
}

export class EmployeeController {
  async create(req: Request, res: Response) {
    const { name } = req.body;

    if (!name || String(name).trim() === "") {
      return res.status(400).json({
        message: "O nome da funcionária é obrigatório.",
      });
    }

    const employeeCode = await generateUniqueEmployeeCode();

    const employee = await prisma.employee.create({
      data: {
        name: String(name).trim(),
        employeeCode,
      },
    });

    return res.status(201).json(employee);
  }

  async list(req: Request, res: Response) {
    const employees = await prisma.employee.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.json(employees);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!employee) {
      return res.status(404).json({
        message: "Funcionária não encontrada.",
      });
    }

    return res.json(employee);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, active } = req.body;

    const employeeExists = await prisma.employee.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!employeeExists) {
      return res.status(404).json({
        message: "Funcionária não encontrada.",
      });
    }

    const employee = await prisma.employee.update({
      where: {
        id: Number(id),
      },
      data: {
        name: name ? String(name).trim() : employeeExists.name,
        active: typeof active === "boolean" ? active : employeeExists.active,
      },
    });

    return res.json(employee);
  }
}