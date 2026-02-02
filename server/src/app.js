const express = require('express');
const cors = require('cors');
const path = require('path');
const grievanceRoutes = require('./routes/grievance.routes');
const userRoutes = require('./routes/user.routes');


const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));



// Routes
// We'll pass the upload middleware to the routes if needed, 
// or define it in the routes file.
app.use('/api/grievances', grievanceRoutes);
app.use('/api/users', userRoutes);


app.get('/', (req, res) => {
    res.send('KDA e-Jansunwai API is running');
});

module.exports = app;
