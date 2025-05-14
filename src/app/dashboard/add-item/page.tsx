'use client';

import React, { useRef } from 'react';
import { MenuItemForm } from '@/components/Dashboard/MenuItems/MenuItemForm';
import LatestAddedMenu, {
  LatestAddedMenuRef,
} from '@/components/Dashboard/MenuItems/LatestAddedMenu';

export default function AddItemPage() {
  const latestMenuRef = useRef<LatestAddedMenuRef>(null);

  return (
    <div className="p-8 ">
      <div className="text-2xl font-bold mb-4">Add Item</div>
      <div className="w-full flex justify-center  items-stretch max-md:flex-col gap-4">
        <MenuItemForm onItemAdded={() => latestMenuRef.current?.refresh()} />
        <LatestAddedMenu ref={latestMenuRef} />
      </div>
    </div>
  );
}
