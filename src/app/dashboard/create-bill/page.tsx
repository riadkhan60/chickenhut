/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useCallback } from 'react';
import CreateOrder from '@/components/Dashboard/createOrder/CreateOrder';
import OngoingOrdersList from '@/components/Dashboard/createOrder/OngoingOrdersList';

export default function CreateBillPage() {
  const [selectedOrderForEditing, setSelectedOrderForEditing] =
    useState<any>(null);

  const handleSelectOrder = useCallback(
    (order: any) => {
      if (selectedOrderForEditing?.id === order.id) {
        // If clicking the same order again, deselect it (optional behavior)
        // setSelectedOrderForEditing(null);
      } else {
        setSelectedOrderForEditing(order);
        // Scroll to the CreateOrder form for better UX on smaller screens
        const formElement = document.getElementById('create-order-section');
        formElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [selectedOrderForEditing],
  );

  const handleOrderSaved = useCallback(() => {
    setSelectedOrderForEditing(null); // Clear selection, form will reset
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 p-4 sm:p-6 lg:p-8 min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-900">
      <div
        className="flex-1 lg:max-w-xl xl:max-w-2xl flex flex-col"
        id="create-order-section"
      >
        <div className="flex-1 min-h-0">
          {/* Remove scrollable wrapper from CreateOrder */}
          <div
            className="rounded-lg shadow bg-white dark:bg-gray-800 p-2"
            aria-label="Order creation area"
          >
            <CreateOrder
              selectedOrder={selectedOrderForEditing}
              onOrderSaved={handleOrderSaved}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Ongoing Orders
        </h2>
        <div className="flex-1 min-h-0">
          {/* Make OngoingOrdersList scrollable */}
          <div
            className="h-full overflow-y-auto max-h-[calc(100vh-120px)] rounded-lg shadow bg-white dark:bg-gray-800 p-2"
            aria-label="Ongoing orders list"
          >
            <OngoingOrdersList
              onSelectOrder={handleSelectOrder}
              selectedOrderId={
                selectedOrderForEditing ? selectedOrderForEditing.id : null
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
