import { z } from "zod";

export const transactionSchema = z.object({
  fromAccountId: z.string().optional(),
  toAccountId: z.string().optional(),
  amount: z.number().positive(),
  mode: z.enum(["CREDIT", "DEBIT", "TRANSFER"])
}).refine(
  data => {
    if (data.mode === "TRANSFER") {
      return data.fromAccountId && data.toAccountId;
    }
    if (data.mode === "CREDIT") {
      return data.toAccountId && !data.fromAccountId;
    }
    if (data.mode === "DEBIT") {
      return data.fromAccountId && !data.toAccountId;
    }
    return false;
  },
  {
    message: "Invalid account IDs for the specified transaction mode"
  }
);