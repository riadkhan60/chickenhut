/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import useSWR, { mutate } from 'swr';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react'; // For loading indicators

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MenuItem {
  id: number;
  name: string;
  itemNumber: string;
  price: number;
}

interface Table {
  id: number;
  number: string;
}

interface OrderItem {
  menuItemId: number;
  quantity: number;
  price: number;
  name: string;
  itemNumber: string;
}

export default function CreateOrder({
  selectedOrder,
  onOrderSaved,
}: {
  selectedOrder: any;
  onOrderSaved: () => void;
}) {
  const { data: tables = [], isLoading: isLoadingTables } = useSWR<Table[]>(
    '/api/table',
    fetcher,
  );
  const { data: menuItems = [], isLoading: isLoadingMenuItems } = useSWR<
    MenuItem[]
  >('/api/menu-item', fetcher);
  const { data: ongoingOrders = [] } = useSWR<any[]>(
    '/api/order?status=ONGOING',
    fetcher,
  );

  const [tableInput, setTableInput] = useState('');
  const [tableId, setTableId] = useState<number | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [menuItemInput, setMenuItemInput] = useState('');
  const [discount, setDiscount] = useState(0);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [status, setStatus] = useState<'ONGOING' | 'COMPLETED'>('ONGOING');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [isParcel, setIsParcel] = useState(false);
  const [prevTableInput, setPrevTableInput] = useState('');

  // Refs for focus management
  const tableInputRef = useRef<HTMLInputElement>(null);
  const menuItemInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);
  const itemQuantityInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = useTranslations('CreateOrder');

  useEffect(() => {
    itemQuantityInputRefs.current = itemQuantityInputRefs.current.slice(
      0,
      items.length,
    );
  }, [items.length]);

  // Populate form when editing or clearing
  useEffect(() => {
    if (selectedOrder) {
      setOrderId(selectedOrder.id);
      setTableId(selectedOrder.tableId || null);
      setDiscount(selectedOrder.discount || 0);
      setStatus(selectedOrder.status);
      setItems(
        selectedOrder.orderItems.map((oi: any) => ({
          menuItemId: oi.menuItemId,
          quantity: oi.quantity,
          price: oi.menuItem?.price || oi.price, // Prefer fresh price from menuItem if available
          name: oi.menuItem?.name || 'Unknown Item',
          itemNumber: oi.menuItem?.itemNumber || 'N/A',
        })),
      );
      const table = tables.find((t: Table) => t.id === selectedOrder.tableId);
      setTableInput(table ? table.number : '');
      setPrevTableInput(table ? table.number : '');
      setIsEditing(true);
      setIsParcel(!!selectedOrder.isParcel);
      // Don't auto-focus table input when editing, user might want to edit items first
    } else {
      setOrderId(null);
      setTableId(null);
      setTableInput('');
      setPrevTableInput('');
      setDiscount(0);
      setStatus('ONGOING');
      setItems([]);
      setMenuItemInput('');
      setIsEditing(false);
      setIsParcel(false);
      tableInputRef.current?.focus(); // Focus table input for new order
    }
  }, [selectedOrder, tables]); // Added tables dependency

  // When isParcel is checked, set tableInput to 'P', when unchecked, clear tableInput
  useEffect(() => {
    if (isParcel) {
      setTableInput('P');
      setTableId(null);
    } else if (!selectedOrder || !selectedOrder.isParcel) {
      setTableInput('');
      setTableId(null);
    }
    // If editing a parcel order, keep tableInput as 'P'
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isParcel]);

  const handleTableInputChange = (val: string) => {
    // If editing, check if the new table has an ongoing order (excluding this order)
    if (isEditing) {
      const foundTable = tables.find(
        (t: Table) => t.number.toLowerCase() === val.toLowerCase(),
      );
      if (foundTable) {
        // Check for ongoing order on this table (excluding current order)
        const hasOngoing = ongoingOrders.some(
          (order) =>
            order.tableId === foundTable.id &&
            order.id !== orderId &&
            order.status === 'ONGOING',
        );
        if (hasOngoing) {
          toast.error('This table already has an ongoing order.');
          setTableInput(prevTableInput); // revert
          return;
        } else {
          setTableInput(val);
          setTableId(foundTable.id);
          setPrevTableInput(val);
        }
      } else {
        setTableInput(val);
        setTableId(null);
      }
    } else {
      setTableInput(val);
      const foundTable = tables.find(
        (t: Table) => t.number.toLowerCase() === val.toLowerCase(),
      );
      if (foundTable) {
        setTableId(foundTable.id);
      } else {
        setTableId(null); // Allow creating new table if not found explicitly
      }
    }
  };

  // Helper function to set table and move focus to menu item input
  const processTableAndFocus = () => {
    const foundTable = tables.find(
      (t: Table) => t.number.toLowerCase() === tableInput.toLowerCase(),
    );
    if (foundTable) {
      setTableId(foundTable.id);
      // After setting table, move focus to menu item input
      setTimeout(() => menuItemInputRef.current?.focus(), 0);
      return true;
    } else if (tableInput.trim() !== '') {
      // Table doesn't exist, will be created on submit if input is not empty
      setTimeout(() => menuItemInputRef.current?.focus(), 0);
      return true;
    }
    return false;
  };

  const handleTableInputBlur = () => {
    processTableAndFocus();
  };

  // Handle Enter key press in table input to move focus to menu item input
  const handleTableInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter' && tableInput.trim()) {
      event.preventDefault();
      processTableAndFocus();
    }
  };

  const addMenuItemByNumber = useCallback(
    (itemNo: string) => {
      if (!itemNo.trim() || isLoadingMenuItems) return;
      const found = menuItems.find((mi) => mi.itemNumber === itemNo);
      if (found) {
        setItems((prevItems) => {
          const existingItemIndex = prevItems.findIndex(
            (i) => i.menuItemId === found.id,
          );
          if (existingItemIndex > -1) {
            // Item already exists, update quantity
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex].quantity += 1;
            // Focus existing item's quantity input
            setTimeout(
              () => itemQuantityInputRefs.current[existingItemIndex]?.focus(),
              0,
            );
            return updatedItems;
          } else {
            // Add new item
            const newItems = [
              ...prevItems,
              {
                menuItemId: found.id,
                quantity: 1,
                price: found.price,
                name: found.name,
                itemNumber: found.itemNumber,
              },
            ];
            // Focus new item's quantity input
            setTimeout(
              () => itemQuantityInputRefs.current[newItems.length - 1]?.focus(),
              0,
            );
            return newItems;
          }
        });
        setMenuItemInput(''); // Clear input after adding/updating
      } else {
        toast.error(`Menu item with number '${itemNo}' not found.`);
        setMenuItemInput('');
        menuItemInputRef.current?.focus();
      }
    },
    [menuItems, isLoadingMenuItems],
  );

  const handleMenuItemInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter' && menuItemInput.trim()) {
      event.preventDefault();
      addMenuItemByNumber(menuItemInput);
    }
  };

  const handleItemChange = (
    menuItemId: number,
    field: 'quantity' | 'price',
    value: number,
  ) => {
    setItems((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId
          ? {
              ...i,
              [field]:
                field === 'quantity' ? Math.max(1, value) : Math.max(0, value),
            }
          : i,
      ),
    );
  };

  const handleItemQuantityKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      // If this is the last quantity input, move focus to menu item input
      if (index === items.length - 1) {
        menuItemInputRef.current?.focus();
      } else {
        // Otherwise, move to the next quantity input
        itemQuantityInputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleRemoveItem = (menuItemId: number) => {
    setItems((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
    menuItemInputRef.current?.focus();
  };

  const calculatedTotal = items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );
  const finalTotal = calculatedTotal - discount;

  const handleSubmit = async (
    action: 'create' | 'print-kitchen' | 'print-customer',
  ) => {
    setActionInProgress(action);
    setIsSubmitting(true);

    let usedTableId = tableId;

    // If not parcel, check if table exists
    if (!isParcel) {
      if (!usedTableId && tableInput.trim()) {
        const existingTable = tables.find(
          (t: Table) =>
            t.number.toLowerCase() === tableInput.trim().toLowerCase(),
        );
        if (existingTable) {
          usedTableId = existingTable.id;
        } else {
          toast.error('Table does not exist.');
          setIsSubmitting(false);
          setActionInProgress(null);
          return;
        }
      }
      if (!usedTableId) {
        toast.error('Table is required. Please type a table number.');
        tableInputRef.current?.focus();
        setIsSubmitting(false);
        setActionInProgress(null);
        return;
      }
    }
    if (items.length === 0) {
      toast.error('At least one menu item is required.');
      menuItemInputRef.current?.focus();
      setIsSubmitting(false);
      setActionInProgress(null);
      return;
    }

    const orderData = {
      tableId: isParcel ? null : usedTableId,
      isParcel: !!isParcel,
      discount: Number(discount) || 0,
      total: finalTotal, // Use the client-calculated final total
      status:
        action === 'print-customer'
          ? 'COMPLETED'
          : status === 'COMPLETED'
          ? 'COMPLETED'
          : 'ONGOING',
      orderItems: items.map((i) => ({
        menuItemId: i.menuItemId,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    let orderRes;
    let orderPayload;

    if (isEditing && orderId) {
      orderPayload = { id: orderId, ...orderData };
      orderRes = await fetch('/api/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
    } else {
      orderPayload = orderData;
      orderRes = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
    }

    if (!orderRes.ok) {
      const errorData = await orderRes.json();
      toast.error(
        `Failed to save order: ${errorData.message || orderRes.statusText}`,
      );
      setIsSubmitting(false);
      setActionInProgress(null);
      return;
    }

    const savedOrder = await orderRes.json();

    if (action === 'print-kitchen' || action === 'print-customer') {
      try {
        const printRes = await fetch('/api/print-route', {
          // Ensure this is your actual print API endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: savedOrder.id, // Use the ID from the saved order response
            type: action === 'print-kitchen' ? 'kitchen' : 'customer',
          }),
        });
        if (!printRes.ok) {
          const printError = await printRes.json();
          toast.error(
            `Order saved, but failed to print: ${
              printError.message || 'Print error'
            }`,
          );
        } else {
          toast.success(
            `Order ${isEditing ? 'updated' : 'created'} and sent to ${
              action === 'print-kitchen' ? 'kitchen' : 'customer'
            } printer.`,
          );
        }
      } catch {
        toast.error(
          `Order saved, but printing failed. Check printer connection.`,
        );
      }
    } else {
      toast.success(
        isEditing
          ? 'Order updated successfully!'
          : 'Order created successfully!',
      );
    }

    mutate('/api/order?status=ONGOING'); // Revalidate ongoing orders
    if (orderData.status === 'COMPLETED') {
      mutate('/api/order?status=COMPLETED'); // Revalidate completed if it was marked so
    }
    resetForm();
    onOrderSaved(); // This should reset selectedOrder in parent, triggering useEffect to clear form
  };

  // Helper to reset the form
  const resetForm = () => {
    setOrderId(null);
    setTableId(null);
    setTableInput('');
    setDiscount(0);
    setStatus('ONGOING');
    setItems([]);
    setMenuItemInput('');
    setIsEditing(false);
    setIsParcel(false);
    setIsSubmitting(false);
    setActionInProgress(null);
    tableInputRef.current?.focus();
  };

  const isEffectivelyCompleted =
    status === 'COMPLETED' && selectedOrder?.status === 'COMPLETED';

  const filteredTables = tableInput
    ? tables.filter((t: Table) =>
        t.number.toLowerCase().includes(tableInput.toLowerCase()),
      )
    : tables; // Show all if input is empty for selection

  const filteredMenuItems = menuItemInput
    ? menuItems.filter(
        (mi: MenuItem) =>
          mi.itemNumber.toLowerCase().includes(menuItemInput.toLowerCase()) ||
          mi.name.toLowerCase().includes(menuItemInput.toLowerCase()),
      )
    : []; // Only show suggestions if typing

  // Check if there is an ongoing order for the selected table (when not editing)
  const hasOngoingOrderForTable =
    !isEditing &&
    tableId &&
    ongoingOrders.some(
      (order) => order.tableId === tableId && order.status === 'ONGOING',
    );

  return (
    <Card className="p-4 sm:p-6 mb-8 transition-all duration-300 ease-in-out relative">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-primary flex items-center">
        {isEditing
          ? t('editTable', { table: tableInput || '' })
          : t('createNewOrder')}
        {isEffectivelyCompleted && (
          <span className="ml-2 text-sm px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
            Completed
          </span>
        )}
      </h2>
      {!isEditing && hasOngoingOrderForTable && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
          There is already an ongoing order for this table. Please complete the
          previous order before creating a new one.
        </div>
      )}
      <div className="space-y-4">
        {/* Parcel Checkbox */}
        <div className="flex items-center mb-2">
          <input
            id="parcel-checkbox"
            type="checkbox"
            checked={isParcel}
            onChange={(e) => setIsParcel(e.target.checked)}
            className="mr-2 h-5 w-5"
          />
          <label
            htmlFor="parcel-checkbox"
            className="text-base font-medium select-none cursor-pointer"
          >
            {t('parcelOrder')}
          </label>
        </div>

        <div className="flex flex-row max-md:flex-col gap-4">
          {/* Table Input - Enhanced with Enter key handling */}
          <div>
            <label
              htmlFor="table-input"
              className="block mb-1 font-medium text-sm sm:text-base"
            >
              {t('tableNumber')}
            </label>
            <Input
              id="table-input"
              ref={tableInputRef}
              value={tableInput}
              onChange={(e) => handleTableInputChange(e.target.value)}
              onBlur={handleTableInputBlur}
              onKeyDown={handleTableInputKeyDown}
              placeholder={
                isLoadingTables ? t('loadingTables') : t('tablePlaceholder')
              }
              list="table-suggestions"
              disabled={
                isParcel ||
                isEffectivelyCompleted ||
                isSubmitting ||
                isLoadingTables
              }
              className="transition-colors duration-200 text-lg p-2"
              aria-label="Table number"
              title="Type or select the table number for this order"
            />

            {!isLoadingTables && (
              <datalist id="table-suggestions">
                {filteredTables.map((t: Table) => (
                  <option key={t.id} value={t.number} />
                ))}
              </datalist>
            )}
          </div>

          {/* Menu Item Input */}
          <div>
            <label
              htmlFor="menuitem-input"
              className="block mb-1 font-medium text-sm sm:text-base"
            >
              {t('addMenuItems')}
            </label>
            <Input
              id="menuitem-input"
              ref={menuItemInputRef}
              value={menuItemInput}
              onChange={(e) => setMenuItemInput(e.target.value)}
              onKeyDown={handleMenuItemInputKeyDown}
              onBlur={(e) => {
                if (menuItemInput.trim()) addMenuItemByNumber(e.target.value);
              }} // Add on blur if there's text
              placeholder={
                isLoadingMenuItems ? t('loadingMenu') : t('menuItemPlaceholder')
              }
              list="menuitem-suggestions"
              disabled={
                isEffectivelyCompleted ||
                isSubmitting ||
                isLoadingMenuItems ||
                (!isParcel && !tableId && !tableInput.trim())
              } // Enable if isParcel or table is selected
              className="transition-colors duration-200 text-lg p-2"
              aria-label="Add menu item by number or name"
              title="Type the item number or name, then press Enter to add"
            />
            {!isLoadingMenuItems && filteredMenuItems.length > 0 && (
              <datalist id="menuitem-suggestions">
                {filteredMenuItems.map((mi: MenuItem) => (
                  <option key={mi.id} value={mi.itemNumber}>
                    {mi.name} ({mi.itemNumber})
                  </option>
                ))}
              </datalist>
            )}
          </div>

          {/* Discount Input */}
          <div>
            <label
              htmlFor="discount-input"
              className="block mb-1 font-medium text-sm sm:text-base"
            >
              {t('discount')}
            </label>
            <Input
              id="discount-input"
              ref={discountInputRef}
              type="number"
              min={0}
              step={0.01}
              value={discount}
              disabled={isEffectivelyCompleted || isSubmitting}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Focus on Save Order button when Enter is pressed in discount field
                  const saveButton = document.querySelector(
                    'button[type="submit"]',
                  ) as HTMLButtonElement;
                  saveButton?.focus();
                }
              }}
              className="transition-colors duration-200 dark:bg-gray-700 dark:text-white text-lg p-2"
              placeholder="0.00"
              aria-label={t('discountInDollars')}
              title={t('discountTitle')}
            />
          </div>
        </div>

        {/* Items List - Enhanced with improved keyboard navigation */}
        {items.length > 0 && (
          <div
            className="space-y-3 mt-3 border p-3 rounded-md bg-slate-50 dark:bg-slate-800 max-h-56 overflow-y-auto"
            aria-label="Order items list"
          >
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              {t('orderItems')}
            </h3>
            {items.map((item, index) => (
              <div
                key={item.menuItemId}
                className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 rounded-md transition-all duration-200 ease-in-out ${
                  selectedOrder &&
                  selectedOrder.orderItems.find(
                    (oi: any) => oi.menuItemId === item.menuItemId,
                  )
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/50 shadow-sm'
                    : 'bg-white dark:bg-gray-700/50 border'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {item.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    (#{item.itemNumber})
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label
                    htmlFor={`quantity-${item.menuItemId}`}
                    className="sr-only"
                  >
                    Quantity for {item.name}
                  </label>
                  <Input
                    id={`quantity-${item.menuItemId}`}
                    type="number"
                    min={1}
                    aria-label={`Quantity for ${item.name}`}
                    className="w-24 border rounded p-2 text-center text-lg focus:ring-2 focus:ring-primary dark:bg-gray-600 dark:text-white"
                    value={item.quantity}
                    disabled={isEffectivelyCompleted || isSubmitting}
                    onChange={(e) =>
                      handleItemChange(
                        item.menuItemId,
                        'quantity',
                        Number(e.target.value),
                      )
                    }
                    onKeyDown={(e) => handleItemQuantityKeyDown(e, index)}
                    onFocus={(e) => e.target.select()}
                    ref={(el) => {
                      itemQuantityInputRefs.current[index] = el;
                    }}
                  />
                  <label
                    htmlFor={`price-${item.menuItemId}`}
                    className="sr-only"
                  >
                    Price for {item.name}
                  </label>
                  <Input
                    id={`price-${item.menuItemId}`}
                    type="number"
                    min={0}
                    step={0.01}
                    aria-label={`Price for ${item.name}`}
                    className="w-28 border rounded p-2 text-right text-lg focus:ring-2 focus:ring-primary dark:bg-gray-600 dark:text-white"
                    value={item.price.toFixed(2)}
                    disabled={isEffectivelyCompleted || isSubmitting}
                    onChange={(e) =>
                      handleItemChange(
                        item.menuItemId,
                        'price',
                        Number(e.target.value),
                      )
                    }
                    onFocus={(e) => e.target.select()}
                  />
                  {!isEffectivelyCompleted && !isSubmitting && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:bg-red-100 dark:hover:bg-red-700/50 text-lg"
                      onClick={() => handleRemoveItem(item.menuItemId)}
                      aria-label={`Remove ${item.name}`}
                      title="Remove item from order"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="absolute top-[10px] right-[10px]">
          <div className="font-bold text-lg sm:text-xl text-right">
            {t('subtotal')}:{' '}
            <span className="text-gray-600 dark:text-gray-300">
              {calculatedTotal.toFixed(2)}
            </span>
          </div>
          {discount > 0 && (
            <div className="font-medium text-md text-right text-orange-600 dark:text-orange-400">
              {t('discount')}: -{discount.toFixed(2)}
            </div>
          )}
          <div className="font-bold text-xl sm:text-2xl text-right text-primary">
            {t('total')}: {finalTotal.toFixed(2)}
          </div>
        </div>

        {/* Action Buttons - sticky at bottom for easy access */}
        <div className="flex flex-col sm:flex-row gap-2 mt-6 sticky bottom-0 bg-white dark:bg-slate-800 py-3 z-10 border-t border-slate-200 dark:border-slate-700">
          {(!isEffectivelyCompleted ||
            (isEditing && status !== 'COMPLETED')) && ( // Show create/update unless it's a view of a completed order
            <Button
              type="submit"
              onClick={() => handleSubmit('create')}
              disabled={
                isSubmitting ||
                items.length === 0 ||
                (!isParcel && !tableId && !tableInput.trim()) ||
                (!!hasOngoingOrderForTable && !isEditing)
              }
              className="flex-1 sm:flex-none text-lg h-20 py-3"
              aria-label={isEditing ? 'Update Order' : 'Save Ord aer'}
            >
              {isSubmitting && actionInProgress === 'create' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEditing ? t('updateOrder') : t('saveOrder')}
            </Button>
          )}
          {(!isEffectivelyCompleted || (isEditing && status !== 'COMPLETED')) &&
            items.length > 0 && (
              <Button
                variant="outline"
                onClick={() => handleSubmit('print-kitchen')}
                disabled={
                  isSubmitting ||
                  items.length === 0 ||
                  (!!hasOngoingOrderForTable && !isEditing)
                }
                className="flex-1 sm:flex-none text-lg py-3 h-20 bg-yellow-300"
                aria-label="Print Kitchen Order"
                title={t('printKitchenTitle')}
              >
                {isSubmitting && actionInProgress === 'print-kitchen' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t('printKitchen')}
              </Button>
            )}
          {items.length > 0 && ( // Always allow printing customer bill if items exist
            <Button
              variant={isEffectivelyCompleted ? 'default' : 'destructive'} // More prominent if completed
              onClick={() => handleSubmit('print-customer')}
              disabled={
                isSubmitting ||
                items.length === 0 ||
                (!!hasOngoingOrderForTable && !isEditing)
              }
              className="flex-1 sm:flex-none text-lg py-3 h-20 "
              aria-label="Print Customer Bill"
              title={t('printCustomerBillTitle')}
            >
              {isSubmitting && actionInProgress === 'print-customer' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isEffectivelyCompleted || status === 'COMPLETED'
                ? t('printCustomerBill')
                : t('finalizeAndPrintBill')}
            </Button>
          )}
        </div>
        {isEffectivelyCompleted && (
          <p className="text-sm text-center text-gray-500 mt-4">
            {t('orderCompletedNote')}
          </p>
        )}
      </div>
    </Card>
  );
}
