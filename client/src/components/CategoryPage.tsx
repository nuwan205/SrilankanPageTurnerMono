import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  BookOpen,
  FolderTree
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { apiClient } from '@/lib/api';

// Helper function to dynamically get any Lucide icon component
const getIconComponent = (iconName: string): React.ElementType => {
  // Try to get the icon from lucide-react dynamically
  const IconComponent = (LucideIcons as any)[iconName];
  
  // Return the icon if found, otherwise return default FolderTree icon
  return IconComponent || FolderTree;
};

// Book reading spinner component
const BookLoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <motion.div
      animate={{ 
        rotateY: [0, 180, 360],
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative"
    >
      <BookOpen className="w-16 h-16 text-primary" />
    </motion.div>
    
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-6 text-center"
    >
      <h3 className="text-lg font-medium text-foreground mb-2">
        Turning the Pages...
      </h3>
      <p className="text-muted-foreground text-sm">
        Discovering amazing destinations in Sri Lanka
      </p>
      
      {/* Animated dots */}
      <div className="flex justify-center mt-4 space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        ))}
      </div>
    </motion.div>
  </div>
);

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  color: string;
}

// Dummy categories data
const dummyCategories: Category[] = [];

interface CategoryPageProps {
  onCategorySelect: (categoryId: string) => void;
}

const CategoryPage = ({ onCategorySelect }: CategoryPageProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryType, setCategoryType] = useState<'category' | 'location'>('category');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first
        try {
          const response = await apiClient.getCategories({ type: categoryType });
          const apiCategories = response.data?.categories || [];
          
          if (apiCategories.length > 0) {
            // Map API categories to match our interface
            const mappedCategories = apiCategories.map((cat: any) => ({
              id: cat.id,
              title: cat.title,
              description: cat.description,
              icon: getIconComponent(cat.icon),
              image: cat.imageUrl,
              color: cat.color,
            }));
            
            setCategories(mappedCategories);
          } else {
            // Use dummy data if API returns empty
            setCategories(dummyCategories);
          }
        } catch (apiError: unknown) {
          console.log('API not available, using dummy data', apiError);
          // Use dummy data on API error
          setCategories(dummyCategories);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories(dummyCategories);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [categoryType]);

  return (
    <div className="h-screen bg-gradient-paper relative overflow-y-auto hide-scrollbar" style={{ scrollBehavior: 'smooth', touchAction: 'pan-y' }}>
      {/* Cultural Pattern Background */}
      <div className="cultural-pattern" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 pt-16 pb-8 text-center"
      >
        <h1 className="chapter-title mb-4">
          Explore Sri Lanka
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
          <span className="font-bold text-primary">Choose your adventure</span> and discover the incredible diversity of the Pearl of the Indian Ocean
        </p>
      </motion.div>

      {/* Category Type Toggle */}
      <div className="relative z-10 px-4 pb-6">
        <div className="max-w-6xl mx-auto flex justify-center">
          <div className="inline-flex items-center p-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-border">
            <button
              onClick={() => setCategoryType('category')}
              className={`
                px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                ${categoryType === 'category'
                  ? 'bg-green-100 text-green-700 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Categories
            </button>
            <button
              onClick={() => setCategoryType('location')}
              className={`
                px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200
                ${categoryType === 'location'
                  ? 'bg-blue-100 text-blue-700 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              Locations
            </button>
          </div>
        </div>
      </div>

      {/* Loading Spinner or Categories Grid */}
      <div className="relative z-10 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading && <BookLoadingSpinner />}
          
          {!loading && categories.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                whileHover={{ y: -8 }}
                className="category-tile group"
                onClick={() => onCategorySelect(category.id)}
              >
                {/* Category Image */}
                <div className="relative h-48 md:h-56 overflow-hidden rounded-t-xl">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} group-hover:opacity-80 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-sm rounded-full">
                    <category.icon className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                    {category.description}
                  </p>
                  
                  {/* Call to Action */}
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium text-sm group-hover:text-primary-glow transition-colors duration-300">
                      Explore Places
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </motion.div>
            ))}
            </div>
          )}
          
          {!loading && categories.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Categories Found</h3>
              <p className="text-muted-foreground text-sm">Please check back later for amazing destinations.</p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-24 h-24 bg-cultural-gold/10 rounded-full blur-2xl" />
    </div>
  );
};

export default CategoryPage;