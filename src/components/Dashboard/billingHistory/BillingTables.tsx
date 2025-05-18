'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

function formatDate(date: Date | string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleString();
}

interface OrderItem {
  id: number;
  menuItem: { name: string; itemNumber: string };
  quantity: number;
  price: number;
}

interface OrderTable {
  id: number;
  isParcel: boolean;
  table: { number: string } | null;
  total: number;
  createdAt: string;
  completedAt: string | null;
  orderItems: OrderItem[];
}

export default function BillingTables() {
  const [todayOrders, setTodayOrders] = useState<OrderTable[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    const today = new Date().toISOString().slice(0, 10);
    fetch(`/api/order/billing-history?date=${today}`)
      .then((res) => res.json())
      .then((data) => {
        setTodayOrders(data.todayOrders || []);
        setFetching(false);
      });
  }, []);

  if (fetching) {
    return <div className="">Loading orders...</div>;
  }

  const handleCustomerPrint = async (orderId: number) => {
    try {
      await fetch('/api/print-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, type: 'customer' }),
      });
      toast.success('Sent to customer printer!');
    } catch {
      toast.error('Failed to send to customer printer!');
    }
  };

  return (
    <div className="">
      <h2 className="text-lg font-bold mb-2 text-center">
        Today&apos;s Orders
      </h2>
      <div className="overflow-x-auto w-full">
        <table className="min-w-[700px] w-full border border-slate-300 rounded-lg bg-white text-sm sm:text-base">
          <thead className="bg-slate-100">
            <tr>
              <th className="border px-2 py-2 text-center">Order ID</th>
              <th className="border px-2 py-2 text-center">Table</th>
              <th className="border px-2 py-2 text-left">Items</th>
              <th className="border px-2 py-2 text-center">Total</th>
              <th className="border px-2 py-2 text-center">Created At</th>
              <th className="border px-2 py-2 text-center">Completed At</th>
              <th className="border px-2 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {todayOrders.map((order) => (
              <tr key={order.id} className="even:bg-slate-50">
                <td className="border px-2 py-2 text-center align-middle">
                  {order.id}
                </td>
                <td className="border px-2 py-2 text-center align-middle">
                  {order.isParcel ? 'Parcel' : order.table?.number}
                </td>
                <td className="border px-2 py-2 align-top break-words max-w-[180px]">
                  <ul className="list-disc pl-4">
                    {order.orderItems.map((item) => (
                      <li
                        key={item.id}
                        className="whitespace-normal break-words"
                      >
                        {item.menuItem.name} (#{item.menuItem.itemNumber}) x
                        {item.quantity} - {item.price}
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="border px-2 py-2 text-center align-middle">
                  {order.total}
                </td>
                <td className="border px-2 py-2 text-center align-middle whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>
                <td className="border px-2 py-2 text-center align-middle whitespace-nowrap">
                  {formatDate(order.completedAt)}
                </td>
                <td className="border px-2 py-2 text-center align-middle">
                  <button
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs sm:text-base"
                    onClick={() => handleCustomerPrint(order.id)}
                  >
                    Print Customer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
