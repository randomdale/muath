import fs from "fs";
import path from "path";
import matter from "gray-matter";

export default async function Post({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const filePath = path.join(process.cwd(), "content", "posts", `${slug}.md`);
  const file = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(file);

  return (
    <article style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>{data.title}</h1>
      <div style={{ opacity: 0.6, marginBottom: 24 }}>{data.date}</div>
      <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{content}</div>
    </article>
  );
}
