import "dotenv/config";

export const CONFIG = {
  MONGOURI: process.env.MONGOURI ? process.env.MONGOURI : "mongodb://admin123:Jzfq2n6b4n15@0.0.0.0:27017/plywood",  PORT: process.env.PORT ? process.env.PORT : 3000,
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ? process.env.JWT_ACCESS_TOKEN_SECRET : "qwertyuiop",
  JWT_ACCESS_REFRESH_TOKEN_SECRET: process.env.JWT_ACCESS_REFRESH_TOKEN_SECRET ? process.env.JWT_ACCESS_REFRESH_TOKEN_SECRET : "qwertyuiopitkgkg",
};
