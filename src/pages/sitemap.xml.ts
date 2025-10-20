// sitemap.xml.ts
// Generates a dynamic sitemap for better SEO and search engine crawling

import { getAllBlogPosts } from '../utils/blog';

export async function GET() {
  const baseUrl = 'https://colinraab.com';
  const nowIso = new Date().toISOString();

  const pages = [
    {
      url: `${baseUrl}/`,
      lastmod: nowIso,
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      url: `${baseUrl}/about`,
      lastmod: nowIso,
      changefreq: 'monthly',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/programming`,
      lastmod: nowIso,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/music`,
      lastmod: nowIso,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/audioengineering`,
      lastmod: nowIso,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${baseUrl}/photography`,
      lastmod: nowIso,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/lessons`,
      lastmod: nowIso,
      changefreq: 'monthly',
      priority: '0.7'
    },
    {
      url: `${baseUrl}/research`,
      lastmod: nowIso,
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: `${baseUrl}/work`,
      lastmod: nowIso,
      changefreq: 'monthly',
      priority: '0.6'
    },
    {
      url: `${baseUrl}/blog`,
      lastmod: nowIso,
      changefreq: 'weekly',
      priority: '0.7'
    }
  ];

  const blogPosts = getAllBlogPosts();
  const blogEntries = blogPosts.map((post) => {
    const lastModified = (post.frontmatter.updatedDate ?? post.frontmatter.pubDate).toISOString();
    return {
      url: `${baseUrl}${post.url}`,
      lastmod: lastModified,
      changefreq: 'monthly',
      priority: '0.6'
    };
  });

  const allEntries = [...pages, ...blogEntries];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
