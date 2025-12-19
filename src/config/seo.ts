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
    title: 'Our Services | Small Sided',
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

  work: {
    title: 'Our Work | Small Sided',
    description: 'See Small Sided in action. Explore our portfolio of successful training programs, league operations, and transformative soccer education initiatives.',
    keywords: 'small sided portfolio, soccer training results, league success stories, coaching case studies',
    url: '/work'
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

  playerEducation: {
    title: 'Player Education | Small Sided',
    description: 'Elevate your game with Small Sided\'s player education programs. Technical training, tactical awareness, and mental skills development for all ages.',
    keywords: 'soccer player training, youth soccer development, soccer skills training, individual soccer coaching, soccer technical training',
    url: '/PlayerEducation'
  },

  parentEducation: {
    title: 'Parent Education | Small Sided',
    description: 'Empower soccer parents with knowledge. Learn how to support your young athlete\'s development, navigate youth soccer, and foster a positive sports experience.',
    keywords: 'soccer parent education, youth soccer parents, supporting young athletes, soccer parent resources',
    url: '/ParentEducation'
  },

  coachEducation: {
    title: 'Coach Education | Small Sided',
    description: 'Professional development for soccer coaches. Learn small-sided game methodology, session planning, player development strategies, and coaching best practices.',
    keywords: 'soccer coach education, coaching certification, soccer coaching courses, small sided coaching, coach development',
    url: '/CoachEducation'
  },

  consulting: {
    title: 'Soccer Consulting | Small Sided',
    description: 'Expert soccer consulting for clubs, organizations, and facilities. Program design, curriculum development, staff training, and operational optimization.',
    keywords: 'soccer consulting, club consulting, soccer program development, soccer curriculum design, soccer operations consulting',
    url: '/Consulting'
  },

  resources: {
    title: 'Resources | Small Sided',
    description: 'Free soccer resources for players, parents, and coaches. Training guides, educational articles, drills, and expert tips to improve your soccer knowledge.',
    keywords: 'soccer resources, free soccer training, soccer drills, coaching resources, soccer education materials',
    url: '/Resources'
  },

  blog: {
    title: 'Blog | Small Sided',
    description: 'Soccer insights, training tips, coaching strategies, and industry updates from the Small Sided team. Stay informed with our latest articles and analysis.',
    keywords: 'soccer blog, soccer training tips, coaching articles, soccer news, player development insights',
    url: '/blog'
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