import { PrismaClient } from '@prisma/client'

// Determine if we're in development mode
const isDev = process.env.NODE_ENV !== 'production';

// Create Prisma client with conditional logging
const prisma = new PrismaClient({
  log: isDev ? [{ emit: 'event', level: 'query' }] : [],
})

// Only set up query logging in development mode
if (isDev) {
  prisma.$on('query', (e: any) => {
    console.log(1,'Query: ' + e.query)
    console.log('Params: ' + e.params)
    console.log('Duration: ' + e.duration + 'ms')
  })
}

export default prisma
