export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-8 w-48 rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-64 rounded bg-gray-100" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-gray-200" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gray-200" />
              <div>
                <div className="h-3 w-20 rounded bg-gray-200" />
                <div className="mt-2 h-7 w-12 rounded bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="border-b border-gray-100 px-6 py-4">
          <div className="h-5 w-32 rounded bg-gray-200" />
        </div>
        <div className="divide-y divide-gray-100">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div>
                <div className="h-4 w-48 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
              </div>
              <div className="h-6 w-20 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}