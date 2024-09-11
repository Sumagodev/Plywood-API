import "dotenv/config";

export const CONFIG = {
  MONGOURI:  "mongodb://admin123:Jzfq2n6b4n15@13.232.176.232:27017/plywood",
  JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET ? process.env.JWT_ACCESS_TOKEN_SECRET : "qwertyuiop",
  JWT_ACCESS_REFRESH_TOKEN_SECRET: process.env.JWT_ACCESS_REFRESH_TOKEN_SECRET ? process.env.JWT_ACCESS_REFRESH_TOKEN_SECRET : "qwertyuiopitkgkg",
};
