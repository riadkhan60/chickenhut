'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// Updated to use 12-hour format
function formatDate(date: Date | string | null): string {
  if (!date) return '';

  // Convert the DB date to a Date object
  const dateObj = new Date(date);

  // Convert to Bangladesh timezone
  const bangladeshDate = toZonedTime(dateObj, 'Asia/Dhaka');

  // Format using 12-hour clock with AM/PM
  return format(bangladeshDate, 'dd/MM/yyyy hh:mm a');
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

export default function BillingTableToday() {
  const [todayOrders, setTodayOrders] = useState<OrderTable[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    // Get today's date in Bangladesh time zone
    const now = new Date();
    const bangladeshTime = toZonedTime(now, 'Asia/Dhaka');
    const today = format(bangladeshTime, 'yyyy-MM-dd');

    // Load today's orders
    fetchOrdersForDate(today);
  }, []);

  const fetchOrdersForDate = (date: string) => {
    setFetching(true);
    fetch(`/api/order/billing-history?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setTodayOrders(data.todayOrders || []);
        setFetching(false);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
        setFetching(false);
      });
  };

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
      <div className="mb-4">
        <h2 className="text-lg font-bold">Today&apos;s Orders</h2>
      </div>

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
            {todayOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  No orders found for today
                </td>
              </tr>
            ) : (
              todayOrders.map((order) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
