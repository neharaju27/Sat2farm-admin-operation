import { Home, BarChart3, TrendingUp, ClipboardList, Users, Search, Phone, Calendar, Package, FileText, HelpCircle, Puzzle, Wrench, FolderOpen, Target, MessageSquare, Mic, ChevronDown } from 'lucide-react';
import sat2farmLogo from '../assets/logo.png';

export default function Sidebar({ onLogout, user, onPageChange, currentPage }) {
  return (
    <div className="h-full bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 flex flex-col shadow-xl border-r border-slate-200">

      {/* Header */}
      {/* Header */}
<div className="p-5 border-b border-gray-200 bg-white">
  <div className="flex items-center space-x-3">

    {/* Logo */}
    <div className="w-10 h-10 flex items-center justify-center">
      <img
        src={sat2farmLogo}
        alt="Sat2Farm Logo"
        className="w-full h-full object-contain"
      />
    </div>

    {/* Title */}
    <div>
      <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
        Satyukt
      </h2>
     
    </div>

  </div>
</div>

      
      <div className="flex-1 overflow-y-auto">
        {/* Main Navigation */}
        <nav className="p-6">
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Main Menu</h3>
            <ul className="space-y-2">
              <li 
                className={`${
                  currentPage === 'dashboard' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                    : 'bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600'
                } p-4 rounded-2xl cursor-pointer flex items-center transition-all duration-300 hover:translate-x-3 hover:shadow-lg hover:shadow-blue-500/30 border border-slate-200 hover:border-transparent`}
                onClick={() => onPageChange('dashboard')}
              >
                <Home className={`w-5 h-5 mr-3 ${
                  currentPage === 'dashboard' ? 'text-white' : 'text-slate-600 hover:text-white'
                } transition-colors duration-300 transform hover:scale-125 transition-transform duration-200`} />
                <span className={`font-medium ${
                  currentPage === 'dashboard' ? 'text-white' : 'text-slate-700 hover:text-white'
                } transition-colors duration-300`}>Home</span>
                {currentPage === 'dashboard' && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></div>
                  </div>
                )}
              </li>
              <li className="bg-white p-4 rounded-2xl cursor-pointer flex items-center transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:translate-x-3 hover:shadow-lg hover:shadow-blue-500/30 border border-slate-200 hover:border-transparent">
                <BarChart3 className="w-5 h-5 mr-3 text-slate-600 hover:text-white transition-colors duration-300 transform hover:scale-125 transition-transform duration-200" />
                <span className="font-medium text-slate-700 hover:text-white transition-colors duration-300">Super Admin</span>
                <div className="ml-auto opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </li>
              <li className="bg-white p-4 rounded-2xl cursor-pointer flex items-center transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:translate-x-3 hover:shadow-lg hover:shadow-blue-500/30 border border-slate-200 hover:border-transparent">
                <TrendingUp className="w-5 h-5 mr-3 text-slate-600 hover:text-white transition-colors duration-300 transform hover:scale-125 transition-transform duration-200" />
                <span className="font-medium text-slate-700 hover:text-white transition-colors duration-300">Admin</span>
                <div className="ml-auto opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </li>
              <li 
                className={`${
                  currentPage === 'operation' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
                    : 'bg-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600'
                } p-4 rounded-2xl cursor-pointer flex items-center transition-all duration-300 hover:translate-x-3 hover:shadow-lg hover:shadow-blue-500/30 border border-slate-200 hover:border-transparent`}
                onClick={() => onPageChange('operation')}
              >
                <ClipboardList className={`w-5 h-5 mr-3 ${
                  currentPage === 'operation' ? 'text-white' : 'text-slate-600 hover:text-white'
                } transition-colors duration-300 transform hover:scale-125 transition-transform duration-200`} />
                <span className={`font-medium ${
                  currentPage === 'operation' ? 'text-white' : 'text-slate-700 hover:text-white'
                } transition-colors duration-300`}>Operation</span>
                {currentPage === 'operation' && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg"></div>
                  </div>
                )}
              </li>
              <li className="bg-white p-4 rounded-2xl cursor-pointer flex items-center transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 hover:translate-x-3 hover:shadow-lg hover:shadow-blue-500/30 border border-slate-200 hover:border-transparent">
                <Users className="w-5 h-5 mr-3 text-slate-600 hover:text-white transition-colors duration-300 transform hover:scale-125 transition-transform duration-200" />
                <span className="font-medium text-slate-700 hover:text-white transition-colors duration-300">Farmer</span>
                <div className="ml-auto opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                </div>
              </li>
            </ul>
          </div>
        
          
        </nav>
        
        {/* Collapsible Sections */}
        
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center relative z-10">
            <span className="text-white font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <div className="relative z-10">
            <p className="font-medium">{user?.name || 'User Name'}</p>
            <p className="text-xs text-blue-100">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
