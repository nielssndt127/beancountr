import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Clock, ChevronRight } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";
import type { Metadata } from "next";

const ORANGE = "oklch(0.72 0.22 48)";
const ORANGE_LIGHT = "oklch(0.96 0.07 48)";
const YELLOW_LIGHT = "oklch(0.97 0.07 85)";
const TEAL = "oklch(0.55 0.22 195)";
const TEAL_LIGHT = "oklch(0.94 0.07 195)";
const PURPLE = "oklch(0.52 0.18 290)";
const PURPLE_LIGHT = "oklch(0.95 0.06 290)";

const CATEGORY_COLOURS: Record<string, { bg: string; text: string }> = {
  Tax: { bg: ORANGE_LIGHT, text: ORANGE },
  Invoicing: { bg: TEAL_LIGHT, text: TEAL },
  Finance: { bg: PURPLE_LIGHT, text: PURPLE },
  Business: { bg: YELLOW_LIGHT, text: "oklch(0.50 0.14 75)" },
  Productivity: { bg: TEAL_LIGHT, text: TEAL },
  "Getting Started": { bg: ORANGE_LIGHT, text: ORANGE },
};

function categoryStyle(category: string) {
  return CATEGORY_COLOURS[category] ?? { bg: ORANGE_LIGHT, text: ORANGE };
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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/Wordmark.png"
              alt="Beancountr"
              style={{ width: "168px", height: "51px", objectFit: "contain" }}
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              Pricing
            </Link>
            <Link href="/blog" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-stone-700 font-medium hover:text-stone-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold text-white px-4 py-2 rounded-lg transition-all hover:opacity-90"
              style={{ background: ORANGE }}
            >
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-stone-400 mb-8">
            <Link href="/" className="hover:text-stone-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/blog" className="hover:text-stone-600 transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-stone-600 truncate max-w-xs">{post.title}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main article */}
            <article className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-8">
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
                  style={{ background: cs.bg, color: cs.text }}
                >
                  {post.category}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 leading-tight mb-4">
                  {post.title}
                </h1>
                <p className="text-lg text-stone-500 leading-relaxed mb-6">{post.excerpt}</p>
                <div className="flex items-center gap-5 text-sm text-stone-400">
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
                className="prose prose-stone max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2 prose-p:text-stone-600 prose-p:leading-relaxed prose-li:text-stone-600 prose-strong:text-stone-800 prose-a:text-orange-600"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="mt-10 pt-8 border-t border-stone-100">
                <p className="text-xs text-stone-400 font-semibold uppercase tracking-widest mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div
                className="mt-10 rounded-2xl p-8 text-white"
                style={{ background: ORANGE }}
              >
                <h2 className="text-xl font-bold mb-2">Try Beancountr free</h2>
                <p className="text-white/80 text-sm mb-5 leading-relaxed">
                  Track your finances automatically — income, tax reserve, invoices, and expenses
                  all in one clean dashboard built for UK freelancers.
                </p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all hover:opacity-90 hover:shadow-lg text-stone-900"
                  style={{ background: "oklch(0.88 0.18 88)" }}
                >
                  Get started free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:w-72 xl:w-80 shrink-0">
              {related.length > 0 && (
                <div className="sticky top-24">
                  <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-5">
                    Related articles
                  </h3>
                  <div className="space-y-4">
                    {related.map((rel) => {
                      const rcs = categoryStyle(rel.category);
                      return (
                        <Link
                          key={rel.slug}
                          href={`/blog/${rel.slug}`}
                          className="group block bg-white rounded-2xl card-shadow card-shadow-hover p-5"
                        >
                          <span
                            className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2"
                            style={{ background: rcs.bg, color: rcs.text }}
                          >
                            {rel.category}
                          </span>
                          <p className="text-sm font-semibold text-stone-800 leading-snug group-hover:text-stone-600 transition-colors mb-2">
                            {rel.title}
                          </p>
                          <p className="text-xs text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {rel.readTime}
                          </p>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="mt-8 rounded-2xl p-6" style={{ background: YELLOW_LIGHT }}>
                    <p className="text-sm font-bold text-stone-800 mb-2">
                      Free for UK freelancers
                    </p>
                    <p className="text-xs text-stone-500 mb-4 leading-relaxed">
                      Beancountr tracks your hours, invoices, expenses and tax reserve automatically.
                    </p>
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg text-white transition-all hover:opacity-90"
                      style={{ background: ORANGE }}
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
      <footer className="border-t border-stone-100 py-8 px-6 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <img
              src="/WordmarkAlt.png"
              alt="Beancountr"
              style={{ width: "160px", height: "80px", objectFit: "contain" }}
            />
          </Link>
          <p className="text-sm text-stone-400">Built for UK freelancers. Planning estimates only, not tax advice.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Pricing</Link>
            <Link href="/blog" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Blog</Link>
            <Link href="/privacy" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Privacy</Link>
            <Link href="/login" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
