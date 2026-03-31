import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";
import type { Metadata } from "next";

const CREAM = "#F5F1E8";
const CHARCOAL = "#1F1F1F";
const GREEN = "#4F7D6A";
const LIGHT_GREEN = "#E6F2ED";
const CARD = "#FDFAF4";
const BORDER = "rgba(31,31,31,0.1)";
const MUTED = "rgba(31,31,31,0.55)";

export const metadata: Metadata = {
  title: "Freelancer Finance Guides | Beancountr Blog",
  description:
    "Practical guides for UK freelancers on tax, invoicing, expenses, cash flow, and more. Written for sole traders and limited company directors.",
};

const CATEGORY_COLOURS: Record<string, { bg: string; text: string }> = {
  Tax:               { bg: "#FEF3C7", text: "#92400E" },
  Invoicing:         { bg: LIGHT_GREEN, text: "#1A5C47" },
  Finance:           { bg: "#EDE9FE", text: "#4C1D95" },
  Business:          { bg: "#DBEAFE", text: "#1E3A8A" },
  Productivity:      { bg: "#FCE7F3", text: "#831843" },
  "Getting Started": { bg: "#F3F4F6", text: "#374151" },
};

function categoryStyle(category: string) {
  return CATEGORY_COLOURS[category] ?? { bg: "#F3F4F6", text: "#374151" };
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
    <div className="min-h-screen" style={{ background: CREAM }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: CHARCOAL, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/Wordmark.png" alt="Beancountr" style={{ width: "220px", height: "68px", objectFit: "contain" }} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm transition-colors" style={{ color: "rgba(245,241,232,0.6)" }}>Pricing</Link>
            <Link href="/blog" className="text-sm font-semibold transition-colors" style={{ color: CREAM }}>Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium transition-colors" style={{ color: "rgba(245,241,232,0.6)" }}>Log in</Link>
            <Link href="/signup" className="text-sm font-bold px-4 py-2 rounded-full transition-all hover:opacity-90" style={{ background: GREEN, color: "#fff" }}>
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 px-6" style={{ background: CARD, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6" style={{ background: LIGHT_GREEN, color: GREEN }}>
            <BookOpen className="w-3.5 h-3.5" />
            Freelancer Finance Guides
          </div>
          <h1 className="text-4xl sm:text-5xl mb-4" style={{ fontFamily: "var(--font-display)", color: CHARCOAL }}>
            Know your money.<br />
            <span style={{ color: MUTED }}>Grow your business.</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: MUTED }}>
            Practical guides on tax, invoicing, expenses, and cash flow, written specifically for UK
            freelancers and sole traders.
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="sticky top-[60px] z-40 px-6 py-3" style={{ background: CREAM, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <Link
                key={cat}
                href={cat === "All" ? "/blog" : `/blog?category=${encodeURIComponent(cat)}`}
                className="shrink-0 text-sm font-semibold px-4 py-1.5 rounded-full transition-all"
                style={
                  isActive
                    ? { background: CHARCOAL, color: CREAM }
                    : { background: "transparent", color: MUTED }
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
          <p className="text-sm mb-8" style={{ color: MUTED }}>
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
                  className="group rounded-2xl p-6 flex flex-col transition-shadow hover:shadow-md"
                  style={{ background: CARD, border: `1px solid ${BORDER}` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: cs.bg, color: cs.text }}>
                      {post.category}
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" style={{ color: MUTED }} />
                  </div>
                  <h2 className="font-bold text-base leading-snug mb-3" style={{ color: CHARCOAL }}>
                    {post.title}
                  </h2>
                  <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: MUTED }}>
                    {post.excerpt.split(".")[0]}.
                  </p>
                  <div className="flex items-center gap-4 text-xs pt-3" style={{ borderTop: `1px solid ${BORDER}`, color: MUTED }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
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
              <p className="text-lg" style={{ color: MUTED }}>No posts found in this category.</p>
              <Link href="/blog" className="mt-4 inline-block text-sm font-semibold" style={{ color: CHARCOAL }}>
                View all posts
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: CHARCOAL }}>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl mb-4" style={{ fontFamily: "var(--font-display)", color: CREAM }}>
            Put this knowledge into practice
          </h2>
          <p className="mb-8" style={{ color: "rgba(245,241,232,0.6)" }}>
            Beancountr tracks your income, calculates your tax reserve, and generates professional invoices, all in one place.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 font-bold px-7 py-3.5 rounded-full text-base transition-all hover:opacity-90"
            style={{ background: GREEN, color: "#fff" }}
          >
            Try Beancountr free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ background: CHARCOAL, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/">
            <img src="/Wordmark.png" alt="Beancountr" style={{ height: "40px", objectFit: "contain" }} />
          </Link>
          <p className="text-sm" style={{ color: "rgba(245,241,232,0.4)" }}>Built for UK freelancers. Planning estimates only, not tax advice.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm transition-colors" style={{ color: "rgba(245,241,232,0.5)" }}>Pricing</Link>
            <Link href="/blog" className="text-sm transition-colors" style={{ color: "rgba(245,241,232,0.5)" }}>Blog</Link>
            <Link href="/privacy" className="text-sm transition-colors" style={{ color: "rgba(245,241,232,0.5)" }}>Privacy</Link>
            <Link href="/login" className="text-sm transition-colors" style={{ color: "rgba(245,241,232,0.5)" }}>Log in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
