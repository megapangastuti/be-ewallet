import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";

dotenv.config();
const app = express();

// Configure CORS explicitly
app.use(
  cors({
    origin: "*", // Allow all origins for testing
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight requests
app.options("*", cors());

// express.json is a built-in middleware
app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced debugging middleware
app.use((req, res, next) => {
  console.log("\n--- Incoming Request ---");
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Headers:`, req.headers);
  console.log(`Body:`, req.body);
  console.log(`Query:`, req.query);
  console.log("--- End Request Info ---\n");
  next();
});

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("It is working");
});

app.use("/api/transactions", transactionsRoute);

initDB().then(() =>
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  })
);
