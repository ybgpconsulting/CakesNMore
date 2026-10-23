import React from 'react';

interface WhatsAppIconProps {
  className?: string;
  color?: string;
}

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = 'w-4 h-4',
  color = 'FFFFFF',
}) => (
  <img
    src={`https://cdn.simpleicons.org/whatsapp/${color.replace('#', '')}`}
    alt=""
    aria-hidden="true"
    className={className}
  />
);
