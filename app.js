const express = require('express');
const app = express();
const route = require('./routes/route');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const allowedOrigins = ['http://localhost:8080', 'http://localhost:8001', 'http://localhost:8000'];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(route);
app.use('/uploads/img', express.static('uploads/img/'));

app.get('/', (req, res) => {
    res.send('CORS is configured for multiple origins!');
});

app.listen(process.env.PORT, () => console.log(`Server running on port: http://localhost:${PORT}`));