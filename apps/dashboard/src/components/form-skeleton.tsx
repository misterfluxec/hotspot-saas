'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function FormSkeleton() {
  return (
    <div className="max-w-md mx-auto w-full space-y-8">
      {/* Header Skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto bg-zinc-800" />
        <Skeleton className="h-4 w-64 mx-auto bg-zinc-800" />
      </div>

      {/* Form Fields Skeleton */}
      <div className="space-y-6">
        {/* Business Name */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 bg-zinc-800" />
          <Skeleton className="h-12 w-full bg-zinc-800" />
        </div>

        {/* Business Type */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 bg-zinc-800" />
          <Skeleton className="h-12 w-full bg-zinc-800" />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-36 bg-zinc-800" />
          <Skeleton className="h-12 w-full bg-zinc-800" />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-zinc-800" />
          <Skeleton className="h-12 w-full bg-zinc-800" />
          <Skeleton className="h-4 w-full bg-zinc-800" />
        </div>

        {/* Plan Selection */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-20 bg-zinc-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-20 w-full bg-zinc-800 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-3">
          <Skeleton className="h-4 w-4 mt-1 bg-zinc-800" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-64 bg-zinc-800" />
            <Skeleton className="h-4 w-48 bg-zinc-800" />
          </div>
        </div>

        {/* Submit Button */}
        <Skeleton className="h-12 w-full bg-zinc-800 rounded-lg" />
      </div>

      {/* Login Link */}
      <div className="text-center">
        <Skeleton className="h-4 w-48 mx-auto bg-zinc-800" />
      </div>
    </div>
  );
}
