import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../lib/secrets";

export const checkAuth = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    //@ts-ignore
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    const token = authorization.split(" ")[1];

    // Verify token
    const tokenData = jwt.verify(token, JWT_SECRET);
    //@ts-ignore
    if (!tokenData.authorized) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return;
    }

    next();
  }
);
