import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { generateWhatsAppUrl, WHATSAPP_ORDER_MESSAGE } from '../../utils/urls';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

export const ClosingCtaSection: React.FC = () => {
  const { categories, products, settings } = useStore();
  const featuredProduct = products.find(
    (product) => product.available && product.images.some(Boolean)
  );
  const image = featuredProduct?.images.find(Boolean) || '/social-share-1200x630.jpg';
  const whatsappUrl = generateWhatsAppUrl(settings.whatsappNumber, WHATSAPP_ORDER_MESSAGE);

  const getCategoryPath = (slugs: string[]) => {
    const category = categories.find(
      (item) =>
        slugs.includes(item.slug.toLowerCase()) || slugs.includes(item.name.toLowerCase())
    );
    return category?.slug ? `/category/${category.slug}` : '/shop';
  };

  const invitations = [
    { label: 'Discover cakes', path: getCategoryPath(['cake', 'cakes']) },
    { label: 'Choose flowers', path: getCategoryPath(['flower', 'flowers', 'bouquet', 'bouquets']) },
    { label: 'Create a celebration gift', path: getCategoryPath(['gift', 'gifts', 'hamper', 'hampers', 'combo', 'combos']) },
  ];

  return (
    <section className="overflow-hidden bg-[#30251F] py-16 text-[#FAF7F0] sm:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        <div className="lg:col-span-6">
          <span className="eyebrow-tag mb-3 block text-[#DFC79E]">For the moment you have in mind</span>
          <h2 className="max-w-xl font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Let’s make it a celebration.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#E8E2D5] sm:text-base">
            Find something thoughtful in the Cakes N More catalogue, or talk with the store about
            what you have in mind.
          </p>

          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {invitations.map((invitation) => (
              <Link
                key={invitation.label}
                to={invitation.path}
                className="inline-flex min-h-11 items-center justify-between gap-3 rounded-full border border-[#C5A46D]/60 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DFC79E]"
              >
                <span>{invitation.label}</span>
                <ArrowRight className="h-4 w-4 text-[#DFC79E]" />
              </Link>
            ))}
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-editorial-whatsapp mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold"
          >
            <WhatsAppIcon className="h-4 w-4" />
            <span>Ask us on WhatsApp</span>
          </a>
        </div>

        <div className="relative lg:col-span-6">
          <div className="aspect-[5/4] overflow-hidden rounded-3xl border border-[#C5A46D]/50 bg-[#4A3B32] shadow-2xl">
            <img
              src={image}
              alt={featuredProduct?.name || 'A selection from the Cakes N More catalogue'}
              loading="lazy"
              decoding="async"
              width={900}
              height={720}
              className="h-full w-full object-cover"
            />
          </div>
          {featuredProduct && (
            <Link
              to={`/product/${featuredProduct.slug}`}
              className="absolute bottom-4 left-4 right-4 flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/95 px-4 py-3 text-[#30251F] shadow-lg transition-transform hover:-translate-y-1 sm:bottom-6 sm:left-6 sm:right-6 sm:px-5"
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#81776C]">
                  From the current catalogue
                </span>
                <span className="block truncate font-serif text-base font-bold sm:text-lg">
                  {featuredProduct.name}
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-[#C5A46D]" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};
