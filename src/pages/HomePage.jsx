import { Helmet } from 'react-helmet-async'
import HeroSection    from '../components/home/HeroSection'
import PopularSection from '../components/home/PopularSection'
import OffersSection  from '../components/home/OffersSection'
import WhyUsSection   from '../components/home/WhyUsSection'
import StatsSection   from '../components/home/StatsSection'
import ReviewsSection from '../components/home/ReviewsSection'
import ContactSection from '../components/home/ContactSection'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>مطعم الحبايب — أكل مصري بيتي حقيقي</title>
        <meta name="description" content="مطعم الحبايب — مشاوي على الفحم البلدي، كشري، حمام محشي وأكثر. توصيل سريع في القاهرة. اطلب دلوقتي!" />
        <meta property="og:title"       content="مطعم الحبايب — أكل مصري بيتي حقيقي" />
        <meta property="og:description" content="مشاوي، كشري، حمام محشي — توصيل سريع لبيتك" />
      </Helmet>
      <HeroSection />
      <PopularSection />
      <OffersSection />
      <WhyUsSection />
      <StatsSection />
      <ReviewsSection />
      <ContactSection />
    </>
  )
}
