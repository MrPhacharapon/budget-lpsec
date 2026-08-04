'use client';

import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Next.js Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-200">
        <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <h2 className="text-lg font-bold text-red-700">ระบบพบข้อผิดพลาด (System Error)</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-slate-700 font-medium text-sm">
            เกิดข้อผิดพลาดขึ้นในระบบ กรุณาแคปเจอร์หน้าจอนี้ส่งให้ทีมผู้พัฒนา
          </p>
          
          <div className="bg-slate-900 text-red-400 p-4 rounded-xl font-mono text-sm overflow-x-auto whitespace-pre-wrap word-break-all shadow-inner">
            <strong className="text-white block mb-2">Debug Log:</strong>
            {error.message || 'Unknown Error'}
            {error.stack && (
              <div className="mt-2 text-slate-400 text-xs opacity-80">
                {error.stack}
              </div>
            )}
            {error.digest && (
              <div className="mt-2 text-yellow-400 text-xs">
                Digest: {error.digest}
              </div>
            )}
          </div>

          <button
            onClick={() => reset()}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all"
          >
            🔄 ลองใหม่อีกครั้ง (Try again)
          </button>
        </div>
      </div>
    </div>
  );
}
