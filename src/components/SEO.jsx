import { Helmet } from 'react-helmet-async'

function SEO({ 
  title = "AKATSUKI Series - Premium Tech Events by Scify Tech | UKF College Kerala",
  description = "Join AKATSUKI Series by Scify Tech - Kerala's premier tech event platform. Exclusive workshops, coding bootcamps, and networking events for UKF College students and tech enthusiasts across Kerala.",
  keywords = "scify, ukfcet, ukf college, scify tech, akatsuki, akatsuki series, ukf addon, kerala edstartup, tech events kerala, programming workshops ukf, coding bootcamp kerala, web development courses, AI workshops, machine learning events, tech networking kerala, career development, student events ukfcet, technology conferences kerala, startup events",
  image = "/og-image.jpg",
  url = "https://akatsuki.scify-tech.com",
  type = "website",
  author = "Scify Tech - AKATSUKI Team",
  publishedTime,
  modifiedTime,
  section,
  tags = []
}) {
  const fullTitle = title.includes('AKATSUKI') ? title : `${title} | AKATSUKI Series by Scify Tech`
  const fullUrl = url.startsWith('http') ? url : `https://akatsuki.scify-tech.com${url}`
  const fullImage = image.startsWith('http') ? image : `https://akatsuki.scify-tech.com${image}`

  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "Organization",
    "name": "AKATSUKI Series by Scify Tech",
    "alternateName": ["Scify Tech", "UKF Addon", "Kerala EdStartup"],
    "description": description,
    "url": fullUrl,
    "logo": "https://akatsuki.scify-tech.com/logo.png",
    "image": fullImage,
    "foundingLocation": {
      "@type": "Place",
      "name": "Kerala, India"
    },
    "areaServed": {
      "@type": "Place", 
      "name": "Kerala, India"
    },
    "keywords": "scify, ukfcet, ukf college, scify tech, akatsuki, akatsuki series, ukf addon, kerala edstartup",
    "sameAs": [
      "https://linkedin.com/company/scify-tech",
      "https://twitter.com/scify_tech",
      "https://instagram.com/scify_tech"
    ],
    ...(type === "article" && {
      "headline": title,
      "author": {
        "@type": "Organization",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "AKATSUKI Series by Scify Tech",
        "logo": {
          "@type": "ImageObject",
          "url": "https://akatsuki.scify-tech.com/logo.png"
        }
      },
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "articleSection": section,
      "keywords": tags.join(", ")
    })
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="AKATSUKI Series by Scify Tech" />
      <meta property="og:locale" content="en_US" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@scify_tech" />
      <meta name="twitter:creator" content="@scify_tech" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={title} />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#dc2626" />
      <meta name="msapplication-TileColor" content="#dc2626" />
      <meta name="application-name" content="AKATSUKI Series by Scify Tech" />
      <meta name="apple-mobile-web-app-title" content="AKATSUKI Series" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.supabase.co" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </Helmet>
  )
}

export default SEO