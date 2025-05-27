import React from 'react'
import AllStatementPin from '@/components/Dashboard/AllStatement/AllStatementPin'
function page() {
  return (
    <div className="p-8 ">
      <div className="text-2xl font-bold mb-4">All Statement</div>
      <AllStatementPin />
    </div>
  );
}

export default page