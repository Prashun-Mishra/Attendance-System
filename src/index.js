require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/student.routes');
const attendanceRoutes = require('./routes/attendance.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for development and production
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        /^https:\/\/.*\.vercel\.app$/, // All Vercel deployments
        /^https:\/\/.*\.onrender\.com$/ // If frontend is also on Render
    ],
    credentials: true
}));
app.use(express.json());

app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
    res.send('Attendance API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
