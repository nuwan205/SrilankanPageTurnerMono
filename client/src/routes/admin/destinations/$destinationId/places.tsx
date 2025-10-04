import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/admin/destinations/$destinationId/places',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/destinations/$destinationId/places"!</div>
}
