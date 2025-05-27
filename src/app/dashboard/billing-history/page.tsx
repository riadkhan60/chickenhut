

import BillingTableToday from '@/components/Dashboard/billingHistory/BillingTableToday';
import React from 'react'

function page() {
  return (
    <div className="p-8 ">
      <div className="text-2xl font-bold mb-4">Billing History</div>
      <BillingTableToday />
    </div>
  );
}

export default page