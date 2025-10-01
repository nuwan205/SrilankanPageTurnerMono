// Data store using localStorage for admin management
export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  color: string;
  enabled: boolean;
}

export interface Destination {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  rating: number;
  duration: string;
  highlights: string[];
  image: string;
  location: {
    lat: number;
    lng: number;
  };
  enabled: boolean;
}

const CATEGORIES_KEY = 'sri-lanka-categories';
const DESTINATIONS_KEY = 'sri-lanka-destinations';

// Default data
const defaultCategories: Category[] = [
  {
    id: 'wildlife',
    title: 'Wildlife Safari',
    description: 'Encounter elephants, leopards, and exotic birds in pristine national parks',
    icon: 'TreePine',
    image: '/src/assets/category-wildlife.jpg',
    color: 'from-accent/20 to-accent/5',
    enabled: true,
  },
  {
    id: 'beaches',
    title: 'Pristine Beaches',
    description: 'Relax on golden sands with crystal-clear waters and swaying palms',
    icon: 'Waves',
    image: '/src/assets/category-beaches.jpg',
    color: 'from-secondary/20 to-secondary/5',
    enabled: true,
  },
  {
    id: 'heritage',
    title: 'Ancient Heritage',
    description: 'Explore sacred temples, ancient ruins, and architectural marvels',
    icon: 'Building2',
    image: '/src/assets/category-heritage.jpg',
    color: 'from-cultural-gold/20 to-cultural-gold/5',
    enabled: true,
  },
  {
    id: 'hill-country',
    title: 'Hill Country',
    description: 'Journey through misty mountains and emerald tea plantations',
    icon: 'Mountain',
    image: '/src/assets/category-hill-country.jpg',
    color: 'from-accent/15 to-accent/3',
    enabled: true,
  },
  {
    id: 'adventure',
    title: 'Adventure Sports',
    description: 'Experience thrilling activities from rafting to rock climbing',
    icon: 'Zap',
    image: '/src/assets/category-adventure.jpg',
    color: 'from-primary/20 to-primary/5',
    enabled: true,
  },
  {
    id: 'cultural',
    title: 'Cultural Tours',
    description: 'Immerse in vibrant festivals, traditional arts, and local life',
    icon: 'Music',
    image: '/src/assets/category-cultural.jpg',
    color: 'from-lotus-pink/20 to-lotus-pink/5',
    enabled: true,
  },
];

const defaultDestinations: Destination[] = [
  {
    id: 'yala',
    categoryId: 'wildlife',
    name: 'Yala National Park',
    description: 'Famous for leopards and elephants, this is Sri Lanka\'s most visited national park.',
    rating: 4.8,
    duration: '2-3 hours',
    highlights: ['Leopard spotting', 'Elephant herds', 'Bird watching', 'Scenic landscapes'],
    image: '/placeholder-yala.jpg',
    location: { lat: 6.3728, lng: 81.5206 },
    enabled: true,
  },
  {
    id: 'udawalawe',
    categoryId: 'wildlife',
    name: 'Udawalawe National Park',
    description: 'Best place to see wild elephants in their natural habitat.',
    rating: 4.7,
    duration: '2-3 hours',
    highlights: ['Elephant observatory', 'Water buffalo', 'Crocodiles', 'Bird species'],
    image: '/placeholder-udawalawe.jpg',
    location: { lat: 6.4333, lng: 80.8833 },
    enabled: true,
  },
  {
    id: 'unawatuna',
    categoryId: 'beaches',
    name: 'Unawatuna Beach',
    description: 'A crescent-shaped beach with calm waters perfect for swimming.',
    rating: 4.6,
    duration: 'Full day',
    highlights: ['Swimming', 'Snorkeling', 'Beach restaurants', 'Sunset views'],
    image: '/placeholder-unawatuna.jpg',
    location: { lat: 6.0108, lng: 80.2494 },
    enabled: true,
  },
  {
    id: 'mirissa',
    categoryId: 'beaches',
    name: 'Mirissa Beach',
    description: 'Known for whale watching and stunning sunrise views.',
    rating: 4.9,
    duration: 'Full day',
    highlights: ['Whale watching', 'Surfing', 'Beach parties', 'Coconut palms'],
    image: '/placeholder-mirissa.jpg',
    location: { lat: 5.9486, lng: 80.4611 },
    enabled: true,
  },
  {
    id: 'sigiriya',
    categoryId: 'heritage',
    name: 'Sigiriya Rock Fortress',
    description: 'Ancient rock citadel with breathtaking frescoes and gardens.',
    rating: 4.9,
    duration: '3-4 hours',
    highlights: ['Ancient frescoes', 'Lion\'s Gate', 'Water gardens', 'Summit views'],
    image: '/placeholder-sigiriya.jpg',
    location: { lat: 7.9570, lng: 80.7603 },
    enabled: true,
  },
  {
    id: 'polonnaruwa',
    categoryId: 'heritage',
    name: 'Polonnaruwa',
    description: 'Medieval capital with well-preserved ruins and sculptures.',
    rating: 4.7,
    duration: '4-5 hours',
    highlights: ['Ancient temples', 'Buddha statues', 'Royal palace ruins', 'Archaeological site'],
    image: '/placeholder-polonnaruwa.jpg',
    location: { lat: 7.9403, lng: 81.0188 },
    enabled: true,
  },
];

// Categories
export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  if (!stored) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  }
  return JSON.parse(stored);
};

export const saveCategory = (category: Category): void => {
  const categories = getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index !== -1) {
    categories[index] = category;
  } else {
    categories.push(category);
  }
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const deleteCategory = (id: string): void => {
  const categories = getCategories().filter(c => c.id !== id);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
};

export const toggleCategoryEnabled = (id: string): void => {
  const categories = getCategories();
  const category = categories.find(c => c.id === id);
  if (category) {
    category.enabled = !category.enabled;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
};

// Destinations
export const getDestinations = (): Destination[] => {
  const stored = localStorage.getItem(DESTINATIONS_KEY);
  if (!stored) {
    localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(defaultDestinations));
    return defaultDestinations;
  }
  return JSON.parse(stored);
};

export const saveDestination = (destination: Destination): void => {
  const destinations = getDestinations();
  const index = destinations.findIndex(d => d.id === destination.id);
  if (index !== -1) {
    destinations[index] = destination;
  } else {
    destinations.push(destination);
  }
  localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(destinations));
};

export const deleteDestination = (id: string): void => {
  const destinations = getDestinations().filter(d => d.id !== id);
  localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(destinations));
};

export const toggleDestinationEnabled = (id: string): void => {
  const destinations = getDestinations();
  const destination = destinations.find(d => d.id === id);
  if (destination) {
    destination.enabled = !destination.enabled;
    localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(destinations));
  }
};

export const getDestinationsByCategory = (categoryId: string): Destination[] => {
  return getDestinations().filter(d => d.categoryId === categoryId);
};
