export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-discord-bg-secondary flex items-center justify-center p-4"
      style={{
        backgroundImage: "radial-gradient(ellipse at 60% 40%, rgba(88,101,242,0.15) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(88,101,242,0.08) 0%, transparent 50%)"
      }}
    >
      {children}
    </div>
  );
}
