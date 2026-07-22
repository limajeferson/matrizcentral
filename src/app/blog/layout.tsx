export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <div className="force-light min-h-screen bg-background text-foreground">{children}</div>;
}
