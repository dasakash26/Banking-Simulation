import e, { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserByPAN,
} from "../controllers/user.controller";
import { createAccount } from "../controllers/account.controller";
import { processTransaction } from "../controllers/transaction.controller";
import {
  earn,
  spend,
  incomeCycle,
  simulate,
  revenueGen,
  simulateMonthlyExpenses,
  loanEMI,
} from "../controllers/simulation.controller";

const router = Router();

// User routes
router.post("/user", createUser);
router.get("/user/all", getAllUsers);
router.get("/user/:pan", getUserByPAN);

// Account routes
router.post("/account", createAccount);

// Transaction routes
router.post("/transaction", processTransaction);

// Simulate transaction
router.post("/simulate", simulate);
router.post("/simulate/spending", spend);
router.post("/simulate/earning", earn);
router.post("/simulate/income-cycle", incomeCycle);
router.post("/simulate/revenue-gen", revenueGen);
router.post("/simulate/monthly-expense", simulateMonthlyExpenses);
router.post("/simulate/emi", loanEMI);

export default router;
