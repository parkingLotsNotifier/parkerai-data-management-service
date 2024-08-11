const dotenv = require("dotenv");
dotenv.config();
const env = {
  DATA_MANAGEMENT_SERVICE_PORT: process.env.DATA_MANAGEMENT_SERVICE_PORT,
  DATA_MANAGEMENT_BASE_ADDRESS: process.env.DATA_MANAGEMENT_BASE_ADRESS,

  JWT_SECRET: process.env.JWT_SECRET,

  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST
};

module.exports = env;
