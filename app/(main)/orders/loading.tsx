export default function OrdersLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-8 w-32 rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-24 rounded bg-gray-100" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-gray-200" />
      </div>

      <div className="card divide-y divide-gray-100">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between px-6 py-5">
            <div>
              <div className="h-4 w-52 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-28 rounded bg-gray-100" />
              <div className="mt-1.5 h-3 w-20 rounded bg-gray-100" />
            </div>
            <div className="text-right">
              <div className="h-5 w-16 rounded bg-gray-200" />
              <div className="mt-2 h-5 w-24 rounded-full bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
