import dotenv from "dotenv";
import {rateLimiter} from "express-rate-limit";
import {mongoSanitize} from "express-mongo-sanitize";

dotenv.config();

import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { homeHandler } from "./controllers/userControllers.js";
import { userRouter } from "./routes/userRouter.js";
import { productRouter } from "./routes/productRouter.js";
import { authRouter } from "./routes/authRouter.js";
import { orderRouter } from "./routes/orderRoute.js";
import { reviewRouter } from "./routes/reviewRouter.js";

const app = express();

const limiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: 'draft-8', // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  ipv6Subnet: 56,
}

const PORT = process.env.PORT || 3000;
const db = process.env.DB_URL;

/** Middlewares */
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(json());
app.use(cookieParser());
app.use(rateLimiter(limiter));
app.use(mongoSanitize());

/** Home Page */
app.get("/", homeHandler);

/** User Routes */
app.use("/api/user", userRouter);
  
/** Product Routes */
app.use("/api/product", productRouter);

/** Auth Router */
app.use('/api/auth', authRouter);

/** Order Routes */
app.use('/api/order', orderRouter);

/** Review Routes */
app.use('/api/review', reviewRouter);

/** Central error handling */
app.use((err, req, res, next) => {
  console.log("Central error handling");
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).send({
    message: message,
  });
});

/** DB Connection and Server Start */
connect(db)
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => {
      console.log(`App is listening at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Connection failed:", err.message);
    process.exit(1);
  });
