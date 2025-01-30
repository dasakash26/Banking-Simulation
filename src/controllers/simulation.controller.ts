import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import prisma from "../lib/prisma";
import { ApiError, HttpStatus } from "../utils/apiError";
import resp from "../utils/apiRes";
import exp from "constants";

export const spend = asyncHandler(async (req: Request, res: Response) => {
  const { accountNumber, amount } = req.body;
  if (!accountNumber || !amount) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Missing required fields");
  }
  const account = await prisma.bankAccount.findUnique({
    where: {
      accountNumber: accountNumber as string,
    },
  });

  if (!account) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Account not found");
  }

  if (account.balance < amount) {
    account.balance = 0;
  } else {
    account.balance -= amount;
  }

  await prisma.bankAccount.update({
    where: {
      accountNumber: accountNumber as string,
    },
    data: {
      balance: account.balance,
    },
  });

  res.status(HttpStatus.OK).json(resp.success("Transaction successful"));
});

export const earn = asyncHandler(async (req: Request, res: Response) => {
  const { accountNumber, amount } = req.body;
  if (!accountNumber || !amount) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Missing required fields");
  }
  const account = await prisma.bankAccount.findUnique({
    where: {
      accountNumber: accountNumber as string,
    },
  });

  if (!account) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Account not found");
  }

  await prisma.bankAccount.update({
    where: {
      accountNumber: accountNumber as string,
    },
    data: {
      balance: account.balance + amount,
    },
  });

  res.status(HttpStatus.OK).json(resp.success("Transaction successful"));
});

export const incomeCycle = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
    },
  });

  if (!users || users.length === 0) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Users not found");
  }

  for (const user of users) {
    if (!user.accounts || user.accounts.length === 0) continue;
    const account = user.accounts[0];

    const incomeAmount =
      user.employmentType === "EMPLOYED" ? user.income || 0 : 0;

    if (incomeAmount > 0) {
      await prisma.bankAccount.update({
        where: {
          id: account.id,
        },
        data: {
          balance: {
            increment: incomeAmount,
          },
        },
      });
    }
  }
  res.status(HttpStatus.OK).json(resp.success("income cycle successful"));
});

//repay loan emi
export const loanEMI = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
      loans: true,
    },
  });

  if (!users || users.length === 0) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Users not found");
  }

  for (const user of users) {
    if (!user.accounts || user.accounts.length === 0) continue;
    const account = user.accounts[0];

    if (!user.loans || user.loans.length === 0) continue;
    const loan = user.loans[0];

    if (account.balance < loan.emi) {
      loan.emi = account.balance;
    }

    await prisma.bankAccount.update({
      where: {
        id: account.id,
      },
      data: {
        balance: {
          decrement: loan.emi,
        },
      },
    });

    await prisma.loan.update({
      where: {
        id: loan.id,
      },
      data: {
        remainingAmount: {
          decrement: loan.emi,
        },
      },
    });
  }

  res.status(HttpStatus.OK).json(resp.success("Loan EMI repayment successful"));
});

