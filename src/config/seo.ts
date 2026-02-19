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

const smallSidedLocation = {
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  name: 'Small Sided',
  description: 'Year-round climate-controlled indoor small-sided soccer facility in Tampa, FL.',
  url: 'https://www.smallsided.com',
  logo: 'https://www.smallsided.com/logo.png',
  image: 'https://www.smallsided.com/og-image.jpg',
  telephone: '(555) 123-4567',
  email: 'info@smallsided.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Soccer Lane',
    addressLocality: 'Tampa',
    addressRegion: 'FL',
    postalCode: '33612',
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
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '06:00',
      closes: '22:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00'
    }
  ],
  sameAs: [
    'https://www.facebook.com/SmallSided',
    'https://twitter.com/SmallSided',
    'https://www.instagram.com/SmallSided'
  ]
};

export const seoConfig: Record<string, PageSEO> = {
  home: {
    title: 'Small Sided | Small field. Big impact.',
    description: 'Transform your soccer skills with Small Sided. Professional training programs, competitive leagues, and expert coaching for youth and adults.',
    keywords: 'small sided soccer, soccer training, youth soccer, adult soccer leagues, soccer skills, soccer coaching, pickup soccer',
    url: '/',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Small Sided',
      url: 'https://www.smallsided.com',
      logo: 'https://www.smallsided.com/logo.png',
      description: 'Small field. Big impact.',
      sameAs: [
        'https://www.facebook.com/SmallSided',
        'https://twitter.com/SmallSided',
        'https://www.instagram.com/SmallSided'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'info@smallsided.com'
      }
    }
  },

  about: {
    title: 'About Us | Small Sided',
    description: 'Learn about Small Sided\'s mission to revolutionize soccer training through innovative small-sided games and expert coaching methodology.',
    keywords: 'about small sided soccer, soccer training philosophy, small sided games benefits, soccer coaching approach',
    url: '/about'
  },

  services: {
    title: 'Services | Small Sided',
    description: 'Explore Small Sided\'s comprehensive soccer services: player development programs, coaching education, leagues, and consulting for clubs and organizations.',
    keywords: 'soccer services, soccer training programs, soccer leagues, soccer consulting, coaching education',
    url: '/services',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Small Sided Soccer Services',
      provider: {
        '@type': 'Organization',
        name: 'Small Sided'
      },
      areaServed: 'United States',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Soccer Training Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Player Education'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Coach Education'
            }
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Soccer Consulting'
            }
          }
        ]
      }
    }
  },

  blog: {
    title: 'Blog | Small Sided',
    description: 'See Small Sided in action. Explore our portfolio of successful training programs, league operations, and transformative soccer education initiatives.',
    keywords: 'small sided portfolio, soccer training results, league success stories, coaching case studies',
    url: '/blog'
  },

  contact: {
    title: 'Contact Us | Small Sided',
    description: 'Get in touch with Small Sided. Schedule a consultation, ask questions, or learn more about our soccer training and education services.',
    keywords: 'contact small sided, soccer training inquiry, schedule consultation, soccer coaching contact',
    url: '/contact',
    schema: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Small Sided',
      description: 'Get in touch with Small Sided for soccer training services'
    }
  },

  fieldRental: {
  title: 'Field Rental | Small Sided',
  description: 'Rent premium small-sided soccer fields for parties, events, training sessions, and pickup games. Flexible scheduling and competitive rates for hourly field rentals.',
  keywords: 'soccer field rental, small sided field rental, soccer party venue, soccer field hire, indoor soccer rental, outdoor soccer field, soccer event space, hourly field rental',
  url: '/field-rental',
  schema: {
    ...smallSidedLocation,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Field Rental Options',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Hourly Field Rental'
          },
          areaServed: { '@type': 'City', name: 'Tampa' }
        }
      ]
    }
  }
},

  birthdayParties: {
  title: 'Birthday Parties | Small Sided',
  description: 'Host unforgettable soccer birthday parties at Small Sided. Fun games, professional coaching, and hassle-free party packages for kids of all ages and skill levels.',
  keywords: 'soccer birthday party, kids soccer party, youth soccer birthday, soccer party venue, children soccer party, soccer party packages, sports birthday party',
  url: '/birthday-parties',
  schema: {
    ...smallSidedLocation,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Birthday Party Packages',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Soccer Birthday Party Package'
          },
          areaServed: { '@type': 'City', name: 'Tampa' }
        }
      ]
    }
  }
},

  leagues: {
  title: 'Soccer Leagues | Small Sided',
  description: 'Join competitive and recreational small-sided soccer leagues for adults and youth. Year-round seasons, flexible divisions, and organized play in a fun, inclusive environment.',
  keywords: 'soccer leagues, small sided soccer league, adult soccer league, youth soccer league, recreational soccer, competitive soccer league, indoor soccer league, coed soccer league',
  url: '/leagues',
  schema: {
    ...smallSidedLocation,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Soccer League Programs',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Adult Soccer League'
          },
          areaServed: { '@type': 'City', name: 'Tampa' }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Youth Soccer League'
          },
          areaServed: { '@type': 'City', name: 'Tampa' }
        }
      ]
    }
  }
},

