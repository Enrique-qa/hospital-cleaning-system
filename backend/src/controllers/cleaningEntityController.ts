import { Request, Response } from "express";
import type { CleaningEntity } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  FREQUENCY_TYPES,
  WEEK_DAYS,
  type CleaningFrequencyTypeValue,
} from "../utils/cleaningMonitoring";

function createSlug(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeMonitoring(
  body: Record<string, unknown>,
  current?: CleaningEntity
) {
  const monitoringEnabled =
    typeof body.monitoringEnabled === "boolean"
      ? body.monitoringEnabled
      : current?.monitoringEnabled ?? true;
  const frequencyType = String(
    body.frequencyType ?? current?.frequencyType ?? "DAILY"
  ) as CleaningFrequencyTypeValue;

  if (!FREQUENCY_TYPES.includes(frequencyType)) {
    return { error: "Tipo de frequência de monitoramento inválido." };
  }

  const expectedValue = Number(
    body.expectedCleaningsPerDay ?? current?.expectedCleaningsPerDay ?? 1
  );
  const expectedCleaningsPerDay =
    frequencyType === "DAILY" ? expectedValue : null;

  if (
    monitoringEnabled &&
    frequencyType === "DAILY" &&
    (!Number.isInteger(expectedValue) || expectedValue < 1)
  ) {
    return { error: "Informe uma quantidade diária válida." };
  }

  const weeklyValue = body.weeklyDays ?? current?.weeklyDays ?? [];
  const weeklyDays = Array.isArray(weeklyValue)
    ? [...new Set(weeklyValue.map(String))].filter((day) =>
        WEEK_DAYS.includes(day as (typeof WEEK_DAYS)[number])
      )
    : [];

  if (
    monitoringEnabled &&
    frequencyType === "WEEKLY" &&
    weeklyDays.length === 0
  ) {
    return { error: "Selecione ao menos um dia para a rotina semanal." };
  }

  const monthlyValue = body.monthlyDays ?? current?.monthlyDays ?? [];
  const monthlyDays = Array.isArray(monthlyValue)
    ? [
        ...new Set(
          monthlyValue
            .map(Number)
            .filter((day) => Number.isInteger(day) && day >= 1 && day <= 31)
        ),
      ].sort((a, b) => a - b)
    : [];

  if (
    monitoringEnabled &&
    frequencyType === "MONTHLY" &&
    monthlyDays.length === 0
  ) {
    return { error: "Informe ao menos um dia para a rotina mensal." };
  }

  const intervalValue = Number(
    body.customIntervalHours ?? current?.customIntervalHours ?? 0
  );
  const customIntervalHours =
    frequencyType === "CUSTOM" && intervalValue >= 1 ? intervalValue : null;

  if (
    monitoringEnabled &&
    frequencyType === "CUSTOM" &&
    (!Number.isInteger(intervalValue) || intervalValue < 1)
  ) {
    return { error: "Informe um intervalo personalizado válido." };
  }

  return {
    data: {
      monitoringEnabled,
      frequencyType,
      expectedCleaningsPerDay,
      weeklyDays,
      monthlyDays,
      customIntervalHours,
      monitoringNotes:
        body.monitoringNotes === undefined
          ? current?.monitoringNotes ?? null
          : body.monitoringNotes === null
            ? null
            : String(body.monitoringNotes).trim() || null,
    },
  };
}

export class CleaningEntityController {
  async create(req: Request, res: Response) {
    const {
      name,
      type,
      sector,
      location,
      imageUrl,
      description,
      cleaningSteps,
      products,
      frequency,
    } = req.body;

    if (!name || !type || !cleaningSteps) {
      return res.status(400).json({
        message: "Nome, tipo e passo a passo são obrigatórios.",
      });
    }

    const baseSlug = createSlug(String(name));

    const existingEntity = await prisma.cleaningEntity.findUnique({
      where: { slug: baseSlug },
    });

    const slug = existingEntity ? `${baseSlug}-${Date.now()}` : baseSlug;
    const monitoring = normalizeMonitoring(req.body);

    if (monitoring.error || !monitoring.data) {
      return res.status(400).json({
        message: monitoring.error,
      });
    }

    const entity = await prisma.cleaningEntity.create({
      data: {
        name: String(name).trim(),
        slug,
        type: String(type).trim(),
        sector,
        location,
        imageUrl,
        description,
        cleaningSteps,
        products,
        frequency,
        ...monitoring.data,
      },
    });

    return res.status(201).json(entity);
  }

  async list(req: Request, res: Response) {
    const entities = await prisma.cleaningEntity.findMany({
      orderBy: { name: "asc" },
      include: {
        cleaningRecords: {
          take: 1,
          orderBy: {
            cleanedAt: "desc",
          },
          include: {
            employee: true,
          },
        },
      },
    });

    const formattedEntities = entities.map((entity) => {
      const lastCleaningRecord = entity.cleaningRecords[0] || null;

      return {
        ...entity,
        cleaningRecords: undefined,
        lastCleaningRecord,
      };
    });

    return res.json(formattedEntities);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;

    const entity = await prisma.cleaningEntity.findUnique({
      where: { id: Number(id) },
    });

    if (!entity) {
      return res.status(404).json({
        message: "Entidade não encontrada.",
      });
    }

    return res.json(entity);
  }

  async findBySlug(req: Request<{ slug: string }>, res: Response) {
    const { slug } = req.params;

    const entity = await prisma.cleaningEntity.findUnique({
      where: { slug },
    });

    if (!entity) {
      return res.status(404).json({
        message: "Entidade não encontrada.",
      });
    }

    return res.json(entity);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;

    const {
      name,
      type,
      sector,
      location,
      imageUrl,
      description,
      cleaningSteps,
      products,
      frequency,
      active,
    } = req.body;

    const entityExists = await prisma.cleaningEntity.findUnique({
      where: { id: Number(id) },
    });

    if (!entityExists) {
      return res.status(404).json({
        message: "Entidade não encontrada.",
      });
    }

    const monitoring = normalizeMonitoring(req.body, entityExists);

    if (monitoring.error || !monitoring.data) {
      return res.status(400).json({
        message: monitoring.error,
      });
    }

    const entity = await prisma.cleaningEntity.update({
      where: { id: Number(id) },
      data: {
        name,
        type,
        sector,
        location,
        imageUrl,
        description,
        cleaningSteps,
        products,
        frequency,
        active,
        ...monitoring.data,
      },
    });

    return res.json(entity);
  }
}
