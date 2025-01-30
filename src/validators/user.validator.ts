import { z } from "zod";

export const createUserSchema = z.object({
  pan: z
    .string()
    .length(10)
    .transform((val) => val.toUpperCase()), // Ensures uppercase
  name: z.string().min(2).max(100),
  mobile: z.string().length(10).optional().nullable(), // Accepts both null & undefined
  email: z.string().email().optional().nullable(), // Accepts both null & undefined
  address: z.string().min(1).optional().nullable(),
  employmentType: z.enum(["EMPLOYED", "BUSINESS"]),
  income: z.number().optional().nullable(), // Accepts both null & undefined
  businessIncome: z.number().optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
