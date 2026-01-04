// Sitemap Generator for AKATSUKI Platform
export const generateSitemap = (events = []) => {
  const baseUrl = 'https://akatsuki.scifytech.com'
  const currentDate = new Date().toISOString()

  const staticPages = [
    {
      url: '/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: '/student/login',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      url: '/admin',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.3'
    }
  ]

  const eventPages = events.map(event => ({
    url: `/event/${event.slug}`,
    lastmod: event.updated_at || event.created_at,
    changefreq: 'weekly',
    priority: '0.9'
  }))

  const allPages = [...staticPages, ...eventPages]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return sitemapXml
}

export const generateRobotsTxt = () => {
  return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /student/auth/

Sitemap: https://akatsuki.scifytech.com/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1`
}