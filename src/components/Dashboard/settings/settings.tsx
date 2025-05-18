'use client';
import React, { useContext, useState } from 'react';
import { PinContext } from '@/context/PinContext';
import { getSession } from 'next-auth/react';

export default function Settings() {
  const { adminModeOn, adminMode, clearadminMode } =
    useContext(PinContext);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggle = () => {
    if (!adminModeOn) {
      setShowPinPopup(true);
    } else {
      clearadminMode();
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const session = await getSession();
    if (!session?.user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }
    const res = await fetch(`/api/user/${session.user.id}`);
    if (!res.ok) {
      setError('Failed to fetch user');
      setLoading(false);
      return;
    }
    const user = await res.json();
    if (user.pin && String(user.pin) === String(pinInput)) {
      adminMode();
      setShowPinPopup(false);
      setPinInput('');
    } else {
      setError('Invalid PIN');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 rounded-lg shadow-md">
      <div className="flex items-center gap-4 mb-6">
        <span className="font-semibold">Admin Mode</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={adminModeOn}
            onChange={handleToggle}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 transition-colors"></div>
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
            {adminModeOn ? 'On' : 'Off'}
          </span>
        </label>
      </div>
      {showPinPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form
            onSubmit={handlePinSubmit}
            className="bg-white p-6 rounded shadow-md flex flex-col gap-4 min-w-[280px]"
          >
            <label htmlFor="pin" className="font-bold text-lg text-center">
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
            {error && <div className="text-red-500 text-center">{error}</div>}
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                onClick={() => {
                  setShowPinPopup(false);
                  setPinInput('');
                  setError('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
              >
                {loading ? 'Checking...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
