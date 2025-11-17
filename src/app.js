import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import contactRoutes from "./routes/contact.js";



const app = express();

// security middleware
app.use(helmet());
app.use(mongoSanitize()); // prevent MongoDB injection

// rate limiting for contact form
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit to 5 submissions per IP per 15 minutes
  message: "Too many contact form submissions. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS config
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend server is running",
    timestamp: new Date().toISOString(),
  });
});

// apply rate limiter to contact routes
app.use("/api/contact", contactLimiter, contactRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
