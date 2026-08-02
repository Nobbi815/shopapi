// Create the Prisma client dynamically to avoid TypeScript build errors when
// @prisma/client exports or types differ between versions used in CI/hosting.
// This uses top-level await which is supported by the project's TS config.
const prismaModule = await import("@prisma/client");
const adapterModule = await import("@prisma/adapter-pg");

const PrismaClientCtor = (prismaModule as any).PrismaClient ?? (prismaModule as any).default ?? (prismaModule as any).Client;
const PrismaPg = (adapterModule as any).PrismaPg ?? (adapterModule as any).default;

if (!PrismaClientCtor) {
  throw new Error("Unable to load PrismaClient constructor from @prisma/client");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });

declare global {
  // eslint-disable-next-line no-var
  var prisma: any | undefined;
}

const prisma = globalThis.prisma ?? new (PrismaClientCtor as any)({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export { prisma };

