import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import Navbar from '../components/common/Navbar'
import BottomNav from '../components/common/BottomNav'
import FloatingButtons from '../components/common/FloatingButtons'
import Footer from '../components/common/Footer'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { useRoleAuth } from '../context/RoleAuthContext'

const HIDE_FOOTER = ['/cart', '/checkout', '/order-success']

export default function MainLayout() {
  const location = useLocation()
  const { currentUser, userProfile } = useRoleAuth()
  usePushNotifications(currentUser?.uid, userProfile?.role)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  const hideFooter = HIDE_FOOTER.includes(location.pathname)

  return (
    <>
      {/* FIX: Default SEO meta — individual pages override with their own Helmet */}
      <Helmet defaultTitle="مطعم الحبايب" titleTemplate="%s — مطعم الحبايب">
        <meta name="description" content="مطعم الحبايب — أكل مصري بيتي حقيقي. مشاوي، كشري، حمام محشي وأكثر. توصيل سريع لجميع مناطق القاهرة." />
        <meta name="theme-color" content="#C8960C" />
        <html lang="ar" dir="rtl" />
      </Helmet>

      <div className="flex flex-col min-h-screen dark:bg-zinc-950 bg-gray-50">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-0" id="main-content">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
        {!hideFooter && <Footer />}
        <BottomNav />
        <FloatingButtons />
      </div>
    </>
  )
}
