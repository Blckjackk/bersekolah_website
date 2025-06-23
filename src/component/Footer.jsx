import React, { useState } from 'react';
import { Link } from '@heroui/react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import EasterEggModal from './EasterEggModal';

const Footer = () => {
  const [showEasterEgg, setShowEasterEgg] = useState(false);

  const navigation = {
    main: [
      { name: 'Beranda', href: '/' },
      { name: 'Tentang Kami', href: '/tentang' },
      { name: 'Program Beasiswa', href: '/beasiswa' },
      { name: 'Donasi', href: '/donasi' },
    ],
    resources: [
      { name: 'Artikel', href: '/artikel' },
      { name: 'Testimoni', href: '/testimoni' },
      { name: 'Bantuan', href: '/bantuan' },
      { name: 'FAQ', href: '/faq' },
    ],
    legal: [
      { name: 'Kebijakan Privasi', href: '/privacy' },
      { name: 'Syarat Layanan', href: '/terms' },
      { name: 'Kontak', href: '/kontak' },
      { name: 'Karir', href: '/karir' },
    ]
  };

  const socialLinks = [
    { 
      name: 'Facebook', 
      href: '#', 
      icon: Facebook,
      color: 'text-blue-600 hover:text-blue-700'
    },
    { 
      name: 'Twitter', 
      href: '#', 
      icon: Twitter,
      color: 'text-sky-500 hover:text-sky-600'
    },
    { 
      name: 'Instagram', 
      href: '#', 
      icon: Instagram,
      color: 'text-pink-500 hover:text-pink-600'
    },
    { 
      name: 'YouTube', 
      href: '#', 
      icon: Youtube,
      color: 'text-red-600 hover:text-red-700'
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'info@bersekolah.org',
      href: 'mailto:info@bersekolah.org'
    },
    {
      icon: Phone,
      label: 'Telepon',
      value: '+62 21 1234 5678',
      href: 'tel:+62211234567'
    },
    {
      icon: MapPin,
      label: 'Alamat',
      value: 'Jakarta Selatan, DKI Jakarta, Indonesia',
      href: 'https://maps.google.com/?q=Jakarta+Selatan'
    }
  ];

  // FIXED: Single click untuk easter egg
  const handleEasterEggClick = () => {
    setShowEasterEgg(true);
  };

  return (
    <>
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <img src="assets/image/logo footer.png" alt="Bersekolah Logo" className="w-auto h-12" />
              </div>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                Kami berkomitmen membantu pelajar yang bersemangat mewujudkan mimpi melalui program beasiswa dan donasi yang transparan serta berkelanjutan.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className={`p-2 transition-all duration-200 bg-white rounded-lg shadow-sm hover:shadow-md hover:scale-110 ${social.color}`}
                      aria-label={social.name}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Main Navigation */}
            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">
                Navigasi Utama
              </h4>
              <ul className="space-y-3">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 transition-colors duration-200 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">
                Sumber Daya
              </h4>
              <ul className="space-y-3">
                {navigation.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 transition-colors duration-200 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Legal */}
            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase">
                Kontak & Legal
              </h4>
              
              {/* Contact Info */}
              <div className="mb-6 space-y-3">
                {contactInfo.map((contact) => {
                  const IconComponent = contact.icon;
                  return (
                    <div key={contact.label} className="flex items-start space-x-2">
                      <IconComponent className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs tracking-wider text-gray-500 uppercase">
                          {contact.label}
                        </p>
                        {contact.href && contact.href !== '#' ? (
                          <Link
                            href={contact.href}
                            className="text-sm text-gray-600 break-words hover:text-gray-900"
                            target={contact.label === 'Alamat' ? '_blank' : undefined}
                          >
                            {contact.value}
                          </Link>
                        ) : (
                          <p className="text-sm text-gray-600 break-words">{contact.value}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="my-8 border-t border-gray-200" />

          {/* Bottom Section */}
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-500">
                &copy; 2025 Yayasan Inspirasi Semangat Sekolah. Semua hak dilindungi undang-undang.
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <button
                  onClick={handleEasterEggClick}
                  className="relative transition-all duration-300 cursor-pointer hover:text-gray-600 hover:scale-105 active:scale-95 group"
                  title="Klik untuk melihat tim developer!"
                >
                  <span className="relative">
                    Made with ❤️ for Education
                    <span className="absolute inset-0 text-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text">
                      Made with ❤️ for Education
                    </span>
                  </span>
                </button>
                <span>•</span>
                <span>Version 1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Easter Egg Modal */}
      <EasterEggModal 
        isOpen={showEasterEgg} 
        onClose={() => setShowEasterEgg(false)} 
      />
    </>
  );
};

export default Footer;