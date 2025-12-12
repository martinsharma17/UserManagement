// src/components/dashboard/Sidebar.jsx
import React from 'react';

const Sidebar = ({
    sidebarOpen,
    setSidebarOpen,
    activeView,
    setActiveView,
    menuItems,
    onLogout,
    user
}) => {
    const [expandedMenus, setExpandedMenus] = React.useState({});

    const toggleMenu = (menuId) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuId]: !prev[menuId]
        }));
    };

    return (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                {sidebarOpen && <h2 className="text-xl font-bold">{user?.email || "User"}</h2>}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="text-gray-400 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {sidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    // Check if parent or any child is active
                    const isParentActive = activeView === item.id || (item.children && item.children.some(child => child.id === activeView));
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedMenus[item.id];

                    return (
                        <div key={item.id}>
                            <button
                                onClick={() => {
                                    if (hasChildren) {
                                        toggleMenu(item.id);
                                        if (!sidebarOpen) setSidebarOpen(true); // Open sidebar if closed
                                    } else {
                                        setActiveView(item.id);
                                    }
                                }}
                                disabled={item.disabled}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isParentActive && !hasChildren
                                        ? "bg-blue-600 text-white"
                                        : item.disabled
                                            ? "text-gray-500 cursor-not-allowed"
                                            : "text-gray-300 hover:bg-gray-800"
                                    }`}
                                title={item.title}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {sidebarOpen && <span>{item.title}</span>}
                                </div>
                                {hasChildren && sidebarOpen && (
                                    <svg
                                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </button>

                            {/* Render Children */}
                            {hasChildren && sidebarOpen && isExpanded && (
                                <div className="ml-8 mt-1 space-y-1">
                                    {item.children.map((child) => (
                                        <button
                                            key={child.id}
                                            onClick={() => setActiveView(child.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${activeView === child.id
                                                    ? "text-blue-400 font-medium"
                                                    : "text-gray-400 hover:text-white"
                                                }`}
                                        >
                                            {child.title}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {sidebarOpen && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;

