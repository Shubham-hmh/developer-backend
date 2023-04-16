const { default: mongoose } = require("mongoose")

const db = () => {
    try {
        const conn =mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected successfully");

    } catch (error) {
        console.log("database failed !");

    }
}

module.exports=db;

