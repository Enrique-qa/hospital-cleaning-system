import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

function createSlug(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
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
      },
    });

    return res.json(entity);
  }
}