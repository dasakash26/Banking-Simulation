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

export const salaryCycle = asyncHandler(async (req: Request, res: Response) => {
  //get the user accounts
    const users = await prisma.user.findMany({
        include: {
        accounts: true,
        },
    });

    if (!users) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Users not found");
    }

    //simulate transactions for each user
    users.forEach(async (user) => {
        const account = user.accounts[0];
      
        await prisma.bankAccount.update({
            where: {
            id: account.id,
            },
            data: {
            balance: {
                increment: 
                user.employmentType === "EMPLOYED" ? user.salary! : 0,
            },
            },
        });


    });

    res.status(HttpStatus.OK).json(resp.success("Salary cycle successful"));
});

//repay loan emi
export const loanEMI = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Missing required fields");
  }

  //get the loan emi amounts for the user
  const loans = await prisma.loan.findMany({
    where: {
      userId: userId as string,
    },
  });

  // sum the emi
  let totalEMI = 0;
  loans.forEach((loan) => {
    totalEMI += loan.emi;
  });

  //get the user account
  const user = await prisma.user.findUnique({
    where: {
      id: userId as string,
    },
    include: {
      accounts: true,
    },
  });

  if (!user || user.accounts.length === 0) {
    throw new ApiError(HttpStatus.NOT_FOUND, "User or user accounts not found");
  }

  //check if the user has enough balance to repay the loan emi
  if (user.accounts[0].balance < totalEMI) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "Insufficient balance to repay loan emi"
    );
  }

  //repay the loan emi
  const account = await prisma.bankAccount.update({
    where: {
      id: user.accounts[0].id,
    },
    data: {
      balance: {
        decrement: totalEMI,
      },
    },
  });

  res
    .status(HttpStatus.OK)
    .json(resp.success(`Loan EMI of ${user.name} repaid successfully`));
});

export const simulate = asyncHandler(async (req: Request, res: Response) => {
  //get the user accounts
  const users = await prisma.user.findMany({
    include: {
      accounts: true,
    },
  });

  if (!users) {
    throw new ApiError(HttpStatus.NOT_FOUND, "Users not found");
  }

  //simulate transactions for each user
  users.forEach(async (user) => {
    const account = user.accounts[0];
    if (account.balance < 1000) {
      await prisma.bankAccount.update({
        where: {
          id: account.id,
        },
        data: {
          balance: {
            increment: 10000,
          },
        },
      });
    }
  });

  //simulate transactions for each user
  users.forEach(async (user) => {
    const account = user.accounts[0];
    if (account.balance > 10000) {
      await prisma.bankAccount.update({
        where: {
          id: account.id,
        },
        data: {
          balance: {
            decrement: 1000,
          },
        },
      });
    }
  });

  //simulate transactions between users
  for (let i = 0; i < users.length; i++) {
    const fromAccount = users[i].accounts[0];
    const toAccount = users[(i + 1) % users.length].accounts[0];
    await processTransaction(fromAccount.id, toAccount.id, 1000);
  }

  res.status(HttpStatus.OK).json(resp.success("Simulation successful"));
});

const processTransaction = async (
  fromAccountId: string,
  toAccountId: string,
  amount: number
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
    //check the business income of each user
    const users = await prisma.user.findMany({
      where: {
        employmentType: "BUSINESS",
      },
      include: {
        accounts: true,
      },
    });

    if (!users) {
      throw new ApiError(HttpStatus.NOT_FOUND, "Business users not found");
    }

    //simulate transactions for each business user income/30
    users.forEach(async (user) => {
      const account = user.accounts[0];
      if (account.balance < user.businessIncome! / 30) {
        await prisma.bankAccount.update({
          where: {
            id: account.id,
          },
          data: {
            balance: {
              increment: user.businessIncome! / 30,
            },
          },
        });
      }
    });

    res.status(HttpStatus.OK).json(resp.success("Revenue generation successful"));
});

export const simulateMonthlyExpenses = asyncHandler(async (req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    include: { accounts: true },
  });

  for (const user of users) {
    if (!user.accounts.length) continue;
    const account = user.accounts[0];
    
    // Simulate random monthly expenses between 20% to 40% of account balance
    const expensePercentage = Math.random() * (0.4 - 0.2) + 0.2;
    const expenseAmount = account.balance * expensePercentage;

    if (account.balance >= expenseAmount) {
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

  res.status(HttpStatus.OK).json(resp.success("Monthly expenses simulation completed"));
});
