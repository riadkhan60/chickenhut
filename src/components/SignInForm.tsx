'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function SignInForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('signIn');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h4 className="text-center mb-6 font-bold text-2xl text-gray-800">
          Chicken hut
        </h4>
        <h2 className="text-center mb-6 font-bold text-2xl text-gray-800">
          {t('title')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="font-medium text-gray-700">
            {t('username')}
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 mt-2 rounded-md border border-gray-300 text-base outline-none bg-gray-50 focus:border-blue-400"
              placeholder="Enter your username"
            />
          </label>
          <label className="font-medium text-gray-700">
            {t('password')}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-2 rounded-md border border-gray-300 text-base outline-none bg-gray-50 focus:border-blue-400"
              placeholder="Enter your password"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-3 rounded-md font-semibold text-lg mt-2 transition-colors duration-200 hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? t('loading') : t('signIn')}
          </button>
          <div className="h-6 text-center">
            <span className="text-red-600 text-sm transition-all duration-200">
              {error ? t('error') : '\u00A0'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
