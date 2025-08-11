import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function Signup() {
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
            Sign up
          </motion.h1>

          <div className="mt-6 rounded-2xl border p-6 shadow-sm">
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input id="name" name="name" type="text" required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input id="email" name="email" type="email" required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input id="password" name="password" type="password" required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" required className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--color-ashoka-blue)]" />
              </div>
              <button type="submit" className="w-full rounded-lg bg-[color:var(--color-ashoka-blue)] px-4 py-3 text-white font-semibold shadow hover:opacity-90">Create account</button>
            </form>

            <p className="mt-6 text-sm text-gray-600">
              Already have an account? <Link to="/login" className="text-[color:var(--color-ashoka-blue)] underline">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
