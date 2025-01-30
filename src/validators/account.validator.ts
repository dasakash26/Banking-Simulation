
import { z } from "zod";

export const createAccountSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(['SAVINGS', 'CURRENT']),
  branchCode: z.string().min(0)
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;