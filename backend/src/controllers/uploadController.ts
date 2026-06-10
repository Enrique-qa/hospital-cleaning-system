import { Request, Response } from "express";

export class UploadController {
  async uploadEntityImage(req: Request, res: Response) {
    if (!req.file) {
      return res.status(400).json({
        message: "Nenhuma imagem enviada.",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    return res.status(201).json({
      imageUrl,
    });
  }
}