import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/categories/$categoryId/places')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/categories/$categoryId/places"!</div>
}
