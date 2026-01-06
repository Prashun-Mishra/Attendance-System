import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { UserPlus, Camera, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const NavItem = ({ to, icon: Icon, label }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={clsx(
                    "flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300",
                    isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                        : "text-gray-600 hover:bg-white/50 hover:text-blue-600"
                )}
            >
                <Icon size={18} />
                <span className="font-medium text-sm">{label}</span>
            </Link>
        );
    };

    return (
        <nav className="sticky top-4 z-50 px-4 mb-8">
            <div className="glass max-w-7xl mx-auto rounded-2xl px-6 py-4 flex justify-between items-center shadow-xl shadow-gray-200/50">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-800">
                        Attendance<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI</span>
                    </h1>
                </div>

                <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-full backdrop-blur-sm">
                    <NavItem to="/" icon={Camera} label="Attendance" />
                    <NavItem to="/register" icon={UserPlus} label="Register" />
                    <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
