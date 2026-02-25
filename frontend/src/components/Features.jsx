import {
  Shield,
  Users,
  FileCheck,
  UserCheck,
  Lock,
  Database,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "JWT Authentication",
    description:
      "Secure token-based auth with expiry handling, auto-refresh logic, and encrypted password storage using bcrypt.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Users,
    title: "Role-Based Dashboard",
    description:
      "Separate interfaces for Creators and Approvers. Each role sees only what they need — zero data leakage.",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    icon: FileCheck,
    title: "Creator Request Submission",
    description:
      "Creators submit structured requests with titles and descriptions. All submissions are validated server-side.",
    gradient: "from-violet-500 to-indigo-500",
  },
  {
    icon: UserCheck,
    title: "Approver Review System",
    description:
      "Approvers see pending requests with full context, add comments, and approve or reject with one click.",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: Lock,
    title: "Ownership Rule Enforcement",
    description:
      "Critical business rule: creators cannot approve their own requests. Enforced on both frontend and backend.",
    gradient: "from-pink-500 to-purple-500",
  },
  {
    icon: Database,
    title: "Database Persistence",
    description:
      "All data stored in MongoDB Atlas with indexed queries, timestamps, and referential integrity via Mongoose.",
    gradient: "from-rose-500 to-pink-500",
  },
];

const FeatureCard = ({ icon: Icon, title, description, gradient, index }) => (
  <div
    className="group relative glass rounded-2xl p-6 glass-hover hover:-translate-y-1 cursor-default"
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    {/* Icon */}
    <div
      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}
      style={{ boxShadow: "none" }}
    >
      <Icon size={20} className="text-white" />
    </div>

    {/* Content */}
    <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>

    {/* Subtle hover glow */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/[0.02] to-indigo-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
  </div>
);

const Features = () => {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything You Need to Manage{" "}
            <span className="gradient-text">Approvals</span>
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Every feature maps directly to a real backend capability. No smoke
            and mirrors — this is production-ready infrastructure.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
