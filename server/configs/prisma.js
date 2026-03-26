import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// connection string from .env
const connectionString = `${process.env.DATABASE_URL}`;

// adapter setup
const adapter = new PrismaNeon({ connectionString });

// prisma client
const prisma = global.prisma || new PrismaClient({ adapter });

// prevent multiple instances in development
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma;
