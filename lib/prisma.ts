import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '&connection_limit=5&pool_timeout=30&connection_timeout=60'
      }
    }
  }).$extends({
    query: {
      $allOperations({ operation, model, args, query }: { operation: string, model: string, args: any, query: any } ) {
        return retry(() => query(args), {
          retries: 3,
          minTimeout: 1000, // 1 second
          maxTimeout: 5000  // 5 seconds
        })
      },
    },
  })
}

// Retry function
const retry = async (fn: () => Promise<any>, options: { retries: number; minTimeout: number; maxTimeout: number }) => {
  let lastError
  for (let i = 0; i < options.retries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      lastError = error
      // Only retry on connection errors
      if (!error.message.includes("Can't reach database server")) {
        throw error
      }
      // Wait before retrying
      const timeout = Math.min(
        options.minTimeout * Math.pow(2, i),
        options.maxTimeout
      )
      await new Promise(resolve => setTimeout(resolve, timeout))
    }
  }
  throw lastError
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma 