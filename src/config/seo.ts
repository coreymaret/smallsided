// src/config/seo.ts

export interface PageSEO {
  title: string;
  description: string;
  keywords: string;
  url: string;
  image?: string;
  imageAlt?: string;
  schema?: object;
  noindex?: boolean;
  nofollow?: boolean;
}

const BASE_URL = 'https://www.smallsided.com';
const OG_IMAGE = `${BASE_URL}/og-image.jpg`;
const LOGO_URL = `${BASE_URL}/logo.png`;

// ─── Shared location data (used across all service schemas) ──────────────────

const smallSidedLocation = {
  '@context': 'https://schema.org',
  '@type': ['SportsActivityLocation', 'LocalBusiness'],
  name: 'Small Sided',
  description: 'Year-round climate-controlled indoor small-sided soccer facility in Tampa, FL.',
  url: BASE_URL,
  logo: LOGO_URL,
  image: OG_IMAGE,
  telephone: '+17274762237',
  email: 'info@smallsided.com',
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Cash, Credit Card',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Small Sided Way',
    addressLocality: 'Tampa',
    addressRegion: 'FL',
    postalCode: '33617',
    addressCountry: 'US'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 28.0587,
    longitude: -82.4139
  },
  areaServed: {
    '@type': 'City',
    name: 'Tampa'
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '23:59'
    }
  ],
  sameAs: [
    'https://www.facebook.com/SmallSided',
    'https://www.instagram.com/SmallSided'
  ]
};

// ─── SEO config per page ──────────────────────────────────────────────────────

