import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

export class DashboardController {
  async index(req: Request, res: Response) {
    const { start, end } = getTodayRange();

    const activeEntities = await prisma.cleaningEntity.count({
      where: { active: true },
    });

    const activeEmployees = await prisma.employee.count({
      where: { active: true },
    });

    const cleaningsToday = await prisma.cleaningRecord.count({
      where: {
        cleanedAt: {
          gte: start,
          lte: end,
        },
      },
    });

    const entities = await prisma.cleaningEntity.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      include: {
        cleaningRecords: {
          where: {
            cleanedAt: {
              gte: start,
              lte: end,
            },
          },
          take: 1,
        },
      },
    });

    const entitiesPendingToday = entities
      .filter((entity) => entity.cleaningRecords.length === 0)
      .map((entity) => ({
        id: entity.id,
        name: entity.name,
        slug: entity.slug,
        type: entity.type,
        sector: entity.sector,
        location: entity.location,
      }));

    const latestRecords = await prisma.cleaningRecord.findMany({
      take: 10,
      orderBy: {
        cleanedAt: "desc",
      },
      include: {
        employee: true,
        entity: true,
      },
    });

    return res.json({
      activeEntities,
      activeEmployees,
      cleaningsToday,
      entitiesWithoutCleaningToday: entitiesPendingToday.length,
      latestRecords,
      entitiesPendingToday,
    });
  }
}