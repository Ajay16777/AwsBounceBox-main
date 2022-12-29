'use strict';

require('dotenv').config();
module.exports = {
    PORT: process.env.PORT || 8080,
    MONGO_DB_URI : process.env.MONGO_DB_URI,
    MONGO_DB_SCHEMA : process.env.MONGO_DB_SCHEMA,
    JWT_KEY: process.env.JWT_KEY,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    DB_MAX_RETRY : process.env.DB_MAX_RETRY,
}
