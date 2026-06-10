import { NextFunction, Request, Response } from "express";

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({
      message: "Acesso permitido apenas para administradores.",
    });
  }

  return next();
}