const mongoose = require("mongoose");
const { dbHost, dbPass, dbName, dbPort, dbUser } = require("../app/config");

// mongoose.connect(`mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`);
mongoose.connect(`mongodb://${dbHost}:${dbPort}/${dbName}`);

// mongoose.connect(`mongodb://127.0.0.1:27017/eduwork-mongoose`, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     authSource: admin,
// });
const db = mongoose.connection;

module.exports = db;
