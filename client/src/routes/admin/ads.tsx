import { createFileRoute } from '@tanstack/react-router'
import ManageAdsPage from '@/components/admin/ManageAdsPage'

export const Route = createFileRoute('/admin/ads')({
  component: ManageAdsPage,
})
