'use client';
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
import Image from 'next/image';
import { PinContext } from '@/context/PinContext';

interface MenuItem {
  id: number;
  name: string;
  itemNumber: string;
  imageUrl?: string;
  price: number;
}

function ItemList() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [editUploading, setEditUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);
  const { adminModeOn } = useContext(PinContext);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch('/api/menu-item');
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const sortedItems = items.sort(
    (a, b) => Number(b.itemNumber) - Number(a.itemNumber),
  );

  const filtered = sortedItems.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.itemNumber.toLowerCase().includes(search.toLowerCase()),
  );

  // Delete logic
  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch('/api/menu-item', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteId }),
    });
    if (res.ok) {
      toast.success('Item deleted');
      setDeleteId(null);
      fetchItems();
    } else {
      toast.error('Failed to delete item');
    }
  };

  // Edit logic
  const editForm = useForm<MenuItem>({
    defaultValues: editItem || {
      id: 0,
      name: '',
      itemNumber: '',
      imageUrl: '',
      price: 0,
    },
    values: editItem || undefined,
  });

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setEditImageFile(file);
    setEditUploadError(null);
    if (file) {
      setEditImagePreview(URL.createObjectURL(file));
    } else {
      setEditImagePreview(null);
    }
  };

  async function uploadToImgbb(file: File): Promise<string> {
    const apiKey = 'ab899a57167a081711e9b5fb6570657b'; // your imgbb API key
    const formData = new FormData();
    formData.append('image', file);
    setEditUploading(true);
    setEditUploadError(null);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.error?.message || 'Image upload failed');
      return data.data.url;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setEditUploadError(err.message || 'Image upload failed');
        throw err;
      } else {
        setEditUploadError('Image upload failed');
        throw new Error('Image upload failed');
      }
    } finally {
      setEditUploading(false);
    }
  }

  const handleEdit = async (values: MenuItem) => {
    try {
      let imageUrl = values.imageUrl;
      if (editImageFile) {
        imageUrl = await uploadToImgbb(editImageFile);
      }
      const price =
        typeof values.price === 'string'
          ? parseFloat(values.price)
          : values.price;
      const res = await fetch('/api/menu-item', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, imageUrl, price }),
      });
      if (res.ok) {
        toast.success('Item updated');
        setEditItem(null);
        setEditImageFile(null);
        setEditImagePreview(null);
        fetchItems();
      } else {
        toast.error('Failed to update item');
      }
    } finally {
      // error already handled in uploadToImgbb
    }
  };

  return (
    <div className="w-full mt-8">
      <Input
        placeholder="Search by name or item number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-muted-foreground">
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground">
            No items found.
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col items-center p-4 relative overflow-visible"
            >
              {/* Item Number Badge - Positioned at top-right corner */}
              <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold shadow-md z-10">
                {item.itemNumber}
              </div>

              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md mb-2 w-30 h-30 object-cover"
                />
              ) : (
                <div className="w-30 h-30 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 mb-2">
                  <span className="text-2xl">🍽️</span>
                </div>
              )}
              <div className="font-semibold text-lg text-center mt-2">
                {item.name}
              </div>
              <div className=" font-medium text-primary mb-2">
                {item.price.toFixed(2)}
              </div>
              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  disabled={!adminModeOn}
                  size="sm"
                  onClick={() => setEditItem(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  disabled={!adminModeOn}
                  size="sm"
                  onClick={() => setDeleteId(item.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this item?</div>
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
      {/* Edit Dialog */}
      <Dialog
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEdit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="itemNumber"
                rules={{ required: 'Item Number is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    {/* Show current or new preview */}
                    {(editImagePreview || field.value) && (
                      <Image
                        src={editImagePreview || field.value || ''}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="mt-2 w-24 h-24 object-cover rounded-md border"
                      />
                    )}
                    <Input
                      className="mt-2"
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                    />
                    {editUploadError && (
                      <div className="text-destructive text-sm mt-1">
                        {editUploadError}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="price"
                rules={{
                  required: 'Price is required',
                  min: { value: 0.01, message: 'Price must be positive' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={editUploading}>
                  {editUploading ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ItemList;
