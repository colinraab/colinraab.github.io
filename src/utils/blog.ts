import type { MarkdownInstance } from 'astro';

export interface BlogFrontmatter {
  title: string;
  description: string;
  pubDate: string | Date;
  updatedDate?: string | Date;
  tags?: string[];
  heroImage?: string;
  projectLink?: string;
  repoLink?: string;
  minutesRead?: number;
  canonical?: string;
  draft?: boolean;
}

export interface BlogPost {
  slug: string;
  url: string;
  frontmatter: BlogFrontmatter & { pubDate: Date; updatedDate?: Date };
  Content: MarkdownInstance<BlogFrontmatter>["Content"];
  getHeadings: MarkdownInstance<BlogFrontmatter>["getHeadings"];
}

const blogModules = import.meta.glob<MarkdownInstance<BlogFrontmatter>>('../content/blog/*.md', {
  eager: true,
});

function normalizeDate(value: string | Date | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function createSlugFromPath(path: string): string {
  return path
    .split('/')
    .pop()!
    .replace(/\.md$/, '')
    .trim();
}

export function getAllBlogPosts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): BlogPost[] {
  const posts = Object.entries(blogModules)
    .map(([path, module]) => {
      const frontmatter = module.frontmatter;
      const pubDate = normalizeDate(frontmatter.pubDate);
      const updatedDate = normalizeDate(frontmatter.updatedDate);

      if (!pubDate) {
        throw new Error(`Blog post at ${path} is missing a valid pubDate.`);
      }

      const slug = createSlugFromPath(path);

      return {
        slug,
        url: `/blog/${slug}/`,
        frontmatter: {
          ...frontmatter,
          pubDate,
          updatedDate,
        },
        Content: module.Content,
        getHeadings: module.getHeadings,
      } satisfies BlogPost;
    })
    .filter((post) => includeDrafts || !post.frontmatter.draft)
    .sort((a, b) => b.frontmatter.pubDate.getTime() - a.frontmatter.pubDate.getTime());

  return posts;
}

export function getBlogPostBySlug(slug: string, options?: { includeDrafts?: boolean }): BlogPost | undefined {
  const { includeDrafts = false } = options ?? {};
  return getAllBlogPosts({ includeDrafts }).find((post) => post.slug === slug);
}
