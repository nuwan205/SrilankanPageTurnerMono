import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import BookLayout, { BookLayoutRef } from './BookLayout';
import CoverPage from './CoverPage';
import CategoryPage from './CategoryPage';
import DestinationPage from './DestinationPage';
import PlacesPage from './PlacesPage';
import MapPage from './MapPage';

interface Destination {
  id: string;
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
}

type BookPage = 'cover' | 'categories' | 'destinations' | 'places' | 'map';

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
  ad?: {
    id: string;
    title: string;
    description: string;
    images: string[];
    rating: number;
    phone?: string;
    whatsapp?: string;
    email?: string;
    link: string;
    bookingLink?: string;
  };
}

interface BookState {
  currentPage: BookPage;
  selectedCategory: string | null;
  selectedDestination: Destination | null;
  selectedPlace: Place | null;
}

const TourismBook: React.FC = () => {
  const [bookState, setBookState] = useState<BookState>({
    currentPage: 'cover',
    selectedCategory: null,
    selectedDestination: null,
    selectedPlace: null,
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const bookLayoutRef = useRef<BookLayoutRef>(null);
  const totalPages = 5; // Cover, Categories, Destinations, Places, Map

  const handleStartJourney = () => {
    setBookState(prev => ({ ...prev, currentPage: 'categories' }));
    // Call the paginate function directly with direction 1 (forward)
    bookLayoutRef.current?.paginate(1);
  };

  const handleCategorySelect = (categoryId: string) => {
    setBookState(prev => ({ 
      ...prev, 
      currentPage: 'destinations',
      selectedCategory: categoryId 
    }));
    setCurrentPageIndex(2);
  };

  const handleDestinationSelect = (destination: Destination) => {
    setBookState(prev => ({ 
      ...prev, 
      currentPage: 'places',
      selectedDestination: destination 
    }));
    setCurrentPageIndex(3);
  };

  const handlePlaceSelect = (place: Place) => {
    setBookState(prev => ({ 
      ...prev, 
      currentPage: 'map',
      selectedPlace: place 
    }));
    setCurrentPageIndex(4);
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

  const handleBackToDestinations = () => {
    setBookState(prev => ({ 
      ...prev, 
      currentPage: 'destinations',
      selectedDestination: null,
      selectedPlace: null 
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
      toast.info("Please select a category to view destinations Page! 🗺️", {
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
    
    if (pageIndex === 3 && !bookState.selectedDestination) {
      toast.info("Please select a destination to view places Page! 🏞️", {
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
    
    if (pageIndex === 4 && !bookState.selectedPlace) {
      toast.info("Please choose a place to view the map Page! 📍", {
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
          selectedDestination: null,
          selectedPlace: null,
        });
        break;
      case 1:
        setBookState(prev => ({
          ...prev,
          currentPage: 'categories',
          selectedDestination: null,
          selectedPlace: null,
        }));
        break;
      case 2:
        if (bookState.selectedCategory) {
          setBookState(prev => ({
            ...prev,
            currentPage: 'destinations',
            selectedDestination: null,
            selectedPlace: null,
          }));
        }
        break;
      case 3:
        if (bookState.selectedDestination) {
          setBookState(prev => ({
            ...prev,
            currentPage: 'places',
            selectedPlace: null,
          }));
        }
        break;
      case 4:
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
      
      case 'destinations':
        return (
          <DestinationPage
            categoryId={bookState.selectedCategory || ''}
            onDestinationSelect={handleDestinationSelect}
            onBack={handleBackToCategories}
          />
        );
      
      case 'places':
        return bookState.selectedDestination ? (
          <PlacesPage
            destination={bookState.selectedDestination}
            onPlaceSelect={handlePlaceSelect}
            onBack={handleBackToDestinations}
          />
        ) : null;
      
      case 'map':
        return bookState.selectedPlace ? (
          <MapPage
            destination={bookState.selectedDestination!}
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
    if (bookState.currentPage === 'destinations' && !bookState.selectedCategory) return false;
    if (bookState.currentPage === 'places' && !bookState.selectedDestination) return false;
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