export default function JobsLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-40 rounded-lg bg-gray-200" />
        <div className="mt-2 h-4 w-56 rounded bg-gray-100" />
      </div>

      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded-full bg-gray-200" />
                  <div className="h-5 w-20 rounded-full bg-gray-200" />
                </div>
                <div className="mt-3 h-4 w-48 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-32 rounded bg-gray-100" />
                <div className="mt-1.5 h-3 w-36 rounded bg-gray-100" />
              </div>
              <div className="h-8 w-24 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
