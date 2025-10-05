import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { connectDB } from './config/db.js'

import path from 'path';
import { fileURLToPath } from 'url';

import userRouter from './routes/userRoute.js'
import cartRouter from './routes/cartRoute.js'
import itemRouter from './routes/itemRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRouter from "./routes/adminRoute.js"; 
// NEW: Food review routes
import foodReviewRoutes from "./routes/foodReviewRoutes.js";
import restaurantRouter from "./routes/restaurantRoute.js";
const app = express();
const port = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIDDLEWARE 
const allowedOrigins = [
    'https://quickbite-frontendapp.netlify.app',
    'https://quickbite-adminapp.netlify.app',
    'http://localhost:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB CONNECT
connectDB();

// Routes
app.use('/api/user', userRouter)
app.use('/api/admin', adminRouter)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/cart', cartRouter)
app.use('/api/items', itemRouter);
app.use('/api/orders', orderRouter);
app.use("/api/reviews", reviewRoutes);
app.use("/api/restaurants", restaurantRouter);
// NEW: Mount food review routes (per-item)
// app.use("/api/items", foodReviewRoutes);
app.use("/api/food-review", foodReviewRoutes);
app.get('/', (req, res) => {
    res.send('API WORKING');
})

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`)
})
