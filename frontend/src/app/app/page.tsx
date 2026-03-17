export default function AppPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-discord-bg-tertiary">
      <div className="text-center space-y-3 max-w-sm px-4">
        <div className="text-6xl mb-4">👾</div>
        <h2 className="text-xl font-semibold text-discord-text-primary">
          No server selected
        </h2>
        <p className="text-discord-text-secondary text-sm leading-relaxed">
          Pick a server from the sidebar to start chatting, or create / join one using the{" "}
          <span className="text-discord-blurple font-medium">+</span> button.
        </p>
      </div>
    </div>
  );
}
