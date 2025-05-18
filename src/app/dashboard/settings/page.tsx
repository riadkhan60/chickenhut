import Settings from '@/components/Dashboard/settings/settings';
import React from 'react'

function page() {
  return (
    <div className="p-8 ">
      <div className="text-2xl font-bold mb-4">Settings</div>
      <Settings />
    </div>
  );
}

export default page