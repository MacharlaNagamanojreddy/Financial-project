import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cookies } from "next/headers";
import type { Expense, Goal, Profile } from "./types";

export type AppUser = {
  id: string;
  email?: string | null;
};

type LocalUserRecord = AppUser & {
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  profile: Profile;
  expenses: Expense[];
  goals: Goal[];
};

type LocalSessionRecord = {
  token: string;
  userId: string;
  createdAt: string;
};

type LocalDatabase = {
  users: LocalUserRecord[];
  sessions: LocalSessionRecord[];
};

const LOCAL_DATA_DIR = join(process.cwd(), ".local-data");
const LOCAL_DATA_FILE = join(LOCAL_DATA_DIR, "finance.json");
const LOCAL_SESSION_COOKIE = "northstar-local-session";

async function ensureLocalDatabase() {
  await mkdir(LOCAL_DATA_DIR, {
    recursive: true,
  });

  try {
    await access(LOCAL_DATA_FILE);
  } catch {
    const emptyDatabase: LocalDatabase = {
      users: [],
      sessions: [],
    };

    await writeFile(LOCAL_DATA_FILE, JSON.stringify(emptyDatabase, null, 2), "utf8");
  }
}

async function readLocalDatabase(): Promise<LocalDatabase> {
  await ensureLocalDatabase();
  const raw = await readFile(LOCAL_DATA_FILE, "utf8");

  return JSON.parse(raw) as LocalDatabase;
}

async function writeLocalDatabase(database: LocalDatabase) {
  await ensureLocalDatabase();
  await writeFile(LOCAL_DATA_FILE, JSON.stringify(database, null, 2), "utf8");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedPasswordHash: string) {
  const [salt, hash] = storedPasswordHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, 64);
  const targetHash = Buffer.from(hash, "hex");

  if (derivedKey.length !== targetHash.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, targetHash);
}

