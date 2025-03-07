import dotenv from "dotenv";

dotenv.config();

interface EnvVars {
  PORT: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
}

const validateEnv = (): EnvVars => {
  const requiredVars = ["PORT", "DATABASE_URL", "JWT_SECRET"] as const;

  type EnvVars = {
    [K in (typeof requiredVars)[number]]: string;
  };

  const envVars = {} as EnvVars;
  const missing: string[] = [];
  console.log("> Loading environment variables... from .env file");

  for (const key of requiredVars) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    } else {
      envVars[key] = value;
    }
  }

  if (missing.length > 0) {
    console.error(
      "> ❌ Invalid/Missing environment variables:",
      missing.join(", ")
    );
    process.exit(1);
  }

  return envVars;
};

export const { PORT, DATABASE_URL, JWT_SECRET } = validateEnv();
