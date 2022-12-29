const mongooes = require('mongoose');
const config = require('./config');

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
    console.log('MongoDB connecting', uri, options);
    mongooes.set('strictQuery', false);
    mongooes.connect(uri, options)
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.log('MongoDB connection error', err);
       
    });
       
}

const connectDB = () => {
    mongoConnect();

    mongooes.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
        if (retryCounter < RETRY_LIMIT) {
            mongoConnect();
        }
        else {
            console.log('MongoDB Max retry limit reached');
        }
    }
    );
}

module.exports = connectDB;

  