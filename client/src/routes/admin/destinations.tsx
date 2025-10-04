import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/destinations')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/destinations"!</div>
}
