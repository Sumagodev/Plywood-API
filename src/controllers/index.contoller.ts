import { NextFunction, Request, Response } from "express";

export const indexGet = (req: Request, res: Response, next: NextFunction) => {
  res.send("test");
};
