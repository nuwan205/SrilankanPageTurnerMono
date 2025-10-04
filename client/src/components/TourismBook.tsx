import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import BookLayout, { BookLayoutRef } from './BookLayout';
import CoverPage from './CoverPage';
import CategoryPage from './CategoryPage';
import PlacesPage from './PlacesPage';
import MapPage from './MapPage';

type BookPage = 'cover' | 'categories' | 'places' | 'map';

interface Ad {
  id: string;
  title: string;
  description: string;
  poster: string; // Main poster image
  images: string[]; // Gallery images
  rating: number;
  phone?: string;
  whatsapp?: string;
  email?: string;
  link: string;
  bookingLink?: string;
}

interface Place {
  id: string;
  name: string;
  description: string;
  rating: number;
  duration: string;
  timeDuration?: string;
  highlights?: string[];
  images: string[];
  location: {
    lat: number;
    lng: number;
  };
  // Best Time Travel Info
  bestTime?: string;
  travelTime?: string;
  idealFor?: string;
  // Single ad for backward compatibility
  ad?: Ad;
  // Multiple ads list
  ads?: Ad[];
}

interface BookState {
  currentPage: BookPage;
  selectedCategory: string | null;
  selectedPlace: Place | null;
}

const TourismBook: React.FC = () => {
  const [bookState, setBookState] = useState<BookState>({
    currentPage: 'cover',
    selectedCategory: null,
    selectedPlace: null,
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const bookLayoutRef = useRef<BookLayoutRef>(null);
  const totalPages = 4; // Cover, Categories, Places, Map

  const handleStartJourney = () => {
    setBookState(prev => ({ ...prev, currentPage: 'categories' }));
    // Call the paginate function directly with direction 1 (forward)
    bookLayoutRef.current?.paginate(1);
  };

  const handleCategorySelect = (categoryId: string) => {
    setBookState(prev => ({ 
      ...prev, 
      currentPage: 'places',
      selectedCategory: categoryId 
    }));
    setCurrentPageIndex(2);
  };

  const handlePlaceSelect = (place: Place) => {
    setBookState(prev => ({ 
      ...prev, 
      currentPage: 'map',
      selectedPlace: place 
    }));
    setCurrentPageIndex(3);
  };

  const handleBackToCategories = () => {
    setBookState(prev => ({ 
      ...prev, 
      currentPage: 'categories',
      selectedCategory: null 
    }));
    // Call the paginate function directly with direction -1 (backward)
    bookLayoutRef.current?.paginate(-1);
  };

  const handleBackToPlaces = () => {
    setBookState(prev => ({ 
      ...prev, 
      currentPage: 'places',
      selectedPlace: null 
    }));
    // Call the paginate function directly with direction -1 (backward)
    bookLayoutRef.current?.paginate(-1);
  };

  const handlePageChange = (pageIndex: number) => {
    // Validate navigation requirements and show gentle messages
    if (pageIndex === 2 && !bookState.selectedCategory) {
      toast.info("Please select a category to view places! 🗺️", {
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        descriptionClassName: 'text-gray-700 font-medium',
      });
      return; // Don't navigate
    }
    
    if (pageIndex === 3 && !bookState.selectedPlace) {
      toast.info("Please choose a place to view the map! 📍", {
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#1f2937',
          border: '1px solid #e5e7eb',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
      });
      return; // Don't navigate
    }

    setCurrentPageIndex(pageIndex);
    
    switch (pageIndex) {
      case 0:
        setBookState({
          currentPage: 'cover',
          selectedCategory: null,
          selectedPlace: null,
        });
        break;
      case 1:
        setBookState(prev => ({
          ...prev,
          currentPage: 'categories',
          selectedPlace: null,
        }));
        break;
      case 2:
        if (bookState.selectedCategory) {
          setBookState(prev => ({
            ...prev,
            currentPage: 'places',
            selectedPlace: null,
          }));
        }
        break;
      case 3:
        if (bookState.selectedPlace) {
          setBookState(prev => ({
            ...prev,
            currentPage: 'map',
          }));
        }
        break;
    }
  };

  const renderCurrentPage = () => {
    switch (bookState.currentPage) {
      case 'cover':
        return <CoverPage onStartJourney={handleStartJourney} />;
      
      case 'categories':
        return <CategoryPage onCategorySelect={handleCategorySelect} />;
      
      case 'places':
        return bookState.selectedCategory ? (
          <PlacesPage
            categoryId={bookState.selectedCategory}
            onPlaceSelect={handlePlaceSelect}
            onBack={handleBackToCategories}
          />
        ) : null;
      
      case 'map':
        return bookState.selectedPlace ? (
          <MapPage
            place={bookState.selectedPlace}
            onBack={handleBackToPlaces}
          />
        ) : null;
      
      default:
        return <CoverPage onStartJourney={handleStartJourney} />;
    }
  };

  // Determine if navigation should be shown based on current state
  const shouldShowNavigation = () => {
    if (bookState.currentPage === 'cover') return false;
    if (bookState.currentPage === 'places' && !bookState.selectedCategory) return false;
    if (bookState.currentPage === 'map' && !bookState.selectedPlace) return false;
    return true;
  };

  return (
    <div className="md:desk-surface">
      <BookLayout
        ref={bookLayoutRef}
        currentPage={currentPageIndex}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        showNavigation={shouldShowNavigation()}
      >
        {renderCurrentPage()}
      </BookLayout>
    </div>
  );
};

export default TourismBook;