async function setLocalSession(userId: string) {
  const database = await readLocalDatabase();
  const token = randomBytes(32).toString("hex");
  const createdAt = new Date().toISOString();

  database.sessions = database.sessions.filter((session) => session.userId !== userId);
  database.sessions.push({
    token,
    userId,
    createdAt,
  });

  await writeLocalDatabase(database);

  const cookieStore = await cookies();
  cookieStore.set(LOCAL_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearLocalSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(LOCAL_SESSION_COOKIE)?.value;

  if (token) {
    const database = await readLocalDatabase();
    database.sessions = database.sessions.filter((session) => session.token !== token);
    await writeLocalDatabase(database);
  }

  cookieStore.delete(LOCAL_SESSION_COOKIE);
}

function buildProfile(input: {
  id: string;
  email: string;
  fullName: string;
  currentBalance: number;
  monthlyIncome: number;
  monthlyBudget: number;
  currency: string;
}): Profile {
  const timestamp = new Date().toISOString();

  return {
    id: input.id,
    email: input.email,
    full_name: input.fullName || null,
    current_balance: input.currentBalance,
    monthly_income: input.monthlyIncome,
    monthly_budget: input.monthlyBudget,
    currency: input.currency,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

export async function signUpLocal(input: {
  email: string;
  password: string;
  fullName: string;
  currentBalance: number;
  monthlyIncome: number;
  monthlyBudget: number;
  currency: string;
}) {
  const database = await readLocalDatabase();
  const email = normalizeEmail(input.email);
  const existingUser = database.users.find((user) => user.email === email);

  if (existingUser) {
    return {
      error: "An account with this email already exists.",
    };
  }

  const userId = randomUUID();
  const timestamp = new Date().toISOString();
  const profile = buildProfile({
    id: userId,
    email,
    fullName: input.fullName,
    currentBalance: input.currentBalance,
    monthlyIncome: input.monthlyIncome,
    monthlyBudget: input.monthlyBudget,
    currency: input.currency,
  });

  database.users.push({
    id: userId,
    email,
    passwordHash: hashPassword(input.password),
    createdAt: timestamp,
    updatedAt: timestamp,
    profile,
    expenses: [],
    goals: [],
  });

  await writeLocalDatabase(database);
  await setLocalSession(userId);

  return {
    user: {
      id: userId,
      email,
    } satisfies AppUser,
    profile,
  };
}

export async function signInLocal(input: { email: string; password: string }) {
  const database = await readLocalDatabase();
  const email = normalizeEmail(input.email);
  const userRecord = database.users.find((user) => user.email === email);

  if (!userRecord || !verifyPassword(input.password, userRecord.passwordHash)) {
    return {
      error: "Invalid email or password.",
    };
  }

  await setLocalSession(userRecord.id);

  return {
    user: {
      id: userRecord.id,
      email: userRecord.email,
    } satisfies AppUser,
    profile: userRecord.profile,
  };
}

export async function getLocalViewer(): Promise<{
  user: AppUser | null;
  profile: Profile | null;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get(LOCAL_SESSION_COOKIE)?.value;

  if (!token) {
    return {
      user: null,
      profile: null,
    };
  }

  const database = await readLocalDatabase();
  const session = database.sessions.find((item) => item.token === token);

  if (!session) {
    cookieStore.delete(LOCAL_SESSION_COOKIE);

    return {
      user: null,
      profile: null,
    };
  }

  const userRecord = database.users.find((user) => user.id === session.userId);

  if (!userRecord) {
    database.sessions = database.sessions.filter((item) => item.token !== token);
    await writeLocalDatabase(database);
    cookieStore.delete(LOCAL_SESSION_COOKIE);

    return {
      user: null,
      profile: null,
    };
  }

  return {
    user: {
      id: userRecord.id,
      email: userRecord.email,
    },
    profile: userRecord.profile,
  };
}

export async function getLocalFinanceSnapshot(userId: string) {
  const database = await readLocalDatabase();
  const userRecord = database.users.find((user) => user.id === userId);

  return {
    profile: userRecord?.profile ?? null,
    expenses: userRecord?.expenses ?? [],
    goals: userRecord?.goals ?? [],
    error: null,
  };
}

export async function addLocalExpense(
  userId: string,
  input: {
    amount: number;
    category: string;
    date: string;
    note?: string | null;
  },
) {
  const database = await readLocalDatabase();
  const userRecord = database.users.find((user) => user.id === userId);

  if (!userRecord) {
    return {
      error: "Your session has expired. Sign in again.",
    };
  }

  const timestamp = new Date().toISOString();
  const expense: Expense = {
    id: randomUUID(),
    user_id: userId,
    amount: input.amount,
    category: input.category,
    date: input.date,
    note: input.note?.trim() || null,
    created_at: timestamp,
  };

  userRecord.expenses.unshift(expense);
  userRecord.profile = {
    ...userRecord.profile,
    current_balance: Number(userRecord.profile.current_balance ?? 0) - input.amount,
    updated_at: timestamp,
  };
  userRecord.updatedAt = timestamp;

  await writeLocalDatabase(database);

  return {
    expense,
  };
}

export async function createLocalGoal(
  userId: string,
  input: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  },
) {
  const database = await readLocalDatabase();
  const userRecord = database.users.find((user) => user.id === userId);

  if (!userRecord) {
    return {
      error: "Your session has expired. Sign in again.",
    };
  }

  const timestamp = new Date().toISOString();
  const goal: Goal = {
    id: randomUUID(),
    user_id: userId,
    name: input.name,
    target_amount: input.targetAmount,
    current_amount: input.currentAmount,
    deadline: input.deadline,
    created_at: timestamp,
    updated_at: timestamp,
  };

  userRecord.goals.push(goal);
  userRecord.updatedAt = timestamp;

  await writeLocalDatabase(database);

  return {
    goal,
  };
}

export async function addLocalGoalContribution(
  userId: string,
  goalId: string,
  amount: number,
) {
  const database = await readLocalDatabase();
  const userRecord = database.users.find((user) => user.id === userId);

  if (!userRecord) {
    return {
      error: "Your session has expired. Sign in again.",
    };
  }

  const goal = userRecord.goals.find((item) => item.id === goalId);

  if (!goal) {
    return {
      error: "Goal not found.",
    };
  }

  const timestamp = new Date().toISOString();
  goal.current_amount = Math.min(
    Number(goal.target_amount ?? 0),
    Number(goal.current_amount ?? 0) + amount,
  );
  goal.updated_at = timestamp;
  userRecord.updatedAt = timestamp;

  await writeLocalDatabase(database);

  return {
    goal,
  };
}

export async function updateLocalProfile(
  userId: string,
  input: {
    email: string;
    fullName: string;
    currentBalance: number;
    monthlyIncome: number;
    monthlyBudget: number;
    currency: string;
  },
) {
  const database = await readLocalDatabase();
  const userRecord = database.users.find((user) => user.id === userId);

  if (!userRecord) {
    return {
      error: "Your session has expired. Sign in again.",
    };
  }

  const timestamp = new Date().toISOString();
  userRecord.profile = {
    ...userRecord.profile,
    email: normalizeEmail(input.email),
    full_name: input.fullName,
    current_balance: input.currentBalance,
    monthly_income: input.monthlyIncome,
    monthly_budget: input.monthlyBudget,
    currency: input.currency,
    updated_at: timestamp,
  };
  userRecord.email = normalizeEmail(input.email);
  userRecord.updatedAt = timestamp;

  await writeLocalDatabase(database);

  return {
    profile: userRecord.profile,
  };
}
