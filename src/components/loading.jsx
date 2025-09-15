'use client';

import { ClipLoader } from 'react-spinners';

export function Loading({ size = 40, color = '#3b82f6', text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <ClipLoader size={size} color={color} />
      <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
    </div>
  );
}

export function PageLoading({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <ClipLoader size={60} color="#3b82f6" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
}


export function SimpleLoading({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
}
