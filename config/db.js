const dotenv = require('dotenv');
const mongoose=require('mongoose');
dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDb connected`)
    } catch (error) {
        console.log(`MongoDb error ${error}`)
    }
}
module.exports={
    connectDB,
}