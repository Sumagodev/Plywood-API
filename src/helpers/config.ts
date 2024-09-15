import "dotenv/config";

export const CONFIG = {
  MONGOURI: process.env.MONGOURI ? process.env.MONGOURI : "mongodb://13.232.176.232:27017/plywood?authSource=plywood",
  PORT: process.env.PORT ? process.env.PORT : 8000,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ? process.env.JWT_ACCESS_TOKEN_SECRET : "qwertyuiop",
  JWT_ACCESS_REFRESH_TOKEN_SECRET: process.env.JWT_ACCESS_REFRESH_TOKEN_SECRET ? process.env.JWT_ACCESS_REFRESH_TOKEN_SECRET : "qwertyuiopitkgkg",
};
