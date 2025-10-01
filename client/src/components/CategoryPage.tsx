import React from 'react';
import { motion } from 'framer-motion';
import { 
  TreePine, 
  Waves, 
  Building2, 
  Mountain, 
  Zap, 
  Music,
  ArrowRight 
} from 'lucide-react';

// Import category images
import wildlifeImage from '@/assets/category-wildlife.jpg';
import beachesImage from '@/assets/category-beaches.jpg';
import heritageImage from '@/assets/category-heritage.jpg';
import hillCountryImage from '@/assets/category-hill-country.jpg';
import adventureImage from '@/assets/category-adventure.jpg';
import culturalImage from '@/assets/category-cultural.jpg';

interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
  color: string;
}

const categories: Category[] = [
  {
    id: 'wildlife',
    title: 'Wildlife Safari',
    description: 'Encounter elephants, leopards, and exotic birds in pristine national parks',
    icon: TreePine,
    image: wildlifeImage,
    color: 'from-accent/20 to-accent/5',
  },
  {
    id: 'beaches',
    title: 'Pristine Beaches',
    description: 'Relax on golden sands with crystal-clear waters and swaying palms',
    icon: Waves,
    image: beachesImage,
    color: 'from-secondary/20 to-secondary/5',
  },
  {
    id: 'heritage',
    title: 'Ancient Heritage',
    description: 'Explore sacred temples, ancient ruins, and architectural marvels',
    icon: Building2,
    image: heritageImage,
    color: 'from-cultural-gold/20 to-cultural-gold/5',
  },
  {
    id: 'hill-country',
    title: 'Hill Country',
    description: 'Journey through misty mountains and emerald tea plantations',
    icon: Mountain,
    image: hillCountryImage,
    color: 'from-accent/15 to-accent/3',
  },
  {
    id: 'adventure',
    title: 'Adventure Sports',
    description: 'Experience thrilling activities from rafting to rock climbing',
    icon: Zap,
    image: adventureImage,
    color: 'from-primary/20 to-primary/5',
  },
  {
    id: 'cultural',
    title: 'Cultural Tours',
    description: 'Immerse in vibrant festivals, traditional arts, and local life',
    icon: Music,
    image: culturalImage,
    color: 'from-lotus-pink/20 to-lotus-pink/5',
  },
];

interface CategoryPageProps {
  onCategorySelect: (categoryId: string) => void;
}

const CategoryPage: React.FC<CategoryPageProps> = ({ onCategorySelect }) => {
  return (
    <div className="min-h-screen bg-gradient-paper relative overflow-hidden">
      {/* Cultural Pattern Background */}
      <div className="cultural-pattern" />
      
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
          Choose your adventure and discover the incredible diversity of the Pearl of the Indian Ocean
        </p>
      </motion.div>

      {/* Categories Grid */}
      <div className="relative z-10 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
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
                  <h3 className="text-xl font-medium text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {category.description}
                  </p>
                  
                  {/* Call to Action */}
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium text-sm group-hover:text-primary-glow transition-colors duration-300">
                      Explore Destinations
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="fixed bottom-24 right-8 w-64 h-20 bg-card/60 backdrop-blur-sm border border-primary/20 rounded-lg shadow-soft"
      >
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          Advertisement Space
        </div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-24 h-24 bg-cultural-gold/10 rounded-full blur-2xl" />
    </div>
  );
};

export default CategoryPage;