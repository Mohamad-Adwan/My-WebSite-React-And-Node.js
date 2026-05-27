import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
const WhatsAppChat: React.FC = () => {
  // Replace with your WhatsApp number (in international format without + sign)
  const whatsappNumber = '+970595642327'; // Replace with your actual number
  const defaultMessage = 'مرحباً! أريد الاستفسار عن منتجاتكم.';

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      onClick={openWhatsApp}
      className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50 bg-green-500 hover:bg-green-600 text-white"
      size="icon"
      title="تواصل معنا عبر واتساب"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};

export default WhatsAppChat;
