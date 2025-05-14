'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

interface MenuItemFormValues {
  name: string;
  itemNumber: string;
  imageUrl?: string;
  price: number;
}

export function MenuItemForm({ onItemAdded }: { onItemAdded?: () => void }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const form = useForm<MenuItemFormValues>({
    defaultValues: {
      name: '',
      itemNumber: '',
      imageUrl: '',
      price: 0,
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { isSubmitting },
  } = form;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setUploadError(null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  async function uploadToImgbb(file: File): Promise<string> {
    const apiKey = 'ab899a57167a081711e9b5fb6570657b'; // <-- Replace with your imgbb API key
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setUploadError(null);
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
        setUploadError(err.message || 'Image upload failed');
        throw err;
      } else {
        setUploadError('Image upload failed');
        throw new Error('Image upload failed');
      }
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: MenuItemFormValues) {
    try {
      let imageUrl = values.imageUrl;
      if (imageFile) {
        imageUrl = await uploadToImgbb(imageFile);
      }
      // Convert price to number
      const price =
        typeof values.price === 'string'
          ? parseFloat(values.price)
          : values.price;
      const res = await fetch('/api/menu-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, imageUrl, price }),
      });
      const result = await res.json();
      if (!res.ok) {
        if (result.error && result.error.code === 'P2002') {
          setError('itemNumber', {
            type: 'manual',
            message: 'item number already exists',
          });
        } else {
          toast.error(result.error || 'Failed to create menu item');
        }
        return;
      }
      toast.success('Menu item created!');
      reset();
      setImageFile(null);
      setImagePreview(null);
      if (onItemAdded) onItemAdded();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || 'Something went wrong');
      } else {
        toast.error('An unknown error occurred');
      }
    }
  }

  return (
    <Card className="w-full mx-auto mt-8 p-8 shadow-lg border rounded-xl">
      <h2 className="text-xl font-medium mb-6 text-primary">Add Menu Item</h2>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Chicken Biryani" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="itemNumber"
            rules={{ required: 'Item Number is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Number</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 101" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <FormLabel>Image</FormLabel>
            <Input
              className="mt-2"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Preview"
                width={96}
                height={96}
                className="mt-2 w-24 h-24 object-cover rounded-md border"
              />
            )}
            {uploadError && (
              <div className="text-destructive text-sm mt-1">{uploadError}</div>
            )}
          </div>
          <FormField
            control={control}
            name="price"
            rules={{
              required: 'Price is required',
              min: { value: 0.01, message: 'Price must be positive' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 12.99"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || uploading}
          >
            {isSubmitting || uploading ? 'Adding...' : 'Add Item'}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
