import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Leaf, Sparkles, Crown } from 'lucide-react'

interface Plan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  href: string
  highlighted: boolean
  icon: React.ComponentType<{ className?: string }>
  foodEmoji: string
  comingSoon?: boolean
  badge?: string
}

const PLANS: Record<'monthly' | 'yearly', Plan[]> = {
  monthly: [
    {
      name: 'Scrappy Core',
      price: '$10',
      period: '/mo',
      description: 'Best for: Casual Home Cooks',
      features: [
        '15 fridge-photo scans per month',
        'Standard AI recipe generation (text-only)',
        'Basic ingredient matching',
      ],
      cta: 'Get Started',
      href: 'https://buy.stripe.com/8x2aEX2a090c6VN77s2Nq00',
      highlighted: false,
      icon: Leaf,
      foodEmoji: '🥬',
      comingSoon: true,
    },
    {
      name: 'Scrappy Pro',
      price: '$25',
      period: '/mo',
      description: 'Best for: Daily Meal Preppers & Macro Trackers',
      features: [
        'Unlimited fridge-photo scans',
        'Advanced ingredient substitution AI',
        'Interactive, auto-generated shopping lists',
        'Integrated step-by-step cooking timers',
      ],
      cta: 'Start Free Trial',
      href: 'https://buy.stripe.com/cNiaEXaGwa4gdkb8bw2Nq01',
      highlighted: true,
      icon: Sparkles,
      foodEmoji: '🍳',
      comingSoon: true,
    },
    {
      name: "Founder's Lifetime Pass",
      price: '$199',
      period: ' one-time',
      description: 'Best for: Early adopters & Superfans',
      features: [
        'Unlimited lifetime access to all Pro features',
        'Locked-in access to all future premium AI features',
        'Exclusive "Beta Tester" badge on profile',
      ],
      cta: 'Claim Lifetime Access',
      href: 'https://buy.stripe.com/6oU5kD01S2BO0xp8bw2Nq03',
      highlighted: false,
      icon: Crown,
      foodEmoji: '👑',
      comingSoon: true,
    },
  ],
  yearly: [
    {
      name: 'Scrappy Core',
      price: '$10',
      period: '/mo',
      description: 'Best for: Casual Home Cooks',
      features: [
        '15 fridge-photo scans per month',
        'Standard AI recipe generation (text-only)',
        'Basic ingredient matching',
      ],
      cta: 'Get Started',
      href: 'https://buy.stripe.com/8x2aEX2a090c6VN77s2Nq00',
      highlighted: false,
      icon: Leaf,
      foodEmoji: '🥬',
      comingSoon: true,
    },
    {
      name: 'Scrappy Pro',
      price: '$119',
      period: '/yr',
      description: 'Best for: Daily Meal Preppers & Macro Trackers',
      features: [
        'Unlimited fridge-photo scans',
        'Advanced ingredient substitution AI',
        'Interactive, auto-generated shopping lists',
        'Integrated step-by-step cooking timers',
      ],
      cta: 'Start Free Trial',
      href: 'https://buy.stripe.com/8x23cv2a0dgsbc33Vg2Nq02',
      highlighted: true,
      icon: Sparkles,
      foodEmoji: '🍳',
      badge: 'Save $181/yr',
      comingSoon: true,
    },
    {
      name: "Founder's Lifetime Pass",
      price: '$199',
      period: ' one-time',
      description: 'Best for: Early adopters & Superfans',
      features: [
        'Unlimited lifetime access to all Pro features',
        'Locked-in access to all future premium AI features',
        'Exclusive "Beta Tester" badge on profile',
      ],
      cta: 'Claim Lifetime Access',
      href: 'https://buy.stripe.com/6oU5kD01S2BO0xp8bw2Nq03',
      highlighted: false,
      icon: Crown,
      foodEmoji: '👑',
      comingSoon: true,
    },
  ],
}

