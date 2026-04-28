import Link from "next/link";
import {
  ShirtIcon,
  MapPinIcon,
  WalletIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ZapIcon,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <ShirtIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">WashMate</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How it Works
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">
              Features
            </a>
            <a href="#earn" className="hover:text-blue-600 transition-colors">
              Earn Money
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm px-4 py-2">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute -top-40 -right-40 -z-10 h-80 w-80 rounded-full bg-blue-100 blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 -z-10 h-60 w-60 rounded-full bg-indigo-100 blur-3xl opacity-60" />

        <div className="mx-auto max-w-7xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <ZapIcon className="h-3.5 w-3.5" />
            Built for campus life · For students, by students
          </div>
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
            Your campus laundry,{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              picked up & delivered.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-500 leading-relaxed">
            Too busy studying? Post a laundry request and a fellow student
            runner will pick it up, wash it, and deliver it back to your dorm.
            No more laundry day stress.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register?role=CUSTOMER" className="btn-primary px-8 py-3 text-base">
              Post a Laundry Request
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/register?role=RUNNER" className="btn-secondary px-8 py-3 text-base">
              Become a Runner & Earn
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            {[
              "No subscription required",
              "Pay only per order",
              "Rated student runners",
            ].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "₱25/kg", label: "Standard Market Rate" },
              { value: "6 Steps", label: "Live Order Tracking" },
              { value: "Zero", label: "Monthly Subscription" },
              { value: "2 Roles", label: "Customer & Runner" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">How WashMate Works</h2>
            <p className="mt-4 text-lg text-gray-500">
              Simple for students. Rewarding for runners.
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-2">
            {/* For Customers */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                For Students
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Post & Relax</h3>
              <p className="mt-2 text-gray-500">
                Hand off your laundry and get back to what matters.
              </p>
              <ol className="mt-8 space-y-6">
                {[
                  {
                    step: "1",
                    title: "Post a Request",
                    desc: "List your items, dorm room, and preferred pickup time.",
                  },
                  {
                    step: "2",
                    title: "Runner Accepts",
                    desc: "A nearby runner picks up your laundry from your dorm.",
                  },
                  {
                    step: "3",
                    title: "Get it Delivered",
                    desc: "Fresh, clean laundry delivered back to your room.",
                  },
                ].map((s) => (
                  <li key={s.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.title}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* For Runners */}
            <div className="rounded-2xl border border-green-100 bg-green-50 p-8">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white uppercase tracking-wide">
                For Runners
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Pick Up & Earn</h3>
              <p className="mt-2 text-gray-500">
                Turn your free time into income, right on campus.
              </p>
              <ol className="mt-8 space-y-6">
                {[
                  {
                    step: "1",
                    title: "Browse Available Jobs",
                    desc: "See laundry requests near you and choose what fits your schedule.",
                  },
                  {
                    step: "2",
                    title: "Pick Up & Wash",
                    desc: "Collect the laundry, wash it, and keep the customer updated.",
                  },
                  {
                    step: "3",
                    title: "Deliver & Get Paid",
                    desc: "Return the clean laundry and receive your earnings.",
                  },
                ].map((s) => (
                  <li key={s.step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                      {s.step}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{s.title}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Built from the ground up for campus convenience.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: MapPinIcon,
                title: "On-Campus Pickup",
                desc: "Runners come directly to your dorm or building — no need to go anywhere.",
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: WalletIcon,
                title: "Transparent Pricing",
                desc: "Know the price upfront before confirming. No hidden fees, ever.",
                color: "text-green-600 bg-green-50",
              },
              {
                icon: StarIcon,
                title: "Rated Runners",
                desc: "Every runner is a fellow student with a verified profile and ratings.",
                color: "text-yellow-600 bg-yellow-50",
              },
              {
                icon: ZapIcon,
                title: "Real-Time Tracking",
                desc: "Track your order status from pickup to delivery in real time.",
                color: "text-purple-600 bg-purple-50",
              },
              {
                icon: CheckCircleIcon,
                title: "Flexible Schedule",
                desc: "Set your preferred pickup time — morning, afternoon, or evening.",
                color: "text-teal-600 bg-teal-50",
              },
              {
                icon: ShirtIcon,
                title: "All Laundry Types",
                desc: "Shirts, pants, uniforms, bedsheets — any type of laundry handled.",
                color: "text-indigo-600 bg-indigo-50",
              },
            ].map((feature) => (
              <div key={feature.title} className="card p-6">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earn CTA */}
      <section id="earn" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-16 text-center text-white md:px-16">
            <h2 className="text-4xl font-bold">
              Earn while you study.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
              Join as a runner and earn extra income between classes. Set your
              own schedule and work as much or as little as you want.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/register?role=RUNNER"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-blue-700 shadow-md hover:bg-blue-50 transition-colors"
              >
                Start Earning Today
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/register?role=CUSTOMER"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Post a Laundry Request
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <ShirtIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">WashMate</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2025 WashMate. Built for campus life.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/login" className="hover:text-blue-600">Sign In</Link>
            <Link href="/register" className="hover:text-blue-600">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
