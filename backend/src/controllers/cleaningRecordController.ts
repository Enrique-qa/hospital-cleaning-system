import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getEntityCleaningStatus } from "../utils/cleaningMonitoring";

function normalizeName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export class CleaningRecordController {
  async listByEntitySlug(req: Request<{ slug: string }>, res: Response) {
    const { slug } = req.params;

    const entity = await prisma.cleaningEntity.findUnique({
      where: { slug },
    });

    if (!entity) {
      return res.status(404).json({
        message: "Entidade não encontrada.",
      });
    }

    const records = await prisma.cleaningRecord.findMany({
      where: {
        entityId: entity.id,
      },
      include: {
        employee: true,
      },
      orderBy: {
        cleanedAt: "desc",
      },
    });

    return res.json({
      entity,
      records,
      monitoringStatus: getEntityCleaningStatus(entity, records),
    });
  }
  
  async createPublicRecord(req: Request<{ slug: string }>, res: Response) {
    const { slug } = req.params;
    const { employeeIdentifier, employeeName, observation } = req.body;
    const typedIdentifier = String(
      employeeIdentifier ?? employeeName ?? ""
    ).trim();

    if (!typedIdentifier) {
      return res.status(400).json({
        message: "Informe o nome ou código do funcionário.",
      });
    }

    const entity = await prisma.cleaningEntity.findUnique({
      where: { slug },
    });

    if (!entity || !entity.active) {
      return res.status(404).json({
        message: "Ambiente ou aparelho não encontrado.",
      });
    }

    const employees = await prisma.employee.findMany({
      where: {
        active: true,
      },
    });

    const normalizedTypedName = normalizeName(typedIdentifier);

    const employee = employees.find(
      (item) =>
        item.employeeCode === typedIdentifier ||
        normalizeName(item.name) === normalizedTypedName
    );

    if (!employee) {
      return res.status(400).json({
        message: "Funcionário não encontrado ou inativo.",
      });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const recentRecord = await prisma.cleaningRecord.findFirst({
      where: {
        entityId: entity.id,
        employeeId: employee.id,
        cleanedAt: {
          gte: tenMinutesAgo,
        },
      },
      orderBy: {
        cleanedAt: "desc",
      },
    });

    if (recentRecord) {
      return res.status(409).json({
        message:
          "Esta limpeza já foi registrada recentemente para este funcionário.",
      });
    }

    const record = await prisma.cleaningRecord.create({
      data: {
        entityId: entity.id,
        employeeId: employee.id,
        employeeNameTyped: typedIdentifier,
        observation: observation ? String(observation).trim() : null,
      },
      include: {
        entity: true,
        employee: true,
      },
    });

    return res.status(201).json(record);
  }

  async list(req: Request, res: Response) {
    const records = await prisma.cleaningRecord.findMany({
      include: {
        entity: true,
        employee: true,
      },
      orderBy: {
        cleanedAt: "desc",
      },
    });

    return res.json(records);
  }
}
