import express from "express";
// import { sql } from "../config/db.js";
import { createTransaction, deleteTransactionById, getAllTransactions, getSummaryById, getTransactionsByUserId } from "../controllers/transactionsController.js";

const router = express.Router();

// Debug endpoint for testing
router.all("/api/test", (req, res) => {
  res.json({
    message: "Test endpoint working",
    method: req.method,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString(),
  });
});

router.post("/", createTransaction);

router.get("/", getAllTransactions);

router.get("/:userId", getTransactionsByUserId);

router.delete("/:userId", deleteTransactionById);

router.get("/summary/:userId", getSummaryById);

export default router;
