import { client, postBySlugQuery } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await client.fetch(postBySlugQuery, { slug });

  if (!post) return <main style={{ maxWidth: 700 }}>Not found</main>;

  return (
    <main style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>{post.title}</h1>
      {post.publishedAt ? (
        <div style={{ opacity: 0.6, marginBottom: 24 }}>
          {new Date(post.publishedAt).toISOString().slice(0, 10)}
        </div>
      ) : null}

      <div style={{ lineHeight: 1.7 }}>
        <PortableText value={post.body} />
      </div>
    </main>
  );
}
