import { NextFunction, Request, Response } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err.message) {
    res.statusMessage = err.message;
  }
  if (err.status) {
    return res.status(err.status).json({ status: err.status, message: err.message, err: err });
  }

  return res.status(500).json({ message: err.message, err: err });
};