pickup: {
  title: 'Pickup Soccer | Small Sided',
  description: 'Drop in for pickup soccer games anytime. No commitment required. Meet new players, stay active, and enjoy casual small-sided soccer in a welcoming community.',
  keywords: 'pickup soccer, drop in soccer, casual soccer games, open play soccer, pickup games, soccer near me, recreational soccer, adult pickup soccer',
  url: '/pickup',
  schema: {
    ...smallSidedLocation,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Pickup Soccer Options',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Drop-In Pickup Soccer'
          },
          areaServed: { '@type': 'City', name: 'Tampa' }
        }
      ]
    }
  }
},

camps: {
  title: 'Camps | Small Sided',
  description: 'Intensive soccer camps and specialized training programs for players of all ages. Skill development, tactical training, and expert coaching to elevate your game.',
  keywords: 'soccer camps, soccer training programs, youth soccer camp, soccer skills camp, soccer clinic, soccer academy, technical training, soccer development program',
  url: '/camps-and-training',
  schema: {
    ...smallSidedLocation,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Soccer Camp Programs',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Youth Soccer Camp'
          },
          areaServed: { '@type': 'City', name: 'Tampa' }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Skills Development Camp'
          },
          areaServed: { '@type': 'City', name: 'Tampa' }
        }
      ]
    }
  }
},

training: {
  title: 'Training | Small Sided',
  description: 'Intensive soccer camps and specialized training programs for players of all ages. Skill development, tactical training, and expert coaching to elevate your game.',
  keywords: 'soccer camps, soccer training programs, youth soccer camp, soccer skills camp, soccer clinic, soccer academy, technical training, soccer development program',
  url: '/camps-and-training',
  schema: {
    ...smallSidedLocation,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Training Programs',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Private Training Sessions'
          },
          areaServed: { '@type': 'City', name: 'Tampa' }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Group Training Programs'
          },
          areaServed: { '@type': 'City', name: 'Tampa' }
        }
      ]
    }
  }
},

  privacyPolicy: {
    title: 'Privacy Policy | Small Sided',
    description: 'Read Small Sided\'s privacy policy. Learn how we collect, use, protect, and manage your personal information.',
    keywords: 'privacy policy, data protection, personal information',
    url: '/PrivacyPolicy',
    noindex: true
  },

  tos: {
    title: 'Terms of Service | Small Sided',
    description: 'Review Small Sided\'s terms of service. Understand the terms and conditions for using our website and services.',
    keywords: 'terms of service, terms and conditions, user agreement',
    url: '/TOS',
    noindex: true
  },

  cookiePolicy: {
    title: 'Cookie Policy | Small Sided',
    description: 'Learn about Small Sided\'s cookie policy and how we use cookies to enhance your browsing experience.',
    keywords: 'cookie policy, cookies, website tracking',
    url: '/CookiePolicy',
    noindex: true
  }
};

// Helper function to get SEO config
export const getSEOConfig = (page: keyof typeof seoConfig): PageSEO => {
  return seoConfig[page] || seoConfig.home;
};