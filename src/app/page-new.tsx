'use client';

import { useRouter } from 'next/navigation';
import BillUploader from '@/components/BillUploader';

export default function Home() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/assign');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <BillUploader 
          onSuccess={handleSuccess}
          onError={(error: string) => console.error('Upload error:', error)}
        />
      </div>
    </div>
  );
}
