import { Workflow } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.04] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Workflow size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-400">
              FlowApprove
            </span>
          </div>
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} FlowApprove. Built with React,
            Tailwind CSS, Node.js &amp; MongoDB.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
