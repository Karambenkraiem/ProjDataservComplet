// import { cn } from '@/lib/utils';

// export function Skeleton({ className }: { className?: string }) {
//   return <div className={cn('animate-pulse bg-slate-200 rounded-lg', className)} />;
// }

// export function SkeletonCard() {
//   return (
//     <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
//       <div className="flex items-center gap-3">
//         <Skeleton className="w-10 h-10 rounded-xl" />
//         <div className="flex-1 space-y-2">
//           <Skeleton className="h-4 w-3/4" />
//           <Skeleton className="h-3 w-1/2" />
//         </div>
//       </div>
//       <Skeleton className="h-3 w-full" />
//       <Skeleton className="h-3 w-5/6" />
//       <div className="flex gap-2 pt-1">
//         <Skeleton className="h-5 w-16 rounded-full" />
//         <Skeleton className="h-5 w-20 rounded-full" />
//       </div>
//     </div>
//   );
// }

// export function SkeletonTable({ rows = 5 }: { rows?: number }) {
//   return (
//     <div className="space-y-2">
//       <div className="flex gap-4 px-4 py-3 bg-slate-50 rounded-lg">
//         {[40, 20, 15, 15, 10].map((w, i) => (
//           <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
//         ))}
//       </div>
//       {Array.from({ length: rows }).map((_, i) => (
//         <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100">
//           {[40, 20, 15, 15, 10].map((w, j) => (
//             <Skeleton key={j} className="h-4" style={{ width: `${w}%` }} />
//           ))}
//         </div>
//       ))}
//     </div>
//   );
// }

import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn('animate-pulse bg-slate-200 rounded-lg', className)}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 px-4 py-3 bg-slate-50 rounded-lg">
        {[40, 20, 15, 15, 10].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100">
          {[40, 20, 15, 15, 10].map((w, j) => (
            <Skeleton key={j} className="h-4" style={{ width: `${w}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}
