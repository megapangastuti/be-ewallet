import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { sql } from "./config/db.js";

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

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions(
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(255) NOT NULL,
      created_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;
    console.log("Database initialized successfully");
  } catch (error) {
    console.log("Error initializing DB", error);
    process.exit(1); // status code 1 means failure, 0 success
  }
}

app.get("/", (req, res) => {
  res.send("It is working");
});

// Debug endpoint for testing
app.all("/api/test", (req, res) => {
  res.json({
    message: "Test endpoint working",
    method: req.method,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/transactions", async (req, res) => {
  // title, amount, category, user_id
  try {
    const { title, amount, category, user_id } = req.body;

    if (!title || amount === undefined || !category || !user_id) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const transaction = await sql`
    INSERT INTO transactions(user_id, title, amount, category)
    VALUES(${user_id}, ${title}, ${amount}, ${category})
    RETURNING *
    `;

    res.status(201).json({
      statusCode: 201,
      statusMessage: "The transactions has been successfully created!",
      data: transaction[0],
    });
  } catch (error) {
    console.log("Error creating the transaction", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/transactions", async (req, res) => {
  console.log("🔥 GET /api/transactions called");

  try {
    const transactions = await sql`SELECT * FROM transactions;`;
    console.log("✅ Query success");

    res.status(200).json({
      statusCode: 200,
      statusMessage: "Successfully get all data transactions!",
      data: transactions,
    });
  } catch (error) {
    console.log("❌ Query error", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

initDB().then(() =>
  app.listen(PORT, () => {
    console.log("Server is up and running on PORT:", PORT);
  })
);
