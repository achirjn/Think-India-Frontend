import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <motion.h1
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="text-3xl font-extrabold text-[color:var(--color-ashoka-blue)]"
          >
            Login
          </motion.h1>

          <div className="mt-6 rounded-2xl border p-6 shadow-sm">
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input id="email" name="email" type="email" required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input id="password" name="password" type="password" required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-[color:var(--color-ashoka-blue)] px-4 py-3 text-white font-semibold shadow hover:opacity-90">Login</button>
            </form>

            <div className="my-5 flex items-center gap-2 text-xs text-gray-500">
              <div className="h-px flex-1 bg-gray-200" />
              <span>or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <button type="button" className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-800 shadow hover:bg-gray-50">
              Continue with Google
            </button>

            <p className="mt-6 text-sm text-gray-600">
              New here? <Link to="/signup" className="text-[color:var(--color-ashoka-blue)] underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
