/** Hiển thị nội dung tin dạng văn bản thuần: đoạn văn và gạch đầu dòng. React tự escape nên an toàn XSS. */
export function NewsBody({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/);
  return (
    <div className="prose-vcraft text-[17px] leading-relaxed text-muc/85">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.trim().slice(2)}</li>)}</ul>;
        }
        return <p key={i}>{lines.join(" ")}</p>;
      })}
    </div>
  );
}
