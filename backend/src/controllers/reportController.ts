import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export class ReportController {
  async cleaningRecords(req: Request, res: Response) {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Data inicial e data final são obrigatórias.",
      });
    }

    const [startYear, startMonth, startDay] = String(startDate)
      .split("-")
      .map(Number);

    const [endYear, endMonth, endDay] = String(endDate)
      .split("-")
      .map(Number);

    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
    
    const records = await prisma.cleaningRecord.findMany({
      where: {
        cleanedAt: {
          gte: start,
          lte: end,
        },
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
      startDate,
      endDate,
      total: records.length,
      records,
    });
  }
}