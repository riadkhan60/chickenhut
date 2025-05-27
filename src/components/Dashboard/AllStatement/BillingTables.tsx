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

export default function BillingTables({ onRemove }: { onRemove: () => void }) {
  const [todayOrders, setTodayOrders] = useState<OrderTable[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    // Get today's date in Bangladesh time zone to initialize the date picker
    const now = new Date();
    const bangladeshTime = toZonedTime(now, 'Asia/Dhaka');
    const today = format(bangladeshTime, 'yyyy-MM-dd');
    setSelectedDate(today);

    // Load today's orders initially
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchOrdersForDate(newDate);
  };

  // Go to previous day
  const goToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const newDate = format(currentDate, 'yyyy-MM-dd');
    setSelectedDate(newDate);
    fetchOrdersForDate(newDate);
  };

  // Go to next day
  const goToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const newDate = format(currentDate, 'yyyy-MM-dd');
    setSelectedDate(newDate);
    fetchOrdersForDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    const now = new Date();
    const bangladeshTime = toZonedTime(now, 'Asia/Dhaka');
    const today = format(bangladeshTime, 'yyyy-MM-dd');
    setSelectedDate(today);
    fetchOrdersForDate(today);
  };

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

  const printAllOrders = async () => {
    try {
      // Create statement-like structure from the selected day's orders
      const totalSale = todayOrders.reduce(
        (sum, order) => sum + order.total,
        0,
      );

      const statement = {
        totalSale,
        totalOrders: todayOrders.length,
        date: selectedDate,
        orders: todayOrders,
      };

      const response = await fetch('/api/print-route/print-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement }),
      });

      if (!response.ok) {
        toast.error('Failed to print orders');
        return;
      }

      toast.success('Sent orders to printer!');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print orders');
    }
  };

  if (fetching) {
    return <div className="">Loading orders...</div>;
  }

  return (
    <div className="">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">Orders History</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onRemove}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Hide Statement
            </button>
            {todayOrders.length > 0 && (
              <button
                onClick={printAllOrders}
                className=" bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Print All Orders
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center ">
          <button
            onClick={goToPreviousDay}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300"
            title="Previous Day"
          >
            ← Prev
          </button>

          <button
            onClick={goToToday}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            title="Go to Today"
          >
            Today
          </button>

          <button
            onClick={goToNextDay}
            className="bg-gray-200 p-2 rounded hover:bg-gray-300"
            title="Next Day"
          >
            Next →
          </button>

          <label htmlFor="dateSelect" className="font-medium ml-4">
            Select Date:
          </label>
          <input
            id="dateSelect"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border rounded px-2 py-1"
          />
        </div>
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
                  No orders found for this date
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

      {todayOrders.length > 0 && (
        <div className="mt-4 text-right">
          <p className="font-bold">
            Total Orders: {todayOrders.length} | Total Amount:{' '}
            {todayOrders.reduce((sum, order) => sum + order.total, 0)} tk
          </p>
        </div>
      )}
    </div>
  );
}
