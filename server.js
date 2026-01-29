require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const opdRoutes = require('./routes/opdRoutes');

const app = express();
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB is Connected"))
.catch(err => console.log("Error connecting to MongoDB:", err));
app.use('/api', opdRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
