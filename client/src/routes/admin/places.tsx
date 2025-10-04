import { createFileRoute } from '@tanstack/react-router'
import ManagePlacesPage from "../../components/admin/ManagePlacesPage";

export const Route = createFileRoute('/admin/places')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ManagePlacesPage />
}
