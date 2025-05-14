import ItemList from '@/components/Dashboard/ItemList/ItemList';
import React from 'react';

export default function ItemListPage() {
  return (
    <div className="p-8 ">
      <div className="text-2xl font-bold mb-4">Item List</div>
      <ItemList />
    </div>
  );
}
