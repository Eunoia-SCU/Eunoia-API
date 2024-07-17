const mongoose = require("mongoose");
const DB = process.env.DATABASE.replace(
    "<password>",
    process.env.DATABASE_PASSWORD
);
// const DBLocal = "mongodb://localhost:27017/Eunoia";

const dbConnection = () => {
    mongoose.connect(DB).then((conn) => {
        console.log(`Database Connection successful!:${conn.connection.host} `);
    });
};
module.exports = dbConnection;