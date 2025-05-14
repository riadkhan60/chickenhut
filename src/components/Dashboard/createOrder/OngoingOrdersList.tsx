/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react'; // For loading spinner
import { useTranslations } from 'next-intl';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function OngoingOrdersList({
  onSelectOrder,
  selectedOrderId, // To know which order is currently being edited
}: {
  onSelectOrder: (order: any) => void;
  selectedOrderId: number | null;
}) {
  const {
    data: orders,
    error,
    isLoading,
  } = useSWR(
    '/api/order?status=ONGOING', // Fetch only ONGOING orders
    fetcher,
    { refreshInterval: 5000 }, // Refresh every 5 seconds
  );

  const t = useTranslations('OngoingOrdersList');

  const [search, setSearch] = useState('');

  console.log(orders);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10 text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        {t('loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 border border-red-300 rounded-md">
        {t('errorLoading')}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-8">
        {t('noOngoingOrders')}
      </div>
    );
  }

  // Filter orders by table number
  const filteredOrders = search.trim()
    ? orders.filter((order: any) =>
        (order.table?.number || 'p')
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      )
    : orders;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchTablePlaceholder')}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary text-base"
          aria-label={t('searchTablePlaceholder')}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-8">
            {t('noOrdersFound')}
          </div>
        ) : (
          filteredOrders.map((order: any) => (
            <Card
              key={order.id}
              className={`p-4 flex flex-col gap-3 transition-all duration-200 ease-in-out cursor-pointer hover:shadow-xl ${
                order.id === selectedOrderId
                  ? 'ring-2 ring-primary shadow-lg bg-primary-50 dark:bg-primary-900/30'
                  : 'bg-card dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
              onClick={() => onSelectOrder(order)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onSelectOrder(order);
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                    {order.isParcel ? t('parcel') : t('table')}{' '}
                    <span className="font-bold">
                      {order.table?.number || ''}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={
                    order.id === selectedOrderId ? 'secondary' : 'outline'
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectOrder(order);
                  }}
                  className="transition-colors"
                >
                  {order.id === selectedOrderId ? t('editing') : t('viewEdit')}
                </Button>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 space-y-1">
                {order.orderItems.length > 0 ? (
                  order.orderItems.slice(0, 3).map((oi: any) => (
                    <div key={oi.id} className="truncate">
                      {oi.menuItem?.itemNumber
                        ? `${oi.menuItem.itemNumber} - `
                        : ''}
                      {oi.menuItem?.name || 'Item'} x {oi.quantity}
                    </div>
                  ))
                ) : (
                  <p>{t('noItems')}</p>
                )}
                {order.orderItems.length > 3 && (
                  <p className="text-xs">{t('moreItems')}</p>
                )}
              </div>
              <div className="font-bold mt-auto pt-2 text-right text-base sm:text-lg text-gray-700 dark:text-gray-200">
                {t('total')}: ${Number(order.total).toFixed(2)}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
