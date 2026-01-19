'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteTicket } from '@/app/actions/ticket-actions';
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  clientName: string | null;
  createdAt: string;
}

export function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ticket?')) return;
    const result = await deleteTicket(id);
    if (result.success) {
      toast({ title: 'Deleted', description: 'Ticket deleted successfully' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete ticket' });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'Low': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-500/10 text-blue-500';
      case 'Completed': return 'bg-green-500/10 text-green-500';
      case 'Action Required': return 'bg-orange-500/10 text-orange-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                No tickets found.
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.title}</TableCell>
                <TableCell>{ticket.clientName || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border-0 ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`border-0 ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(ticket.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
