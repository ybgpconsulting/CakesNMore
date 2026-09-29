import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Cake, Clock, Heart, MapPin, Phone, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { SEO } from '../components/common/SEO';
import { useStore } from '../context/StoreContext';
import { getProductionUrl } from '../utils/seo';

export const AboutPage: React.FC = () => {
  const { settings } = useStore();

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': getProductionUrl('/about'),
        name: 'About Cakes N More Sector 76 Noida',
        description: 'About Cakes N More - premier 100% eggless bakery and boutique florist in Sector 76 Noida.',
        url: getProductionUrl('/about'),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: getProductionUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'About Us', item: getProductionUrl('/about') },
        ],
      },
    ],
  };

  const aboutKeywords = [
    'about cakes n more noida',
    'bakery in sector 76 noida',
    'eggless patisserie noida',
    'cake shop near mithaas amrapali silicon city',
    'florist in sector 76 noida',
    'flower shop noida 201301',
    'midnight cake delivery noida',
  ].join(', ');

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-12 sm:py-16">
      <SEO
        title="About Us | Cakes N More Noida Sector 76"
        description="Learn about Cakes N More in Sector 76 Noida. Your neighborhood boutique bakery, flower shop and luxury gift studio at Amrapali Crystal Home."
        keywords={aboutKeywords}
        schema={aboutSchema}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header Block */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FCE7F3] text-[#831843] text-xs font-bold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" />
            <span>Serving Sector 76 Noida</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#29141B] tracking-tight">
            Crafting Sweet Moments &amp; Fresh Blooms
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to Cakes N More, located at Shop 29, Ground Floor, Amrapali Crystal Home, Sector 76, Noida.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EADBDA] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4 text-gray-700 text-sm sm:text-base leading-relaxed">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Our Passion for Celebrations
            </h2>
            <p>
              Located conveniently in the heart of Sector 76 near Mithaas at Amrapali Silicon City,
              our boutique brings together the artistry of European patisserie and the timeless charm
              of fresh floristry.
            </p>
            <p>
              Whether you are planning a grand midnight birthday surprise, an intimate anniversary dinner,
              or a congratulatory flower arrangement, our artisans handcraft every cake on order and
              select fresh-cut morning blooms from the most reputable flower growers.
            </p>
            <p>
              By combining bakery, flowers, plants, and gifting under one roof, we make gifting effortless,
              delivering prompt doorstep smiles across Noida.
            </p>
          </div>

          <div className="md:col-span-5 aspect-[4/5] rounded-2xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop"
              alt="Artisan cake preparation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Pillars of Quality */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#EADBDA] shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#FAF5F2] text-[#831843] flex items-center justify-center mx-auto mb-3">
              <Cake className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900">Oven-Fresh Guarantee</h3>
            <p className="text-xs text-gray-600">
              We never freeze or serve stale cakes. Every order is prepared specifically for your date and time slot.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#EADBDA] shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#FAF5F2] text-[#831843] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900">Hand-Selected Florals</h3>
            <p className="text-xs text-gray-600">
              Exotic Dutch roses, Asiatic lilies, orchids and carnations arranged by skilled florists.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#EADBDA] shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#FAF5F2] text-[#831843] flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-gray-900">Personalized Service</h3>
            <p className="text-xs text-gray-600">
              Custom weight, 100% pure eggless baking, hand-piped celebratory messages and personalized cards.
            </p>
          </div>
        </div>

        {/* Store Location Card */}
        <div className="bg-[#1C1618] text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-serif text-2xl font-bold">Visit Our Sector 76 Store</h3>
            <p className="text-sm text-[#D8C7C5] max-w-md">
              {settings.address}
            </p>
            <p className="text-xs text-[#E8A598]">Opening Hours: {settings.openingHours}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${settings.phone}`}
              className="px-6 py-3 rounded-full bg-white text-gray-900 text-xs font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{settings.phone}</span>
            </a>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-full bg-[#831843] text-white text-xs font-bold hover:bg-[#9D174D] transition-colors"
            >
              Order Online
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
