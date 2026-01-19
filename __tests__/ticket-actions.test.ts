/**
 * @jest-environment node
 */
import { createTicket, getTickets, deleteTicket } from '@/app/actions/ticket-actions';

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrisma = {
    ticket: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('Ticket Actions', () => {
  it('should fetch tickets', async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.ticket.findMany.mockResolvedValueOnce([{ id: '1', title: 'Test' }]);

    const result = await getTickets();
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
  });

  it('should create a ticket', async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.ticket.create.mockResolvedValueOnce({ id: '1', title: 'New Ticket' });

    const result = await createTicket({ title: 'New Ticket' });
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('New Ticket');
  });
});
