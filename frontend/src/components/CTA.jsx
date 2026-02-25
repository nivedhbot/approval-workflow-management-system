import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ArrowRight, Zap } from "lucide-react";

const CTA = () => {
  const { user } = useAuth();

  const target = user
    ? user.role === "CREATOR"
      ? "/dashboard/creator"
      : "/dashboard/approver"
    : "/register";

  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background graphic */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/10 to-purple-600/20" />
          <div className="absolute inset-0 bg-dark/60 backdrop-blur-sm" />
          <div className="orb w-[300px] h-[300px] bg-blue-600 -top-20 -right-20 opacity-20" />
          <div className="orb w-[200px] h-[200px] bg-indigo-600 -bottom-16 -left-16 opacity-20" />

          {/* Content */}
          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium text-gray-300 mb-6">
              <Zap size={14} className="text-yellow-400" />
              Ready to Ship
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
              Start Managing Approvals{" "}
              <span className="gradient-text">the Right Way</span>
            </h2>

            <p className="text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
              JWT authentication, role-based access control, database
              persistence, and ownership enforcement — all production-ready,
              right now.
            </p>

            <Link
              to={target}
              className="group inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all hover:shadow-xl hover:shadow-blue-600/25 hover:-translate-y-0.5"
            >
              Launch Dashboard
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
