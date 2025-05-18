import PutPin from '@/components/Dashboard/Statement/PutPin';
import React from 'react';

export default function StatementPage() {
  return (
    <div className="p-8">
      <div className="text-2xl font-bold mb-4">Statement</div>
      <div className="">
        <PutPin />
      </div>
    </div>
  );
}
