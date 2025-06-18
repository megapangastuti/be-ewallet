import { sql } from "../config/db.js";

export async function createTransaction(req, res) {
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
}

export async function getAllTransactions(req, res) {
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
}

export async function getTransactionsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const transactions = await sql`
      SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC;`;
    console.log("✅ Query success");
    res.status(200).json({
      statusCode: 200,
      statusMessage: "Successfully get data transactions by id!",
      data: transactions,
    });
  } catch (error) {
    console.log("❌ Query error", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteTransactionById(req, res) {
  try {
    const { userId } = req.params;
    const transactions = await sql`
      DELETE FROM transactions WHERE user_id = ${userId} RETURNING *`;

    if (transactions.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        statusMessage: "Transaction not found",
        data: [],
      });
    }
    console.log("✅ Query success");
    res.status(200).json({
      statusCode: 200,
      statusMessage: "Successfully delete the data transactions by id!",
      data: transactions,
    });
  } catch (error) {
    console.log("❌ Query error", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSummaryById(req, res) {
  try {
    const { userId } = req.params;
    const balanceResult = await sql`
        SELECT COALESCE(SUM(amount),0) as balance FROM transactions WHERE user_id = ${userId};
      `;

    const incomeResult = await sql`
        SELECT COALESCE(SUM(amount),0) as income FROM transactions WHERE user_id = ${userId} AND amount >0;
      `;

    const expensesResult = await sql`
      SELECT COALESCE(SUM(amount),0) as expense FROM transactions WHERE user_id = ${userId} AND amount <0;
      `;
    res.status(200).json({
      statusCode: 200,
      statusMessage: "Successfully get the summary of transactions!",
      data: {
        balance: Number(balanceResult[0].balance),
        income: Number(incomeResult[0].income),
        expense: Number(expensesResult[0].expense),
      },
    });
  } catch (error) {
    console.log("Error getting the summary", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
