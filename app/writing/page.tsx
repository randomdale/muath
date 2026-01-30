import Link from "next/link";
import { client, postsQuery } from "@/lib/sanity";

export default async function WritingPage() {
  const posts = await client.fetch(postsQuery);

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Writing</h1>

      <ul className="list">
        {posts.map((p: any) => (
          <li key={p._id} className="listItem">
            <Link href={`/writing/${p.slug}`} style={{ fontSize: 18 }}>
              {p.title}
            </Link>
            {p.publishedAt ? (
              <div className="meta">
                {new Date(p.publishedAt).toISOString().slice(0, 10)}
              </div>
            ) : null}
            {p.excerpt ? <div className="meta">{p.excerpt}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
