import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Image, Users, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ManagePlacesPage from './ManagePlacesPage';

type AdminSection = 'places' | 'images' | 'users' | 'settings';

const AdminPanel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('places');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'places' as AdminSection, label: 'Manage Places', icon: MapPin },
    { id: 'images' as AdminSection, label: 'Image Gallery', icon: Image },
    { id: 'users' as AdminSection, label: 'Users', icon: Users },
    { id: 'settings' as AdminSection, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gradient-paper">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        className="fixed lg:relative w-64 h-full bg-white shadow-lg z-50"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary text-white'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold text-foreground">
            {menuItems.find(item => item.id === activeSection)?.label}
          </h2>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Content Area */}
        <div className="h-full overflow-y-auto">
          {activeSection === 'places' && <ManagePlacesPage />}
          {activeSection === 'images' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Image Gallery</h2>
              <p className="text-muted-foreground">Image management coming soon...</p>
            </div>
          )}
          {activeSection === 'users' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">User Management</h2>
              <p className="text-muted-foreground">User management coming soon...</p>
            </div>
          )}
          {activeSection === 'settings' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Settings</h2>
              <p className="text-muted-foreground">Settings coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
