import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { UserIcon, StarIcon } from "lucide-react";
import { SignOutButton } from "@/components/shared/sign-out-button";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isRunner = user.role === "RUNNER";

  const [userWithCount, earnedAgg, spentAgg, reviews] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      include: {
        _count: { select: { ordersAsCustomer: true, ordersAsRunner: true } },
      },
    }),
    isRunner
      ? db.order.aggregate({ where: { runnerId: user.id, status: "DELIVERED" }, _sum: { price: true } })
      : Promise.resolve(null),
    !isRunner
      ? db.order.aggregate({ where: { customerId: user.id, status: "DELIVERED" }, _sum: { price: true } })
      : Promise.resolve(null),
    db.review.findMany({
      where: { revieweeId: user.id },
      include: { reviewer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalEarned = earnedAgg?._sum.price ?? 0;
  const totalSpent = spentAgg?._sum.price ?? 0;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-gray-900">My Profile</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <UserIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h2>
            <span className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isRunner ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
              {isRunner ? "Runner" : "Customer"}
            </span>
            <div className="mt-4 space-y-2 text-sm text-gray-500">
              <p>{user.email}</p>
              {user.studentId && <p>ID: {user.studentId}</p>}
              {user.dormitory && <p>{user.dormitory}</p>}
              {user.phone && <p>{user.phone}</p>}
            </div>
            {avgRating && (
              <div className="mt-4 flex items-center justify-center gap-1">
                <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-800">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({reviews.length} reviews)</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {isRunner ? (
              <>
                <div className="card p-5">
                  <p className="text-sm text-gray-500">Jobs Completed</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{userWithCount?._count.ordersAsRunner ?? 0}</p>
                </div>
                <div className="card p-5">
                  <p className="text-sm text-gray-500">Total Earned</p>
                  <p className="mt-1 text-3xl font-bold text-green-600">{formatPrice(totalEarned)}</p>
                </div>
              </>
            ) : (
              <>
                <div className="card p-5">
                  <p className="text-sm text-gray-500">Orders Placed</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{userWithCount?._count.ordersAsCustomer ?? 0}</p>
                </div>
                <div className="card p-5">
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="mt-1 text-3xl font-bold text-blue-600">{formatPrice(totalSpent)}</p>
                </div>
              </>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="card p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Reviews</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">by {review.reviewer.name}</span>
                    </div>
                    {review.comment && <p className="mt-1 text-sm text-gray-600">{review.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 lg:hidden">
        <SignOutButton />
      </div>
    </div>
  );
}
