import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function parseLocalDate(value: unknown, endOfDay = false) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));

  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(
    year,
    month - 1,
    day,
    endOfDay ? 23 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 59 : 0,
    endOfDay ? 999 : 0
  );

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export class ReportController {
  async cleaningRecords(req: Request, res: Response) {
    const { startDate, endDate, employeeId, entityId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Data inicial e data final são obrigatórias.",
      });
    }

    const startDateText = String(startDate);
    const endDateText = String(endDate);
    const start = parseLocalDate(startDateText);
    const end = parseLocalDate(endDateText, true);

    if (!start || !end) {
      return res.status(400).json({
        message: "Informe datas válidas no formato AAAA-MM-DD.",
      });
    }

    if (start > end) {
      return res.status(400).json({
        message: "A data inicial não pode ser maior que a data final.",
      });
    }

    const normalizedEmployeeId =
      employeeId === undefined ? undefined : Number(employeeId);
    const normalizedEntityId =
      entityId === undefined ? undefined : Number(entityId);

    if (
      normalizedEmployeeId !== undefined &&
      !Number.isInteger(normalizedEmployeeId)
    ) {
      return res.status(400).json({
        message: "Funcionária inválida.",
      });
    }

    if (
      normalizedEntityId !== undefined &&
      !Number.isInteger(normalizedEntityId)
    ) {
      return res.status(400).json({
        message: "Entidade inválida.",
      });
    }

    const records = await prisma.cleaningRecord.findMany({
      where: {
        cleanedAt: {
          gte: start,
          lte: end,
        },
        employeeId: normalizedEmployeeId,
        entityId: normalizedEntityId,
      },
      include: {
        employee: true,
        entity: true,
      },
      orderBy: {
        cleanedAt: "desc",
      },
    });

    return res.json({
      startDate: startDateText,
      endDate: endDateText,
      employeeId: normalizedEmployeeId ?? null,
      entityId: normalizedEntityId ?? null,
      total: records.length,
      records,
    });
  }
}
