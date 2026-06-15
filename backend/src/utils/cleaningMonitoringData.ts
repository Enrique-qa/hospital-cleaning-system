import { prisma } from "../lib/prisma";
import {
  getEntityCleaningStatus,
  getTodayRange,
} from "./cleaningMonitoring";

export async function getActiveEntitiesMonitoring(now = new Date()) {
  const entities = await prisma.cleaningEntity.findMany({
    where: {
      active: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  if (entities.length === 0) return [];

  const entityIds = entities.map((entity) => entity.id);
  const customEntityIds = entities
    .filter((entity) => entity.frequencyType === "CUSTOM")
    .map((entity) => entity.id);
  const { start, end } = getTodayRange(now);

  const [todayRecords, latestCustomRecords] = await Promise.all([
    prisma.cleaningRecord.findMany({
      where: {
        entityId: {
          in: entityIds,
        },
        cleanedAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        entityId: true,
        cleanedAt: true,
      },
    }),
    customEntityIds.length > 0
      ? prisma.cleaningRecord.groupBy({
          by: ["entityId"],
          where: {
            entityId: {
              in: customEntityIds,
            },
          },
          _max: {
            cleanedAt: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const recordsByEntity = new Map<number, { cleanedAt: Date }[]>();

  for (const record of todayRecords) {
    const records = recordsByEntity.get(record.entityId) ?? [];
    records.push({ cleanedAt: record.cleanedAt });
    recordsByEntity.set(record.entityId, records);
  }

  for (const record of latestCustomRecords) {
    const cleanedAt = record._max.cleanedAt;

    if (!cleanedAt) continue;

    const records = recordsByEntity.get(record.entityId) ?? [];

    if (!records.some((item) => item.cleanedAt.getTime() === cleanedAt.getTime())) {
      records.push({ cleanedAt });
    }

    recordsByEntity.set(record.entityId, records);
  }

  return entities.map((entity) => ({
    entity,
    monitoringStatus: getEntityCleaningStatus(
      entity,
      recordsByEntity.get(entity.id) ?? [],
      now
    ),
  }));
}
