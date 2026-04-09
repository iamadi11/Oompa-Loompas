import { WorkspacePageMotion } from '@/components/motion/WorkspacePageMotion'
import { AppShellHeader } from '@/components/shell/MainNav'
import { BottomNav } from '@/components/shell/BottomNav'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* Unified sticky top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/90 backdrop-blur-xl shadow-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AppShellHeader />
        </div>
      </header>

      {/* Content — bottom padding accommodates mobile bottom nav */}
      <main
        id="main-content"
        className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-[88px] md:pb-8"
        tabIndex={-1}
      >
        <WorkspacePageMotion>{children}</WorkspacePageMotion>
      </main>

      {/* Mobile bottom navigation — hidden md+ */}
      <BottomNav />
    </div>
  )
}
