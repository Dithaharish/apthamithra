import { AdminNav } from "@/components/admin-nav"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <AdminNav />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full">
        {children}
      </main>
    </div>
  )
}