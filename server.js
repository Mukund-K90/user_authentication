const express = require('express');
const app = express();
const {connectDB}=require('./config/db');
const dotenv =require('dotenv');
dotenv.config();
const PORT = process.env.PORT || 8080;
const BASE_URL=process.env.BASE_URL ||"http://localhost:"

connectDB();

app.get('/', (req, res) => {
    res.send("<h1>USER AUTHENTICATION API</h1>");
});

app.use(express.json());


//User Routes
const authRoutes=require('./routes/user.routes');
app.use('/user',authRoutes);

app.listen(PORT, () => console.log(`server running on ${BASE_URL}${PORT}`)
);