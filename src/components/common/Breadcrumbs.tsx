import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-4 sm:mb-6 overflow-x-auto py-1 no-scrollbar ${className}`}
    >
      <ol className="flex items-center gap-1.5 text-xs text-[#81776C] whitespace-nowrap">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-[#81776C] hover:text-[#30251F] transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#C5A46D]" />
            <span className="sr-only sm:not-sr-only sm:inline">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5">
              <ChevronRight className="w-3 h-3 text-[#C5A46D] shrink-0" aria-hidden="true" />
              {isLast || !item.path ? (
                <span
                  className="font-medium text-[#30251F] truncate max-w-[200px] sm:max-w-none"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-[#81776C] hover:text-[#30251F] transition-colors truncate max-w-[160px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
