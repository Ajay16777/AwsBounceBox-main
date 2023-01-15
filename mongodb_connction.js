const mongooes = require('mongoose');
const config = require('./config');
const logger = require('./logger');

const options = {
    dbName: config.MONGO_DB_SCHEMA,
    user : '',
    pass :'',
    useNewUrlParser: true,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 5000,
}

const uri = config.MONGO_DB_URI;

const retryCounter = 0;
const RETRY_LIMIT = 5;

const mongoConnect = () => {
    logger.info('MongoDB connection attempt');
    mongooes.set('strictQuery', false);
    mongooes.connect(uri, options)
    .then(() => {
        logger.info('MongoDB connected');
    })
    .catch((err) => {
        logger.error('MongoDB connection error');
        logger.error(err);
    });
       
}

const connectDB = () => {
    mongoConnect();

    mongooes.connection.on('disconnected', () => {
        logger.info('MongoDB disconnected');
        if (retryCounter < RETRY_LIMIT) {
            mongoConnect();
        }
        else {
            logger.error('MongoDB connection failed after retry limit');
        }
    }
    );
}

module.exports = connectDB;

  