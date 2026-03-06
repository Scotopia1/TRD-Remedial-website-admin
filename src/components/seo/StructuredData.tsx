export function StructuredData() {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://trdremedial.com.au';

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "TRD Remedial",
    legalName: "Tension Reinforced Developments",
    url: `${SITE_URL}`,
    logo: `${SITE_URL}/trd-logo.svg`,
    foundingDate: "2017",
    founders: [
      {
        "@type": "Person",
        name: "Christopher Nassif"
      },
      {
        "@type": "Person",
        name: "Charly Nassif"
      },
      {
        "@type": "Person",
        name: "Fahed Nassif"
      }
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+61-414-727-167",
      contactType: "emergency",
      areaServed: "AU",
      availableLanguage: "English"
    },
    sameAs: [
      "https://www.linkedin.com/company/trd-remedial",
      "https://www.facebook.com/trdremedial",
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: "TRD Remedial",
    image: `${SITE_URL}/images/og-image.jpg`,
    description: "Award-winning structural remediation experts in Sydney. Specializing in structural strengthening, concrete cutting, crack injection, concrete repairs, and emergency structural solutions.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "2 Beryl Place",
      addressLocality: "Greenacre",
      addressRegion: "NSW",
      postalCode: "2190",
      addressCountry: "AU"
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -33.9000,
      longitude: 151.0500
    },
    telephone: "+61-414-727-167",
    email: "contact@trdremedial.com.au",
    url: `${SITE_URL}`,
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      opens: "00:00",
      closes: "23:59"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Structural Remediation Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Structural Strengthening",
            description: "Carbon fibre reinforcement and advanced structural strengthening solutions"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Structural Alterations",
            description: "Precision structural modifications and load-bearing alterations"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Crack Injection",
            description: "Epoxy and polyurethane injection for structural crack repair and waterproofing"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Concrete Cutting",
            description: "Precision wall sawing, floor cutting, and coring services"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Concrete Repairs",
            description: "Comprehensive concrete patching, spalling repair, and surface restoration"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Slab Scanning",
            description: "GPR scanning and non-invasive concrete diagnostic services"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Curtain Wall Injection",
            description: "Waterproofing injection for curtain wall systems and facade sealing"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Temporary Moving Joints",
            description: "Installation and management of temporary construction joint systems"
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Post Tension Truncation",
            description: "Safe truncation and repair of post-tensioned cable systems"
          }
        }
      ]
    },
    areaServed: {
      "@type": "State",
      name: "New South Wales"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: `${SITE_URL}`,
    name: "TRD Remedial",
    description: "The Remedial Experts - Structural Solutions Sydney",
    publisher: {
      "@id": `${SITE_URL}/#organization`
    },
    inLanguage: "en-AU"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
