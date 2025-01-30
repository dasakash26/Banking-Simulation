import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { ApiError, HttpStatus } from "../utils/apiError";
import resp from "../utils/apiRes";
import { ApiErrorResponse, ApiValidationError } from "../types/error.types";
import { createAccountSchema } from "../validators/account.validator";

const DEFAULT_BRANCH_CODE = "000007";

export const createAccount = async (req: Request, res: Response) => {
  try {
    const validatedData = createAccountSchema.parse(req.body);

    const userExists = await prisma.user.findUnique({
      where: { id: validatedData.userId }
    });

    if (!userExists) {
      throw new ApiError(HttpStatus.NOT_FOUND, "User not found");
    }

    let branchCode = validatedData.branchCode;
    let branchExists = await prisma.branch.findUnique({
      where: { code: branchCode }
    });

    if (!branchExists) {
      // Try to find default branch
      branchExists = await prisma.branch.findUnique({
        where: { code: DEFAULT_BRANCH_CODE }
      });

      if (!branchExists) {
        branchExists = await prisma.branch.create({
          data: {
            code: DEFAULT_BRANCH_CODE,
            name: "Default Branch",
            ifscCode: `BANK0${DEFAULT_BRANCH_CODE}`
          }
        });
        branchCode = DEFAULT_BRANCH_CODE;
      }
    }

    const account = await prisma.bankAccount.create({
      data: {
        ...validatedData,
        branchCode: branchCode,
        accountNumber: generateAccountNumber(),
        ifscCode: branchExists.ifscCode,
        balance: 0,
      },
    });

    res.status(HttpStatus.CREATED).json(resp.success(account));
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      const validationErrors: ApiValidationError = {
        success: false,
        message: "Invalid input data",
        data: error.errors.map(err => ({
          code: err.code,
          path: err.path,
          message: err.message
        }))
      };
      res.status(HttpStatus.BAD_REQUEST).json(validationErrors);
    } else if (error instanceof ApiError) {
      const apiError: ApiErrorResponse = {
        success: false,
        message: error.message
      };
      res.status(error.statusCode).json(apiError);
    } else {
      const unexpectedError: ApiErrorResponse = {
        success: false,
        message: "An unexpected error occurred. Please try again later."
      };
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(unexpectedError);
    }
  }
};

function generateAccountNumber(): string {
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return "AC" + Date.now().toString().slice(-6) + randomDigits;
}
