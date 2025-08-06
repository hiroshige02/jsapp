import type { Request, Response, NextFunction } from "express";
import { AnySchema } from "yup";

export const validate =
  (schema: AnySchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (errors) {
      console.log(errors);
      res.status(409).json({ errors });
    }
  };
