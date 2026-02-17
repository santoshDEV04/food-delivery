import express from 'express';
import cors from 'cors';
import './config/env.js';

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(express.json( { limit: '16kb' } ));
app.use(express.urlencoded({ extended: true }));

import userRouter from './routes/user.routes.js'
import resturantRouter from './routes/resturant.routes.js'
import orderRoutes from './routes/order.routes.js'
import menuRoutes from "./routes/menu.routes.js"

app.use('/api/v1/users', userRouter)
app.use('/api/v1/resturants', resturantRouter)
// In app.js
app.use('/api/v1/orders', (req, res, next) => {
    console.log('📦 Order route hit:', req.method, req.url);
    next();
}, orderRoutes);
app.use("/api/v1/menu", menuRoutes);



export {app}