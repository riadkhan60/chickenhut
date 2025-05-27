'use client';
import React, { useEffect, useState } from 'react';

interface TableSale {
  tableNumber: string;
  total: number;
}

interface StatementData {
  totalSale: number;
  totalOrders: number;
  tableSales: TableSale[];
  date?: string;
}

interface StatementProps {
  onRemove: () => void;
}

export default function Statement({ onRemove }: StatementProps) {
  const [data, setData] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const printStatement = async () => {
    if (!data) return;
    try {
      const response: Response = await fetch('/api/print-route/print-bill', {
        method: 'POST',
        body: JSON.stringify({
          statement: { ...data },
        }),
      });
      if (!response.ok) {
        setError('Failed to print statement');
        return;
      }
      const result: { success?: boolean; message?: string; error?: string } =
        await response.json();
      console.log(result);
    } catch {
      setError('Failed to print statement');
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/statement/today')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch statement');
        return res.json();
      })
      .then((data: StatementData) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="">Loading statement...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">
          Date:{' '}
          {data.date ||
            new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })}
        </h1>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold ">Today&apos;s Statement</h2>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          <div className="text-lg font-semibold">
            Total Sale:{' '}
            <span className="text-blue-700">{data.totalSale.toFixed(0)}</span>{' '}
            tk
          </div>
          <div className="text-lg font-semibold">
            Total Orders:{' '}
            <span className="text-blue-700">{data.totalOrders}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={printStatement}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Print statement
          </button>
          <button
            onClick={onRemove}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Hide Statement
          </button>
        </div>
      </div>
    </div>
  );
}