function Toggle({ billing, onChange }: { billing: 'monthly' | 'yearly'; onChange: (v: 'monthly' | 'yearly') => void }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-6">
      <span className={`text-sm font-bold transition-colors ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>
        Monthly
      </span>
      <button
        onClick={() => onChange(billing === 'monthly' ? 'yearly' : 'monthly')}
        className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${billing === 'yearly' ? 'bg-orange-500' : 'bg-gray-200'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${billing === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}
        />
      </button>
      <span className={`text-sm font-bold transition-colors ${billing === 'yearly' ? 'text-gray-900' : 'text-gray-400'}`}>
        Yearly
        <span className="ml-1 text-[10px] text-orange-500 font-black">SAVE UP TO 60%</span>
      </span>
    </div>
  )
}

function PricingCard({ plan }: { plan: Plan }) {
  const Icon = plan.icon
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-5 transition-all duration-300 ${
        plan.highlighted
          ? 'bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-xl shadow-orange-200 scale-[1.02] ring-4 ring-orange-300'
          : 'bg-white text-gray-900 shadow-lg shadow-gray-200/50'
      }`}
    >
      {/* Badges */}
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-white text-orange-600 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
            Best Value
          </span>
        </div>
      )}
      {plan.badge && (
        <div className="absolute -top-3 right-4 z-10">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md ${
            plan.highlighted ? 'bg-orange-400 text-white' : 'bg-green-100 text-green-700'
          }`}>
            {plan.badge}
          </span>
        </div>
      )}

      {/* Icon, Emoji & Name */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-xl relative ${plan.highlighted ? 'bg-white/20' : 'bg-orange-50'}`}>
          <Icon className={`w-5 h-5 ${plan.highlighted ? 'text-white' : 'text-orange-500'}`} />
          <span className="absolute -top-1 -right-1 text-[10px]">{plan.foodEmoji}</span>
        </div>
        <h3 className={`text-base font-black ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
          {plan.name}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-1">
        <span className={`text-4xl font-black ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
          {plan.price}
        </span>
        <span className={`text-sm ml-1 ${plan.highlighted ? 'text-white/80' : 'text-gray-400'}`}>
          {plan.period}
        </span>
      </div>

      {/* Description */}
      <p className={`text-xs mb-3 ${plan.highlighted ? 'text-white/80' : 'text-gray-500'}`}>
        {plan.description}
      </p>

      {/* Features */}
      <ul className="flex-1 space-y-2 mb-5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-orange-500'}`} />
            <span className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      {/* Decorative food element */}
      <div className={`text-center text-xs mb-3 ${plan.highlighted ? 'text-white/60' : 'text-gray-400'}`}>
        {plan.name === 'Scrappy Core' && '🥕 🥬 🥦'}
        {plan.name === 'Scrappy Pro' && '🧑‍🍳 🔪 🥘'}
        {plan.name.includes('Lifetime') && '🏆 ♾️ 🌱'}
      </div>

      {/* CTA */}
      {plan.comingSoon ? (
        <div className="w-full text-center font-black text-sm py-3 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed">
          Coming Soon
        </div>
      ) : (
        <a
          href={plan.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full text-center font-black text-sm py-3 rounded-xl transition-all duration-200 ${
            plan.highlighted
              ? 'bg-white text-orange-600 hover:bg-orange-50 shadow-lg'
              : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
          }`}
        >
          {plan.cta}
        </a>
      )}
    </div>
  )
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const plans = PLANS[billing]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      {/* Header */}
      <header className="px-4 py-4">
        <Link to="/" className="inline-flex items-center gap-2">
          <img src="/logo.png" alt="ScrappyChef" className="w-7 h-7 object-contain" />
          <h1 className="text-lg font-black text-gray-900 tracking-tight">ScrappyChef</h1>
        </Link>
      </header>

      {/* Impact Counter Strip */}
      <div className="px-4 mb-6">
        <div className="bg-orange-100/60 rounded-2xl px-5 py-3 flex items-center justify-center gap-6 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="text-lg">🥕</span>
            <span className="text-orange-800 font-bold">2,847 lbs</span>
            <span className="text-orange-600/70 text-xs">food saved</span>
          </span>
          <span className="w-px h-6 bg-orange-200" />
          <span className="flex items-center gap-1.5">
            <span className="text-lg">💰</span>
            <span className="text-orange-800 font-bold">$14.2k</span>
            <span className="text-orange-600/70 text-xs">saved by users</span>
          </span>
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 text-center mb-6">
        <h2 className="text-3xl font-black text-gray-900 mb-2">
          Turn Scraps into<br />
          <span className="text-orange-500">Saucy Savings 🧑‍🍳</span>
        </h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Every peel, stem & stale crumb has potential. Pick the plan that fits your kitchen.
        </p>
      </div>

      {/* Toggle */}
      <Toggle billing={billing} onChange={setBilling} />

      {/* Pricing Cards */}
      <div className="px-4 pb-12 space-y-4 max-w-md mx-auto">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>

      {/* Tagline */}
      <div className="px-4 text-center mb-6">
        <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
          Start with Core, upgrade when you're ready. Every plan saves food & money.
        </p>
      </div>

      {/* Footer */}
      <footer className="pb-6 text-center space-y-1">
        <p className="text-[10px] text-gray-300">From scraps to savings 🏆</p>
        <Link
          to="/disclaimer"
          className="text-[10px] text-gray-300 hover:text-gray-500 underline"
        >
          Legal Disclaimer
        </Link>
      </footer>
    </div>
  )
}