import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/places')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/places"!</div>
}
