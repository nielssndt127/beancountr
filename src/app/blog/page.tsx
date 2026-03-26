import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";
import type { Metadata } from "next";

const ORANGE = "oklch(0.72 0.22 48)";
const ORANGE_LIGHT = "oklch(0.96 0.07 48)";
const YELLOW_LIGHT = "oklch(0.97 0.07 85)";
const TEAL = "oklch(0.55 0.22 195)";
const TEAL_LIGHT = "oklch(0.94 0.07 195)";
const PURPLE = "oklch(0.52 0.18 290)";
const PURPLE_LIGHT = "oklch(0.95 0.06 290)";

export const metadata: Metadata = {
  title: "Freelancer Finance Guides | Beancountr Blog",
  description:
    "Practical guides for UK freelancers on tax, invoicing, expenses, cash flow, and more. Written for sole traders and limited company directors.",
};

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

const CATEGORIES = ["All", ...Array.from(new Set(blogPosts.map((p) => p.category)))];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = category ?? "All";
  const filtered =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

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
            <Link href="/blog" className="text-sm text-stone-900 font-semibold transition-colors">
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

      {/* Hero */}
      <section className="pt-28 pb-12 px-6" style={{ background: YELLOW_LIGHT }}>
        <div className="max-w-6xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6"
            style={{ background: "white", color: ORANGE }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Freelancer Finance Guides
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
            Know your money.<br />
            <span style={{ color: PURPLE }}>Grow your business.</span>
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            Practical guides on tax, invoicing, expenses, and cash flow — written specifically for UK
            freelancers and sole traders.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="sticky top-16 z-40 bg-white border-b border-stone-100 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            const style = cat !== "All" ? categoryStyle(cat) : null;
            return (
              <Link
                key={cat}
                href={cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
                className="shrink-0 text-sm font-semibold px-4 py-1.5 rounded-full transition-all"
                style={
                  isActive
                    ? { background: style ? style.bg : ORANGE_LIGHT, color: style ? style.text : ORANGE }
                    : { background: "transparent", color: "#78716c" }
                }
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Blog grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm text-stone-400 mb-8">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => {
              const cs = categoryStyle(post.category);
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl card-shadow card-shadow-hover p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: cs.bg, color: cs.text }}
                    >
                      {post.category}
                    </span>
                    <ArrowRight
                      className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors"
                    />
                  </div>
                  <h2 className="font-bold text-stone-900 text-base leading-snug mb-3 group-hover:text-stone-700 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-stone-500 leading-relaxed flex-1 mb-4">
                    {post.excerpt.split(".")[0]}.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-stone-400 pt-3 border-t border-stone-50">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-stone-400 text-lg">No posts found in this category.</p>
              <Link href="/blog" className="mt-4 inline-block text-sm font-semibold" style={{ color: ORANGE }}>
                View all posts
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: ORANGE }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Put this knowledge into practice
          </h2>
          <p className="text-white/80 mb-8">
            Beancountr tracks your income, calculates your tax reserve, and generates professional invoices — all in one place.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-xl text-base transition-all hover:opacity-90 hover:shadow-lg text-stone-900"
            style={{ background: "oklch(0.88 0.18 88)" }}
          >
            Try Beancountr free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

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
