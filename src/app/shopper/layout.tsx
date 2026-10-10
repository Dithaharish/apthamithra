import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ShopperNav } from "@/components/shopper-nav"

export default function ShopperLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex">
        <ShopperNav />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full">{children}</main>
      </div>
      <SiteFooter />
    </div>
  )
}
