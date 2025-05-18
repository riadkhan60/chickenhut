
import BillingTables from '@/components/Dashboard/billingHistory/BillingTables';
import React from 'react'

function page() {
  return (
    <div className="p-8 ">
      <div className="text-2xl font-bold mb-4">Billing History</div>
      <BillingTables />
    </div>
  );
}

export default page