export const simulate = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
    },
  });

  if (!users || users.length === 0) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Users not found");
  }

  // Emergency fund addition for very low balances
  for (const user of users) {
    if (!user.accounts || user.accounts.length === 0) continue;
    const account = user.accounts[0];

    if (account.balance < 500) {
      const emergencyAmount = Math.floor(Math.random() * (5000 - 2000) + 2000);
      await prisma.bankAccount.update({
        where: { id: account.id },
        data: { balance: { increment: emergencyAmount } },
      });
    }
  }

  // Random inter-user transactions with categories
  const categories = [
    "Food",
    "Shopping",
    "Entertainment",
    "Travel",
    "Utilities",
  ];

  for (let i = 0; i < users.length; i++) {
    if (!users[i].accounts || !users[i].accounts.length) continue;

    // Only 60% chance of transaction occurring
    if (Math.random() > 0.6) continue;

    const randomUserIndex = Math.floor(Math.random() * users.length);
    if (i === randomUserIndex) continue;

    if (
      !users[randomUserIndex].accounts ||
      !users[randomUserIndex].accounts.length
    )
      continue;

    const fromAccount = users[i].accounts[0];
    const toAccount = users[randomUserIndex].accounts[0];

    const randomAmount = Math.floor(Math.random() * (2000 - 100) + 100);
    const category = categories[Math.floor(Math.random() * categories.length)];

    try {
      await processTransaction(
        fromAccount.id,
        toAccount.id,
        randomAmount,
        category
      );
    } catch (error) {
      continue; // Skip failed transactions
    }
  }

  // Gradual balance adjustments based on employment type
  for (const user of users) {
    if (!user.accounts || user.accounts.length === 0) continue;
    const account = user.accounts[0];

    const adjustmentAmount = Math.floor(Math.random() * (1000 - 100) + 100);
    const isIncrease = Math.random() > 0.5;

    if (user.employmentType === "BUSINESS" && account.balance > 5000) {
      await prisma.bankAccount.update({
        where: { id: account.id },
        data: {
          balance: {
            [isIncrease ? "increment" : "decrement"]: adjustmentAmount * 1.5,
          },
        },
      });
    } else if (user.employmentType === "EMPLOYED" && account.balance > 2000) {
      await prisma.bankAccount.update({
        where: { id: account.id },
        data: {
          balance: {
            [isIncrease ? "increment" : "decrement"]: adjustmentAmount,
          },
        },
      });
    }
  }

  res
    .status(HttpStatus.OK)
    .json(resp.success("Realistic simulation completed"));
});

const processTransaction = async (
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  category: string
) => {
  const fromAccount = await prisma.bankAccount.findUnique({
    where: {
      id: fromAccountId,
    },
  });

  const toAccount = await prisma.bankAccount.findUnique({
    where: {
      id: toAccountId,
    },
  });

  if (!fromAccount || !toAccount) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Account not found");
  }

  if (fromAccount.balance < amount) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Insufficient balance");
  }

  await prisma.transaction.create({
    data: {
      fromAccountId,
      toAccountId,
      amount,
      mode: "UPI",
      status: "SUCCESS",
      description: category,
    },
  });

  await prisma.bankAccount.update({
    where: {
      id: fromAccountId,
    },
    data: {
      balance: {
        decrement: amount,
      },
    },
  });

  await prisma.bankAccount.update({
    where: {
      id: toAccountId,
    },
    data: {
      balance: {
        increment: amount,
      },
    },
  });
};

export const revenueGen = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: {
      employmentType: "BUSINESS",
    },
    include: {
      accounts: true,
    },
  });

  if (!users || users.length === 0) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Business users not found");
  }

  for (const user of users) {
    if (!user.accounts || user.accounts.length === 0) continue;
    const account = user.accounts[0];
    const dailyIncome = Number(user.income) / (30 * 365);
    if (dailyIncome > 0 && account.balance < dailyIncome) {
      await prisma.bankAccount.update({
        where: { id: account.id },
        data: { balance: { increment: dailyIncome } },
      });
    }
  }

  res.status(HttpStatus.OK).json(resp.success("Revenue generation successful!!"));
});

export const simulateMonthlyExpenses = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      include: { accounts: true },
    });

    for (const user of users) {
      if (!user.accounts.length) continue;
      const account = user.accounts[0];

      const expensePercentage = Math.random() * (0.4 - 0.2) + 0.2;
      const expenseAmount =
        Math.floor(account.balance * expensePercentage * 100) / 100; // Round to 2 decimal places

      if (account.balance >= expenseAmount && expenseAmount > 0) {
        await prisma.bankAccount.update({
          where: { id: account.id },
          data: {
            balance: { decrement: expenseAmount },
          },
        });

        await prisma.transaction.create({
          data: {
            fromAccountId: account.id,
            amount: expenseAmount,
            mode: "POS",
            description: "Monthly Expenses",
            status: "SUCCESS",
          },
        });
      }
    }

    res
      .status(HttpStatus.OK)
      .json(resp.success("Monthly expenses simulation completed"));
  }
);
