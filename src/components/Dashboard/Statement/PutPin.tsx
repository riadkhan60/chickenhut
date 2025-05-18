'use client';
import React, { useContext, useState } from 'react';
import { PinContext } from '@/context/PinContext';
import { getSession } from 'next-auth/react';
import Statement from './Statement';


export default function PutPin() {
  const { pinValidated, validatePin, clearPinValidation } =
    useContext(PinContext);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Get user session
    const session = await getSession();
    if (!session?.user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    // Fetch user from API to get pin
    const res = await fetch(`/api/user/${session.user.id}`);
    if (!res.ok) {
      setError('Failed to fetch user');
      setLoading(false);
      return;
    }
    const user = await res.json();
    if (user.pin && String(user.pin) === String(pinInput)) {
      validatePin();
    } else {
      setError('Invalid PIN');
    }
    setLoading(false);
  };

  if (!pinValidated) {
    return (
      <div className="flex flex-col items-center justify-center ">
        <form
          onSubmit={handlePinSubmit}
          className="bg-white p-8 rounded shadow-md flex flex-col gap-4"
        >
          <label htmlFor="pin" className="font-bold text-lg">
            Enter Admin PIN
          </label>
          <input
            id="pin"
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="border p-2 rounded text-lg"
            autoFocus
          />
          {error && <div className="text-red-500">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Submit'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Statement onRemove={clearPinValidation} />
    </div>
  );
}
