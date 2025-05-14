'use client';

import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export type LatestAddedMenuRef = {
  refresh: () => void;
};

interface MenuItem {
  id: number;
  name: string;
  itemNumber: string;
  imageUrl?: string;
  price: number;
  createdAt: string;
}

const LatestAddedMenu = forwardRef<LatestAddedMenuRef>((props, ref) => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLatest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu-item');
      const data: MenuItem[] = await res.json();
      // Sort by createdAt descending and take the last 3
      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setItems(sorted.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refresh: fetchLatest,
  }));

  useEffect(() => {
    fetchLatest();
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mt-8 p-6 border rounded-xl shadow">
      <h3 className="text-lg font-medium mb-4 text-primary">
        Latest Added Menu Items
      </h3>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-muted-foreground text-center">No items found.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 p-3 bg-muted rounded-lg"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 object-cover rounded-md border"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400 border">
                  <span className="text-xl">🍽️</span>
                </div>
              )}
              <div className="flex-1">
                <div className="font-medium text-base">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  Item #{item.itemNumber}
                </div>
              </div>
              <div className="font-semibold text-primary">
                {item.price.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
});

LatestAddedMenu.displayName = 'LatestAddedMenu';

export default LatestAddedMenu;
