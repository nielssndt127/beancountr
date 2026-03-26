import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Clock, ChevronRight } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";
import type { Metadata } from "next";

const CREAM = "oklch(0.94 0.025 80)";
const CHARCOAL = "oklch(0.16 0.008 80)";
const CARD = "oklch(0.22 0.008 80)";
const BORDER = "oklch(0.28 0.008 80)";
const MUTED = "oklch(0.65 0.01 80)";

const CATEGORY_COLOURS: Record<string, { bg: string; text: string }> = {
  Tax: { bg: "oklch(0.26 0.008 80)", text: CREAM },
  Invoicing: { bg: "oklch(0.26 0.008 80)", text: CREAM },
  Finance: { bg: "oklch(0.26 0.008 80)", text: CREAM },
  Business: { bg: "oklch(0.26 0.008 80)", text: CREAM },
  Productivity: { bg: "oklch(0.26 0.008 80)", text: CREAM },
  "Getting Started": { bg: "oklch(0.26 0.008 80)", text: CREAM },
};

function categoryStyle(category: string) {
  return CATEGORY_COLOURS[category] ?? { bg: "oklch(0.26 0.008 80)", text: CREAM };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} | Beancountr`,
    description: post.metaDescription,
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  const cs = categoryStyle(post.category);

  return (
    <div className="min-h-screen" style={{ background: CHARCOAL }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: CHARCOAL, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/Wordmark.png"
              alt="Beancountr"
              style={{ width: "220px", height: "68px", objectFit: "contain" }}
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm transition-colors" style={{ color: MUTED }}>
              Pricing
            </Link>
            <Link href="/blog" className="text-sm transition-colors" style={{ color: MUTED }}>
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors" style={{ color: MUTED }}>
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold px-4 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: CREAM, color: CHARCOAL }}
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs mb-8" style={{ color: MUTED }}>
            <Link href="/" className="transition-colors hover:opacity-80">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="transition-colors hover:opacity-80">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="truncate max-w-xs" style={{ color: CREAM }}>{post.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main article */}
            <article className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-8">
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
                  style={{ background: cs.bg, color: cs.text, border: `1px solid ${BORDER}` }}
                >
                  {post.category}
                </span>
                <h1 className="text-3xl sm:text-4xl leading-tight mb-4" style={{ fontFamily: "var(--font-display)", color: CREAM }}>
                  {post.title}
                </h1>
                <p className="text-lg leading-relaxed mb-6" style={{ color: MUTED }}>{post.excerpt}</p>
                <div className="flex items-center gap-5 text-sm" style={{ color: MUTED }}>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </span>
                </div>
              </div>

              {/* Article content */}
              <div
                className="prose max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2"
                style={{
                  "--tw-prose-body": MUTED,
                  "--tw-prose-headings": CREAM,
                  "--tw-prose-links": CREAM,
                  "--tw-prose-bold": CREAM,
                  "--tw-prose-bullets": MUTED,
                  "--tw-prose-counters": MUTED,
                  "--tw-prose-hr": BORDER,
                  "--tw-prose-quotes": CREAM,
                  "--tw-prose-quote-borders": BORDER,
                } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="mt-10 pt-8" style={{ borderTop: `1px solid ${BORDER}` }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>Tags</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full"
                      style={{ background: CARD, color: MUTED, border: `1px solid ${BORDER}` }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div
                className="mt-10 rounded-2xl p-8"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
              >
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: CREAM }}>Try Beancountr free</h2>
                <p className="text-sm mb-5 leading-relaxed" style={{ color: MUTED }}>
                  Track your finances automatically — income, tax reserve, invoices, and expenses
                  all in one clean dashboard built for UK freelancers.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ background: CREAM, color: CHARCOAL }}
                >
                  Get started free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-72 xl:w-80 shrink-0">
              {related.length > 0 && (
                <div className="sticky top-24">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: MUTED }}>
                    Related articles
                  </h3>
                  <div className="space-y-4">
                    {related.map((rel) => {
                      const rcs = categoryStyle(rel.category);
                      return (
                        <Link
                          key={rel.slug}
                          href={`/blog/${rel.slug}`}
                          className="group block rounded-2xl card-shadow card-shadow-hover p-5"
                          style={{ background: CARD, border: `1px solid ${BORDER}` }}
                        >
                          <span
                            className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2"
                            style={{ background: rcs.bg, color: rcs.text, border: `1px solid ${BORDER}` }}
                          >
                            {rel.category}
                          </span>
                          <p className="text-sm font-semibold leading-snug transition-colors mb-2" style={{ color: CREAM }}>
                            {rel.title}
                          </p>
                          <p className="text-xs flex items-center gap-1" style={{ color: MUTED }}>
                            <Clock className="w-3 h-3" />
                            {rel.readTime}
                          </p>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-8 rounded-2xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                    <p className="text-sm font-bold mb-2" style={{ color: CREAM }}>
                      Free for UK freelancers
                    </p>
                    <p className="text-xs mb-4 leading-relaxed" style={{ color: MUTED }}>
                      Beancountr tracks your hours, invoices, expenses and tax reserve automatically.
                    </p>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all hover:opacity-90"
                      style={{ background: CREAM, color: CHARCOAL }}
                    >
                      Start free <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ background: CHARCOAL, borderTop: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <span style={{ fontFamily: "var(--font-display)", color: CREAM, fontSize: "1.25rem" }}>Beancountr</span>
          </Link>
          <p className="text-sm" style={{ color: MUTED }}>Built for UK freelancers. Planning estimates only, not tax advice.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm transition-colors" style={{ color: MUTED }}>Pricing</Link>
            <Link href="/blog" className="text-sm transition-colors" style={{ color: MUTED }}>Blog</Link>
            <Link href="/privacy" className="text-sm transition-colors" style={{ color: MUTED }}>Privacy</Link>
            <Link href="/login" className="text-sm transition-colors" style={{ color: MUTED }}>Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
