require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const opdRoutes = require('./routes/opdRoutes');

const app = express();

// Middleware
app.use(cors()); // Allows Frontend to talk to Backend
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB is Connected Locally"))
.catch(err => console.log("Error connecting to MongoDB:", err));

// Routes
app.use('/api', opdRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});