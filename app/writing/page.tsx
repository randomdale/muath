import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

type PostMeta = { slug: string; title: string; date: string };

export default function Writing() {
  const dir = path.join(process.cwd(), "content", "posts");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  const posts: PostMeta[] = files
    .map((filename) => {
      const slug = filename.replace(".md", "");
      const file = fs.readFileSync(path.join(dir, filename), "utf8");
      const { data } = matter(file);
      return { slug, title: data.title ?? slug, date: data.date ?? "" };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Writing</h1>
      <ul className="list">
  {posts.map((p) => (
    <li key={p.slug} className="listItem">
      <Link href={`/writing/${p.slug}`} style={{ fontSize: 18 }}>
        {p.title}
      </Link>
      <div className="meta">{p.date}</div>
    </li>
  ))}
</ul>
    </div>
  );
}
