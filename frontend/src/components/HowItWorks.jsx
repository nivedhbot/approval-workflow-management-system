import { UserPlus, FilePlus, Eye, CheckCircle, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register",
    description:
      "Create an account as a Creator or Approver with secure JWT authentication.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: FilePlus,
    title: "Create Request",
    description:
      "Creators submit approval requests with a title and description.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: Eye,
    title: "Approver Reviews",
    description:
      "Approvers see all pending requests with full creator context.",
    color: "from-violet-500 to-violet-600",
  },
  {
    icon: CheckCircle,
    title: "Approve or Reject",
    description:
      "One-click approve/reject with optional comments. Self-approval blocked.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Status Updated",
    description: "Creators see real-time status updates on their dashboard.",
    color: "from-pink-500 to-pink-600",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/[0.02] to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            From Request to Resolution in{" "}
            <span className="gradient-text">5 Steps</span>
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Each step maps directly to a real API call in the backend. This is
            not a mock flow.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-500/30 via-indigo-500/30 to-pink-500/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step Number + Icon */}
                <div className="relative mb-6">
                  <div
                    className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
                    style={{
                      boxShadow: `0 8px 30px -8px rgba(99, 102, 241, 0.3)`,
                    }}
                  >
                    <step.icon size={32} className="text-white" />
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-dark-100 border border-white/10 flex items-center justify-center">
                    <span className="text-xs font-bold gradient-text">
                      {i + 1}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-sm font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-[180px]">
                  {step.description}
                </p>

                {/* Animated pulse dot (desktop connector) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 -right-3 lg:-right-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-slow" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* API mapping note */}
        <div className="mt-16 text-center">
          <p className="inline-flex items-center gap-2 text-xs text-gray-500 glass px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Every step triggers real API calls → MongoDB persistence → JWT
            validation
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
