import { ShieldAlert, ShieldCheck, Code2 } from "lucide-react";

const Security = () => {
  return (
    <section id="security" className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
            Security
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Business Rules{" "}
            <span className="gradient-text">Enforced at Every Layer</span>
          </h2>
          <p className="text-gray-400 leading-relaxed">
            Critical ownership rules are enforced on both the frontend UI and
            the backend API. No loopholes, no bypasses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Rule Card */}
          <div className="glass rounded-2xl p-8 gradient-border">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={24} className="text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Critical Business Rule
                </h3>
                <p className="text-sm text-gray-400">
                  Enforced to maintain integrity of the approval workflow
                </p>
              </div>
            </div>

            <div className="bg-amber-500/[0.04] border border-amber-500/10 rounded-xl p-5 mb-6">
              <p className="text-amber-300 font-semibold text-center text-lg">
                "A creator cannot approve their own request."
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Code2 size={14} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Frontend Enforcement
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Approval buttons are hidden when{" "}
                    <code className="text-blue-400 bg-white/[0.04] px-1.5 py-0.5 rounded text-[11px]">
                      request.creatorId === loggedInUser.id
                    </code>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck size={14} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Backend Validation
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    API returns{" "}
                    <code className="text-red-400 bg-white/[0.04] px-1.5 py-0.5 rounded text-[11px]">
                      403 Forbidden
                    </code>{" "}
                    if a creator attempts to approve their own request
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Preview */}
          <div className="glass rounded-2xl overflow-hidden gradient-border">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/40" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <div className="w-3 h-3 rounded-full bg-green-500/40" />
              </div>
              <span className="text-[11px] text-gray-500 ml-2 font-mono">
                requestController.js
              </span>
            </div>
            <div className="p-5 font-mono text-xs leading-6 overflow-x-auto">
              <div className="text-gray-500">
                {"// CRITICAL: Self-approval prevention"}
              </div>
              <div>
                <span className="text-purple-400">if</span>
                <span className="text-gray-300"> (request.creatorId.</span>
                <span className="text-blue-300">toString</span>
                <span className="text-gray-300">() === approverId) {"{"}</span>
              </div>
              <div className="pl-4">
                <span className="text-purple-400">return</span>
                <span className="text-gray-300"> res.</span>
                <span className="text-blue-300">status</span>
                <span className="text-gray-300">(</span>
                <span className="text-amber-300">403</span>
                <span className="text-gray-300">).</span>
                <span className="text-blue-300">json</span>
                <span className="text-gray-300">({"{"}</span>
              </div>
              <div className="pl-8">
                <span className="text-blue-300">success</span>
                <span className="text-gray-300">: </span>
                <span className="text-red-400">false</span>
                <span className="text-gray-300">,</span>
              </div>
              <div className="pl-8">
                <span className="text-blue-300">error</span>
                <span className="text-gray-300">: </span>
                <span className="text-emerald-400">
                  "You cannot approve your own request"
                </span>
              </div>
              <div className="pl-4">
                <span className="text-gray-300">{"}"})</span>
              </div>
              <div>
                <span className="text-gray-300">{"}"}</span>
              </div>
              <div className="mt-4 text-gray-500">
                {"// Frontend also hides approval UI"}
              </div>
              <div>
                <span className="text-gray-300">{"{"}</span>
                <span className="text-blue-300">canApprove</span>
                <span className="text-gray-300">(request) && (</span>
              </div>
              <div className="pl-4">
                <span className="text-gray-300">&lt;</span>
                <span className="text-blue-400">ApprovalButtons</span>
                <span className="text-gray-300"> /&gt;</span>
              </div>
              <div>
                <span className="text-gray-300">){"}"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
