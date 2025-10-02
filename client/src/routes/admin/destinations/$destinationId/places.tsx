import { createFileRoute } from '@tanstack/react-router';
import ManagePlacesPage from '@/components/admin/ManagePlacesPage';

export const Route = createFileRoute('/admin/destinations/$destinationId/places')({
  component: function AdminDestinationPlaces() {
    const { destinationId } = Route.useParams();
    return <ManagePlacesPage destinationId={destinationId} />;
  },
});
