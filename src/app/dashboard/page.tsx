import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/dashboard/create-bill');
  return null;
}
