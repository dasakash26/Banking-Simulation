import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";
import { ApiError, HttpStatus } from "../utils/apiError";
import resp from "../utils/apiRes";
import { createUserSchema } from "../validators/user.validator";

interface User {
  name: string;
  pan: string;
  mobile?: string;
  email: string | null;
  dob: Date;
  address: string | null;
  employmentType: "EMPLOYED" | "BUSINESS";
  salary: number | null;
  businessIncome: number | null;
}

interface Account {
  balance: number;
}

interface Investment {
  currentValue: number;
}

interface Loan {
  remainingAmount: number;
}

interface UserWithFinancials {
  accounts: Account[];
  investments: Investment[];
  loans: Loan[];
}

export const getAllUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        loans: true,
        investments: true,
      },
    });

    const usersWithNetWorth = users.map((user) => ({
      ...user,
      netWorth: calculateNetWorth(user as UserWithFinancials),
    }));

    res.status(200).json(resp.success(usersWithNetWorth, "Users found"));
  }
);

export const getUserByPAN = asyncHandler(
  async (req: Request, res: Response) => {
    const { pan } = req.params;
    const user = await prisma.user.findUnique({
      where: { pan },
      include: {
        accounts: true,
        loans: true,
        investments: true,
      },
    });

    if (!user) throw new ApiError(HttpStatus.NOT_FOUND, "User not found!!");

    const netWorth = calculateNetWorth(user as UserWithFinancials);
    const data = { ...user, netWorth };
    res.status(200).json(resp.success(data, "User found"));
  }
);

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createUserSchema.parse(req.body);
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { pan: validatedData.pan },
        { mobile: validatedData.mobile },
        ...(validatedData.email ? [{ email: validatedData.email }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new ApiError(
      HttpStatus.CONFLICT,
      "User with same PAN, mobile, or email already exists"
    );
  }

  const user = await prisma.user.create({
    data: {
      ...validatedData,
      salary: validatedData.salary || null,
      businessIncome: validatedData.businessIncome || null,
    },
  });

  res.status(HttpStatus.CREATED).json(resp.success(user));
});

function calculateNetWorth(user: UserWithFinancials): number {
  const assets =
    user.accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0) +
    user.investments.reduce(
      (sum: number, inv: Investment) => sum + inv.currentValue,
      0
    );
  const liabilities = user.loans.reduce(
    (sum: number, loan: Loan) => sum + loan.remainingAmount,
    0
  );
  return assets - liabilities;
}

