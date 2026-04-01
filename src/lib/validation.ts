import { z } from "zod";
import { EXPENSE_CATEGORIES, SUPPORTED_CURRENCIES } from "./constants";
import type { FormState } from "./types";

const stringSchema = (min: number, max: number, message: string) =>
  z.string().trim().min(min, message).max(max, message);

const numberFromForm = (schema: z.ZodNumber) =>
  z.preprocess((value) => {
    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) {
        return undefined;
      }

      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : value;
    }

    return value;
  }, schema);

const dateField = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Enter a valid date.");

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signUpSchema = loginSchema.extend({
  fullName: stringSchema(2, 80, "Enter your full name."),
  currentBalance: numberFromForm(
    z.number().min(-1_000_000, "Balance is too low.").max(100_000_000, "Balance is too high."),
  ).default(0),
  monthlyIncome: numberFromForm(
    z.number().min(0, "Income cannot be negative.").max(100_000_000, "Income is too high."),
  ).default(0),
  monthlyBudget: numberFromForm(
    z.number().min(0, "Budget cannot be negative.").max(100_000_000, "Budget is too high."),
  ).default(0),
  currency: z.enum(SUPPORTED_CURRENCIES).default("USD"),
});

export const expenseSchema = z.object({
  amount: numberFromForm(
    z.number().positive("Amount must be greater than zero.").max(1_000_000, "Amount is too high."),
  ),
  category: z.enum(EXPENSE_CATEGORIES),
  date: dateField,
  note: z.string().trim().max(200, "Keep the note under 200 characters.").optional(),
});

export const goalSchema = z.object({
  name: stringSchema(2, 80, "Goal name must be between 2 and 80 characters."),
  targetAmount: numberFromForm(
    z.number().positive("Target amount must be greater than zero.").max(100_000_000, "Target is too high."),
  ),
  currentAmount: numberFromForm(
    z.number().min(0, "Current amount cannot be negative.").max(100_000_000, "Current amount is too high."),
  ).default(0),
  deadline: dateField.refine((value) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return new Date(value) >= today;
  }, "Pick today or a future date."),
});

export const goalContributionSchema = z.object({
  goalId: z.string().uuid("Choose a valid goal."),
  amount: numberFromForm(
    z.number().positive("Contribution must be greater than zero.").max(100_000_000, "Contribution is too high."),
  ),
});

export const profileSchema = z.object({
  fullName: stringSchema(2, 80, "Enter your full name."),
  currentBalance: numberFromForm(
    z.number().min(-1_000_000, "Balance is too low.").max(100_000_000, "Balance is too high."),
  ),
  monthlyIncome: numberFromForm(
    z.number().min(0, "Income cannot be negative.").max(100_000_000, "Income is too high."),
  ),
  monthlyBudget: numberFromForm(
    z.number().min(0, "Budget cannot be negative.").max(100_000_000, "Budget is too high."),
  ),
  currency: z.enum(SUPPORTED_CURRENCIES),
});

export function toFormErrorState(
  error: z.ZodError,
  message = "Please review the highlighted fields.",
): FormState {
  return {
    status: "error",
    message,
    fieldErrors: error.flatten().fieldErrors,
  };
}
