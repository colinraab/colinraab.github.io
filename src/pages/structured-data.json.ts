// structured-data.json.ts
// Additional JSON-LD structured data endpoint for enhanced SEO

import { getAllBlogPosts } from '../utils/blog';

export async function GET() {
  const baseUrl = 'https://colinraab.com';
  const blogPosts = getAllBlogPosts();
  const blogPostStructuredData = blogPosts.map((post) => {
    const lastModified = (post.frontmatter.updatedDate ?? post.frontmatter.pubDate).toISOString();
    const image = post.frontmatter.heroImage ? new URL(post.frontmatter.heroImage, baseUrl).toString() : `${baseUrl}/logo.svg`;

    return {
      "@type": "BlogPosting",
      "@id": `${baseUrl}${post.url}#blog-post`,
      "mainEntityOfPage": `${baseUrl}${post.url}`,
      "headline": post.frontmatter.title,
      "description": post.frontmatter.description,
      "image": image,
      "datePublished": post.frontmatter.pubDate.toISOString(),
      "dateModified": lastModified,
      "author": {
        "@id": "https://colinraab.com/#colin-raab"
      },
      "publisher": {
        "@id": "https://colinraab.com/#colin-raab"
      },
      "keywords": post.frontmatter.tags || [],
      "articleSection": "Projects",
      "url": `${baseUrl}${post.url}`,
      "thumbnailUrl": image,
      "inLanguage": "en-US"
    };
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://colinraab.com/#colin-raab",
        "name": "Colin Raab",
        "givenName": "Colin",
        "familyName": "Raab",
        "alternateName": ["Colin S. Raab", "Colin Stephen Raab"],
        "url": "https://colinraab.com",
        "image": "https://colinraab.com/logo.svg",
        "description": "Colin Raab is a highly skilled full-stack developer, music producer, and audio engineer specializing in JavaScript, C++, Python, React, Node.js, music technology, and creative coding. Graduate of McGill University and University of Miami.",
        "jobTitle": [
          "Full-Stack Developer",
          "Music Producer", 
          "Audio Engineer",
          "Creative Technologist",
          "Software Engineer"
        ],
        "hasCredential": [
          {
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": "degree",
            "educationalLevel": "Master's Degree",
            "about": {
              "@type": "EducationalOccupationalProgram",
              "name": "Music Technology",
              "provider": {
                "@type": "EducationalOrganization",
                "name": "McGill University"
              }
            }
          },
          {
            "@type": "EducationalOccupationalCredential", 
            "credentialCategory": "degree",
            "educationalLevel": "Bachelor's Degree",
            "about": {
              "@type": "EducationalOccupationalProgram",
              "name": "Music Engineering",
              "provider": {
                "@type": "EducationalOrganization",
                "name": "University of Miami"
              }
            }
          }
        ],
        "knowsAbout": [
          {
            "@type": "Thing",
            "name": "JavaScript Programming",
            "description": "JavaScript development for web applications"
          },
          {
            "@type": "Thing", 
            "name": "C++ Development",
            "description": "Advanced C++ for audio applications"
          },
          {
            "@type": "Thing", 
            "name": "Python Development",
            "description": "Advanced Python for machine learning applications"
          },
          {
            "@type": "Thing",
            "name": "React Development", 
            "description": "Modern React applications with hooks and state management"
          },
          {
            "@type": "Thing",
            "name": "Node.js Development",
            "description": "Backend development with Node.js and Express"
          },
          {
            "@type": "Thing",
            "name": "Relational Databases",
            "description": "Database management and design using SQL and Supabase"
          },
          {
            "@type": "Thing",
            "name": "Music Production",
            "description": "Professional music production and composition"
          },
          {
            "@type": "Thing",
            "name": "Audio Engineering",
            "description": "Recording, mixing, and mastering audio"
          },
          {
            "@type": "Thing",
            "name": "Sound Design", 
            "description": "Creative sound design and synthesis"
          },
          {
            "@type": "Thing",
            "name": "Creative Coding",
            "description": "Interactive media and generative art programming"
          }
        ],
        "hasOccupation": [
          {
            "@type": "Occupation",
            "name": "Software Developer",
            "description": "Full-stack web development using modern technologies",
            "skills": ["JavaScript", "C++", "Python", "React", "Node.js"],
            "occupationLocation": "Remote/United States"
          },
          {
            "@type": "Occupation",
            "name": "Music Producer",
            "description": "Music production, composition, and sound design", 
            "skills": ["Music Production", "Sound Design", "Audio Engineering"],
            "occupationLocation": "Remote/United States"
          }
        ],
        "alumniOf": [
          {
            "@type": "EducationalOrganization",
            "name": "McGill University",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Montreal",
              "addressRegion": "Quebec", 
              "addressCountry": "Canada"
            },
            "url": "https://www.mcgill.ca"
          },
          {
            "@type": "EducationalOrganization",
            "name": "University of Miami",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Miami",
              "addressRegion": "Florida",
              "addressCountry": "United States"
            },
            "url": "https://www.miami.edu"
          }
        ],
        "sameAs": [
          "https://github.com/colinraab",
          "https://linkedin.com/in/colinraab"
        ],
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": "https://colinraab.com/"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://colinraab.com/#website",
        "url": "https://colinraab.com",
        "name": "Colin Raab - Creative Portfolio",
        "description": "Portfolio website showcasing Colin Raab's work in software development, music production, audio engineering, and creative technology.",
        "publisher": {
          "@id": "https://colinraab.com/#colin-raab"
        },
        "mainEntity": {
          "@id": "https://colinraab.com/#colin-raab"
        },
        "about": {
          "@id": "https://colinraab.com/#colin-raab"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://colinraab.com/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "CreativeWork",
        "@id": "https://colinraab.com/#portfolio",
        "name": "Colin Raab Creative Portfolio",
        "description": "Comprehensive portfolio showcasing software development projects, music compositions, audio engineering work, and creative technology projects.",
        "creator": {
          "@id": "https://colinraab.com/#colin-raab"
        },
        "about": [
          "Software Development",
          "Music Production", 
          "Audio Engineering",
          "Creative Technology"
        ],
        "genre": ["Technology", "Music", "Audio", "Creative Arts"],
        "dateCreated": "2024",
        "dateModified": new Date().toISOString().split('T')[0],
        "isPartOf": {
          "@id": "https://colinraab.com/#website"
        }
      },
      {
        "@type": "Blog",
        "@id": "https://colinraab.com/#blog",
        "url": "https://colinraab.com/blog",
        "name": "Colin Raab Blog",
        "description": "Project write-ups and technical notes from Colin Raab.",
        "publisher": {
          "@id": "https://colinraab.com/#colin-raab"
        },
        "blogPost": blogPostStructuredData.map((post) => ({ "@id": post["@id"] })),
        "inLanguage": "en-US"
      },
      ...blogPostStructuredData
    ]
  };

  return new Response(JSON.stringify(structuredData, null, 2), {
    headers: {
      'Content-Type': 'application/ld+json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