export const seoConfig: Record<string, PageSEO> = {

  home: {
    title: 'Small Sided | Indoor Soccer Tampa, FL',
    description: 'Tampa\'s premier indoor small-sided soccer facility. Field rentals, leagues, pickup games, birthday parties, camps, and training. Open daily 10am–midnight.',
    keywords: 'indoor soccer Tampa, small sided soccer Tampa, soccer field rental Tampa, soccer leagues Tampa, pickup soccer Tampa, youth soccer Tampa',
    url: '/',
    image: OG_IMAGE,
    imageAlt: 'Small Sided indoor soccer facility in Tampa, FL',
    schema: {
      '@context': 'https://schema.org',
      '@type': ['Organization', 'LocalBusiness', 'SportsActivityLocation'],
      name: 'Small Sided',
      url: BASE_URL,
      logo: LOGO_URL,
      image: OG_IMAGE,
      telephone: '+17274762237',
      email: 'info@smallsided.com',
      description: 'Tampa\'s premier indoor small-sided soccer facility. Small field. Big impact.',
      priceRange: '$$',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Small Sided Way',
        addressLocality: 'Tampa',
        addressRegion: 'FL',
        postalCode: '33617',
        addressCountry: 'US'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 28.0587,
        longitude: -82.4139
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
          opens: '10:00',
          closes: '23:59'
        }
      ],
      sameAs: [
        'https://www.facebook.com/SmallSided',
        'https://www.instagram.com/SmallSided'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+17274762237',
        contactType: 'Customer Service',
        email: 'info@smallsided.com',
        areaServed: 'Tampa, FL',
        availableLanguage: ['English', 'Spanish']
      }
    }
  },

  about: {
    title: 'About Small Sided | Indoor Soccer Tampa',
    description: 'Learn about Small Sided — Tampa\'s indoor soccer facility built for the love of the game. Our story, mission, and the fields that make it happen.',
    keywords: 'about Small Sided Tampa, indoor soccer facility Tampa, soccer community Tampa, small sided games',
    url: '/about',
    image: OG_IMAGE,
    imageAlt: 'Small Sided indoor soccer facility Tampa'
  },

  services: {
    title: 'Services | Small Sided Indoor Soccer Tampa',
    description: 'Field rentals, soccer leagues, pickup games, birthday parties, camps, and training — all under one roof in Tampa, FL. Book online today.',
    keywords: 'indoor soccer services Tampa, field rental Tampa, soccer leagues Tampa, soccer camps Tampa, soccer training Tampa',
    url: '/services',
    image: OG_IMAGE,
    imageAlt: 'Small Sided indoor soccer services Tampa',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Small Sided Soccer Services',
      provider: {
        '@type': 'LocalBusiness',
        name: 'Small Sided',
        telephone: '+17274762237',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Tampa',
          addressRegion: 'FL'
        }
      },
      areaServed: { '@type': 'City', name: 'Tampa' },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Indoor Soccer Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Field Rental' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Soccer Leagues' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pickup Soccer' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Birthday Parties' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Soccer Camps' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Private Training' } },
        ]
      }
    }
  },

  fieldRental: {
    title: 'Indoor Soccer Field Rental Tampa | Small Sided',
    description: 'Rent premium indoor soccer fields in Tampa. Perfect for practices, events, and private games. Flexible hourly booking, 3 fields available, open 10am–midnight.',
    keywords: 'indoor soccer field rental Tampa, soccer field hire Tampa, rent soccer field Tampa, small sided field rental, private soccer field Tampa',
    url: '/services/field-rental',
    image: OG_IMAGE,
    imageAlt: 'Indoor soccer field rental at Small Sided Tampa',
    schema: {
      ...smallSidedLocation,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Field Rental Options',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Hourly Field Rental', description: 'Rent Camp Nou, Old Trafford, or San Siro by the hour' },
            areaServed: { '@type': 'City', name: 'Tampa' }
          }
        ]
      }
    }
  },

  birthdayParties: {
    title: 'Soccer Birthday Parties Tampa | Small Sided',
    description: 'Throw the ultimate soccer birthday party at Small Sided in Tampa. Fun games, exclusive field access, and party packages for kids of all ages. Book online.',
    keywords: 'soccer birthday party Tampa, kids birthday party Tampa, sports birthday party Tampa, soccer party venue Tampa, youth birthday party ideas Tampa',
    url: '/services/birthday-parties',
    image: OG_IMAGE,
    imageAlt: 'Soccer birthday party at Small Sided Tampa',
    schema: {
      ...smallSidedLocation,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Birthday Party Packages',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: 'Soccer Birthday Party Package' },
            areaServed: { '@type': 'City', name: 'Tampa' }
          }
        ]
      }
    }
  },

  leagues: {
    title: 'Indoor Soccer Leagues Tampa | Small Sided',
    description: 'Join adult and youth indoor soccer leagues in Tampa. Men, Women, Coed, Over 30, Over 40, and youth divisions U8–U18. Year-round seasons. Register your team today.',
    keywords: 'indoor soccer league Tampa, adult soccer league Tampa, youth soccer league Tampa, coed soccer league Tampa, recreational soccer Tampa, competitive soccer league Tampa',
    url: '/services/leagues',
    image: OG_IMAGE,
    imageAlt: 'Indoor soccer leagues at Small Sided Tampa',
    schema: {
      ...smallSidedLocation,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Soccer League Programs',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Adult Soccer League — Men, Women, Coed, Over 30, Over 40' }, areaServed: { '@type': 'City', name: 'Tampa' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Youth Soccer League — U8 through U18' }, areaServed: { '@type': 'City', name: 'Tampa' } }
        ]
      }
    }
  },

  pickup: {
    title: 'Pickup Soccer Tampa | Small Sided',
    description: 'Drop in for pickup soccer in Tampa anytime. No commitment, no team required. Join a game, meet new players, and enjoy casual small-sided soccer. Open daily.',
    keywords: 'pickup soccer Tampa, drop in soccer Tampa, casual soccer Tampa, open play soccer Tampa, soccer near me Tampa, adult pickup soccer Tampa',
    url: '/services/pickup',
    image: OG_IMAGE,
    imageAlt: 'Pickup soccer games at Small Sided Tampa',
    schema: {
      ...smallSidedLocation,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Pickup Soccer',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Drop-In Pickup Soccer Games' }, areaServed: { '@type': 'City', name: 'Tampa' } }
        ]
      }
    }
  },

  camps: {
    title: 'Soccer Camps Tampa | Small Sided',
    description: 'Intensive soccer camps for youth players in Tampa. Skill development, tactical training, and expert coaching. Summer and seasonal camp programs for ages 8–17.',
    keywords: 'soccer camps Tampa, youth soccer camp Tampa, summer soccer camp Tampa, soccer training camp Tampa, kids soccer camp Tampa, soccer academy Tampa',
    url: '/services/camps',
    image: OG_IMAGE,
    imageAlt: 'Youth soccer camps at Small Sided Tampa',
    schema: {
      ...smallSidedLocation,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Soccer Camp Programs',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Youth Soccer Camp — Ages 8–14' }, areaServed: { '@type': 'City', name: 'Tampa' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Elite Soccer Camp — Ages 12–17' }, areaServed: { '@type': 'City', name: 'Tampa' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Goalkeeper Camp — Ages 10–16' }, areaServed: { '@type': 'City', name: 'Tampa' } }
        ]
      }
    }
  },

  training: {
    title: 'Soccer Training Tampa | Small Sided',
    description: 'Private and group soccer training in Tampa for players of all ages and skill levels. Work with experienced coaches to develop technical skills, fitness, and game intelligence.',
    keywords: 'soccer training Tampa, private soccer coaching Tampa, soccer lessons Tampa, individual soccer training Tampa, soccer skills Tampa, soccer coach Tampa',
    url: '/services/training',
    image: OG_IMAGE,
    imageAlt: 'Soccer training at Small Sided Tampa',
    schema: {
      ...smallSidedLocation,
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Training Programs',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Private Training Sessions' }, areaServed: { '@type': 'City', name: 'Tampa' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Group Training Programs' }, areaServed: { '@type': 'City', name: 'Tampa' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Youth Development Training' }, areaServed: { '@type': 'City', name: 'Tampa' } }
        ]
      }
    }
  },

  blog: {
    title: 'Blog | Small Sided Soccer Tampa',
    description: 'Soccer tips, facility news, league updates, and community stories from Small Sided — Tampa\'s indoor soccer facility.',
    keywords: 'soccer blog Tampa, indoor soccer news Tampa, soccer tips, Small Sided news, Tampa soccer community',
    url: '/blog',
    image: OG_IMAGE,
    imageAlt: 'Small Sided soccer blog'
  },

  contact: {
    title: 'Contact Small Sided | Tampa Indoor Soccer',
    description: 'Get in touch with Small Sided. Call (727) 476-2237, email info@smallsided.com, or send us a message. Located in Tampa, FL. Open daily 10am–midnight.',
    keywords: 'contact Small Sided Tampa, indoor soccer Tampa phone, soccer facility Tampa contact, Small Sided address Tampa',
    url: '/contact',
    image: OG_IMAGE,
    imageAlt: 'Contact Small Sided Tampa',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Small Sided',
      description: 'Contact Small Sided indoor soccer facility in Tampa, FL',
      mainEntity: {
        '@type': 'LocalBusiness',
        name: 'Small Sided',
        telephone: '+17274762237',
        email: 'info@smallsided.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '123 Small Sided Way',
          addressLocality: 'Tampa',
          addressRegion: 'FL',
          postalCode: '33617',
          addressCountry: 'US'
        }
      }
    }
  },

  privacyPolicy: {
    title: 'Privacy Policy | Small Sided',
    description: 'Read Small Sided\'s privacy policy. Learn how we collect, use, and protect your personal information.',
    keywords: 'privacy policy, data protection, personal information',
    url: '/PrivacyPolicy',
    noindex: true
  },

  tos: {
    title: 'Terms of Service | Small Sided',
    description: 'Review Small Sided\'s terms of service and conditions for using our facility and services.',
    keywords: 'terms of service, terms and conditions, user agreement',
    url: '/TOS',
    noindex: true
  },

  cookiePolicy: {
    title: 'Cookie Policy | Small Sided',
    description: 'Learn about Small Sided\'s cookie policy and how we use cookies.',
    keywords: 'cookie policy, cookies, website tracking',
    url: '/CookiePolicy',
    noindex: true
  }
};

// Helper function to get SEO config
export const getSEOConfig = (page: keyof typeof seoConfig): PageSEO => {
  return seoConfig[page] || seoConfig.home;
};