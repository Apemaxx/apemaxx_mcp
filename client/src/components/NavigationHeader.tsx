// src/components/NavigationHeader.tsx
import React, { useState } from 'react';
import { 
  Search, Package, Truck, MapPin, Database, Settings, 
  Bell, Menu, X, ChevronDown, FileText, Plane, Building 
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface NavigationHeaderProps {
  userId?: string;
}

export default function NavigationHeader({ userId }: NavigationHeaderProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Building,
      current: location === '/'
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: FileText,
      current: location.startsWith('/bookings'),
      dropdown: [
        { name: 'New Booking', href: '/bookings/new' },
        { name: 'Air Freight', href: '/bookings/air' },
        { name: 'Ocean Freight', href: '/bookings/ocean' },
        { name: 'All Bookings', href: '/bookings' }
      ]
    },
    {
      name: 'Shipments',
      href: '/shipments',
      icon: Package,
      current: location.startsWith('/shipments'),
      dropdown: [
        { name: 'Active Shipments', href: '/shipments/active' },
        { name: 'In Transit', href: '/shipments/transit' },
        { name: 'Delivered', href: '/shipments/delivered' },
        { name: 'All Shipments', href: '/shipments' }
      ]
    },
    {
      name: 'Tracking',
      href: '/tracking',
      icon: MapPin,
      current: location.startsWith('/tracking'),
      dropdown: [
        { name: 'Live Tracking', href: '/tracking/live' },
        { name: 'Track by WR', href: '/tracking/wr' },
        { name: 'Track by AWB', href: '/tracking/awb' },
        { name: 'Events Log', href: '/tracking/events' }
      ]
    },
    {
      name: 'Warehouse',
      href: '/warehouse',
      icon: Truck,
      current: location.startsWith('/warehouse')
    },
    {
      name: 'Resources',
      href: '/resources',
      icon: Database,
      current: location.startsWith('/resources'),
      dropdown: [
        { name: 'Address Book', href: '/resources/addressbook' },
        { name: 'Locations', href: '/resources/locations' },
        { name: 'Carriers', href: '/resources/carriers' },
        { name: 'Documents', href: '/resources/documents' }
      ]
    },
    {
      name: 'API',
      href: '/api-docs',
      icon: Settings,
      current: location.startsWith('/api'),
      dropdown: [
        { name: 'API Documentation', href: '/api-docs' },
        { name: 'API Keys', href: '/api-keys' },
        { name: 'Webhooks', href: '/api-webhooks' },
        { name: 'Rate Limits', href: '/api-limits' }
      ]
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Plane className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">APE MAXX</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.dropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                      className={`${
                        item.current
                          ? 'bg-blue-50 text-blue-700 border-blue-500'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>
                    
                    {activeDropdown === item.name && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            onClick={() => setActiveDropdown(null)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={`${
                      item.current
                        ? 'bg-blue-50 text-blue-700 border-blue-500'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search WR, AWB, shipments..."
                />
              </div>
            </form>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {/* Mobile Search */}
            <div className="px-3 pb-3">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Search WR, AWB, shipments..."
                  />
                </div>
              </form>
            </div>

            {/* Mobile Navigation Links */}
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border-blue-500'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  } group flex items-center px-3 py-2 text-base font-medium rounded-md`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
                
                {/* Mobile Dropdown Items */}
                {item.dropdown && (
                  <div className="ml-8 space-y-1">
                    {item.dropdown.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.name}
                        href={dropdownItem.href}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {dropdownItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}