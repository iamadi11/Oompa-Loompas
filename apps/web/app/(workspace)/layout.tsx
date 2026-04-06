import { AppShellHeader } from '../../components/shell/MainNav'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-surface-raised/85 backdrop-blur-md shadow-header">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AppShellHeader />
        </div>
      </header>
      <main
        id="main-content"
        className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  )
}
