import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getTodayRange } from "../utils/cleaningMonitoring";
import { getActiveEntitiesMonitoring } from "../utils/cleaningMonitoringData";

export class DashboardController {
  async index(req: Request, res: Response) {
    const now = new Date();
    const { start, end } = getTodayRange(now);

    const [activeEmployees, cleaningsToday, monitoredEntitiesData, latestRecords] =
      await Promise.all([
        prisma.employee.count({
          where: { active: true },
        }),
        prisma.cleaningRecord.count({
          where: {
            cleanedAt: {
              gte: start,
              lte: end,
            },
          },
        }),
        getActiveEntitiesMonitoring(now),
        prisma.cleaningRecord.findMany({
          take: 10,
          orderBy: {
            cleanedAt: "desc",
          },
          include: {
            employee: true,
            entity: true,
          },
        }),
      ]);

    const entityStatuses = monitoredEntitiesData.map(
      ({ entity, monitoringStatus }) => ({
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      type: entity.type,
      sector: entity.sector,
      location: entity.location,
      monitoringEnabled: entity.monitoringEnabled,
      frequencyType: entity.frequencyType,
        ...monitoringStatus,
      })
    );
    const pendingEntities = entityStatuses.filter(
      (entity) => entity.status === "PENDING"
    );
    const monitoringSummary = entityStatuses.reduce(
      (summary, entity) => {
        if (entity.status === "OK") summary.ok += 1;
        if (entity.status === "PENDING") summary.pending += 1;
        if (entity.status === "NOT_MONITORED") summary.notMonitored += 1;
        return summary;
      },
      {
        ok: 0,
        pending: 0,
        notMonitored: 0,
      }
    );

    return res.json({
      activeEntities: monitoredEntitiesData.length,
      activeEmployees,
      cleaningsToday,
      monitoredEntities: monitoredEntitiesData.filter(
        ({ entity }) => entity.monitoringEnabled
      ).length,
      pendingEntities,
      pendingEntitiesCount: pendingEntities.length,
      latestRecords,
      monitoringSummary,
      // Compatibilidade temporária com clientes V1.
      entitiesWithoutCleaningToday: pendingEntities.length,
      entitiesPendingToday: pendingEntities,
    });
  }
}
