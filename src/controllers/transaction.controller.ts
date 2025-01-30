import { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import { ApiError, HttpStatus } from "../utils/apiError";
import prisma from "../lib/prisma";
import apiRes from "../utils/apiRes";

//@ts-ignore
export const processTransaction = asyncHandler(async (req: Request, res: Response) => {
  const { fromAccountId, toAccountId, amount, mode } = req.body;

  if (!amount || amount <= 0) {
    throw new ApiError(HttpStatus.BAD_REQUEST, "Invalid amount");
  }

  if (!fromAccountId && !toAccountId) {
    throw new ApiError(
      HttpStatus.BAD_REQUEST,
      "At least one account ID is required"
    );
  }

  const transaction = await prisma.$transaction(async (tx) => {
    if (fromAccountId) {
      const fromAccount = await tx.bankAccount.findUnique({
        where: { id: fromAccountId },
        select: { balance: true },
      });

      if (!fromAccount) {
        throw new ApiError(HttpStatus.NOT_FOUND, "Source account not found");
      }

      if (fromAccount.balance < amount) {
        throw new ApiError(HttpStatus.BAD_REQUEST, "Insufficient balance");
      }

      await tx.bankAccount.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: amount } },
      });
    }

    if (toAccountId) {
      const toAccount = await tx.bankAccount.findUnique({
        where: { id: toAccountId },
        select: { balance: true },
      });

      if (!toAccount) {
        throw new ApiError(
          HttpStatus.NOT_FOUND,
          "Destination account not found"
        );
      }

      await tx.bankAccount.update({
        where: { id: toAccountId },
        data: { balance: { increment: amount } },
      });
    }

    return prisma.transaction.create({
      data: {
        fromAccountId,
        toAccountId,
        amount,
        mode,
      },
    });
  });

  res.status(201).json(apiRes.created(transaction, "Transaction successful"));
});
