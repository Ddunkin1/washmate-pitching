export default function ProfileLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-8 w-36 rounded-lg bg-gray-200" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gray-200" />
            <div className="mx-auto mt-4 h-6 w-36 rounded bg-gray-200" />
            <div className="mx-auto mt-2 h-5 w-20 rounded-full bg-gray-200" />
            <div className="mt-4 space-y-2">
              <div className="mx-auto h-3 w-40 rounded bg-gray-100" />
              <div className="mx-auto h-3 w-28 rounded bg-gray-100" />
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="card p-5">
                <div className="h-3 w-24 rounded bg-gray-200" />
                <div className="mt-2 h-9 w-16 rounded bg-gray-200" />
              </div>
            ))}
          </div>

          <div className="card p-6">
            <div className="mb-4 h-5 w-20 rounded bg-gray-200" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 w-4 rounded bg-gray-200" />
                    ))}
                  </div>
                  <div className="mt-2 h-3 w-48 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
