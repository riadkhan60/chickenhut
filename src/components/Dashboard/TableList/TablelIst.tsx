'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { PinContext } from '@/context/PinContext';

interface Table {
  id: number;
  number: string;
}

function TableList() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTable, setEditTable] = useState<Table | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { adminModeOn } = useContext(PinContext);

  const fetchTables = async () => {
    setLoading(true);
    const res = await fetch('/api/table');
    const data = await res.json();
    setTables(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Create Table
  const createForm = useForm<{ number: string }>({
    defaultValues: { number: '' },
  });

  const handleCreate = async (values: { number: string }) => {
    const res = await fetch('/api/table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      toast.success('Table created');
      createForm.reset();
      fetchTables();
    } else {
      toast.error('Failed to create table');
    }
  };

  // Edit Table
  const editForm = useForm<Table>({
    defaultValues: editTable || { id: 0, number: '' },
    values: editTable || undefined,
  });

  const handleEdit = async (values: Table) => {
    const res = await fetch('/api/table', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      toast.success('Table updated');
      setEditTable(null);
      fetchTables();
    } else {
      toast.error('Failed to update table');
    }
  };

  // Delete Table
  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch('/api/table', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteId }),
    });
    if (res.ok) {
      toast.success('Table deleted');
      setDeleteId(null);
      fetchTables();
    } else {
      toast.error('Failed to delete table');
    }
  };

  return (
    <div className="w-full  mt-8">
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-medium mb-4 text-primary">Create Table</h2>
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(handleCreate)}
            className="flex gap-4 items-end"
          >
            <FormField
              control={createForm.control}
              name="number"
              rules={{ required: 'Table number is required' }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Table Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!adminModeOn}>
              Add
            </Button>
          </form>
        </Form>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground">
            Loading...
          </div>
        ) : tables.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No tables found.
          </div>
        ) : (
          tables.map((table) => (
            <Card
              key={table.id}
              className="flex flex-col items-center p-6 relative"
            >
              <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-md z-10">
                {table.number}
              </div>
              <div className="font-semibold text-md mb-2 mt-4">
                Table #{table.number}
              </div>
              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  disabled={!adminModeOn}
                  size="sm"
                  onClick={() => setEditTable(table)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  disabled={!adminModeOn}
                  size="sm"
                  onClick={() => setDeleteId(table.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      {/* Edit Dialog */}
      <Dialog
        open={!!editTable}
        onOpenChange={(open) => !open && setEditTable(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEdit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="number"
                rules={{ required: 'Table number is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditTable(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this table?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TableList;
