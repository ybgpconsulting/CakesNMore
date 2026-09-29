import React, { useEffect } from 'react';
import { getProductionUrl, PRODUCTION_ORIGIN } from '../../utils/seo';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: string;
  robots?: string;
  noindex?: boolean;
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'Cakes N More in Sector 76 Noida | 100% Eggless Cakes, Flowers & Gifts',
  description = 'Best bakery and florist in Sector 76 Noida. 100% eggless celebration cakes, exotic flowers, and luxury hampers with same-day and midnight delivery. WhatsApp ordering.',
  keywords = 'cake delivery sector 76 noida, best bakery in sector 76 noida, 100% eggless cakes noida, online cake delivery noida, midnight cake delivery noida, flower delivery sector 76 noida, florist noida',
  canonical,
  image = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop',
  type = 'website',
  robots,
  noindex = false,
  schema,
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tags
    const updateMeta = (nameAttr: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    updateMeta('name', 'description', description);
    if (keywords) {
      updateMeta('name', 'keywords', keywords);
    }
    updateMeta('property', 'og:title', title);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:image', image);
    updateMeta('property', 'og:type', type);
    updateMeta('property', 'og:site_name', 'Cakes N More');
    updateMeta('property', 'og:locale', 'en_IN');
    updateMeta('property', 'og:url', getProductionUrl(window.location.pathname));
    updateMeta('name', 'twitter:title', title);
    updateMeta('name', 'twitter:description', description);
    updateMeta('name', 'twitter:image', image);

    // Keep each client-side route canonical instead of inheriting index.html's URL.
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    const canonicalPath = canonical
      ? new URL(canonical, PRODUCTION_ORIGIN).pathname
      : window.location.pathname;
    link.setAttribute('href', getProductionUrl(canonicalPath));

    const effectiveRobots = noindex || window.location.pathname.startsWith('/admin')
      ? 'noindex,nofollow'
      : (robots || 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    updateMeta('name', 'robots', effectiveRobots);

    // Clean up any previously attached dynamic page schema
    const existingScript = document.getElementById('dynamic-page-schema');
    if (existingScript) {
      existingScript.remove();
    }

    // Dynamic JSON-LD script if provided
    let scriptEl: HTMLScriptElement | null = null;
    if (schema) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.id = 'dynamic-page-schema';
      scriptEl.text = JSON.stringify(schema);
      document.head.appendChild(scriptEl);
    }

    return () => {
      if (scriptEl && scriptEl.parentNode) {
        scriptEl.parentNode.removeChild(scriptEl);
      }
    };
  }, [title, description, keywords, canonical, image, type, robots, noindex, schema]);

  return null;
};
