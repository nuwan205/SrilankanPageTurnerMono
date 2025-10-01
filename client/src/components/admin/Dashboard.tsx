import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderTree, MapPin, Eye, EyeOff } from 'lucide-react';
import { getCategories, getDestinations } from '@/lib/data-store';

const AdminDashboard: React.FC = () => {
  const categories = getCategories();
  const destinations = getDestinations();

  const stats = [
    {
      title: 'Total Categories',
      value: categories.length,
      icon: FolderTree,
      color: 'text-primary',
    },
    {
      title: 'Active Categories',
      value: categories.filter(c => c.enabled).length,
      icon: Eye,
      color: 'text-green-600',
    },
    {
      title: 'Total Destinations',
      value: destinations.length,
      icon: MapPin,
      color: 'text-secondary',
    },
    {
      title: 'Active Destinations',
      value: destinations.filter(d => d.enabled).length,
      icon: Eye,
      color: 'text-green-600',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Sri Lanka tourism website content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.slice(0, 5).map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-2 h-2 rounded-full', category.enabled ? 'bg-green-500' : 'bg-gray-400')} />
                    <span className="font-medium text-foreground">{category.title}</span>
                  </div>
                  {category.enabled ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {destinations.slice(0, 5).map((destination) => (
                <div
                  key={destination.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn('w-2 h-2 rounded-full', destination.enabled ? 'bg-green-500' : 'bg-gray-400')} />
                    <span className="font-medium text-foreground">{destination.name}</span>
                  </div>
                  {destination.enabled ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export default AdminDashboard;
