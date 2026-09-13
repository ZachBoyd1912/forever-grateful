// SOURCED SHELL — adapted from 21st.dev MCP, zero new deps.
// 21st component: Dashboard Sidebar [id:14941] by arunjdass
//   (dual-theme shell, collapsible multi-tiered nav, WorkspaceSwitcher,
//   breadcrumb header w/ toggle + search slot, grid-rows expand animation).
// Adaptation notes for Roobet Tracker:
// - lucide-react NOT installed → inline SVG icons (stroke=currentColor,
//   1.5 width) in Lucide style, same visual language, no new dep.
// - mockNavGroups replaced with Roobet groups: Overview / Analytics /
//   Workspace / Help, wired to existing anchors (#overview/#month/#games/
//   #recent/#roi/#import) + activeTab state already in page.tsx.
// - div+onClick → button + aria-expanded/aria-current for keyboard + SR.
// - Tokens stay OLED (bg-card/50, border-border/50, text-muted-foreground)
//   from globals.css; transitions 200-300ms + reduced-motion guard inherited.
// - shadcn rule: gap-* not space-*, size-* for squares, semantic colors.
'use client'

import { useState } from 'react'

type IconProps = { className?: string }

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-4'}
    >
      {children}
    </svg>
  )
}

export function IconOverview({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </Svg>
  )
}

export function IconRecent({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </Svg>
  )
}

export function IconMonth({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 9h18" />
    </Svg>
  )
}

export function IconGames({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 12h.01M12 8h.01M12 16h.01M16 12h.01" />
    </Svg>
  )
}

export function IconChart({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-7" />
    </Svg>
  )
}

export function IconImport({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Svg>
  )
}

export function IconHelp({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.5 2.5 0 1 1 3.4 2.3c-.8.3-1.4 1-1.4 1.7" />
      <path d="M12 17h.01" />
    </Svg>
  )
}

export function IconChevron({ className, open }: IconProps & { open?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className ?? 'size-3.5'} transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

export function IconPanel({ className, open }: IconProps & { open?: boolean }) {
  return (
    <Svg className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d={open ? 'M9 4v16' : 'M15 4v16'} />
    </Svg>
  )
}

export type NavItemData = {
  id: string
  title: string
  href: string
  icon: (props: IconProps) => React.ReactNode
  badge?: number | string
  children?: NavItemData[]
}

export type NavGroupData = {
  heading?: string
  items: NavItemData[]
}

export function roobetNavGroups(betCount: number): NavGroupData[] {
  return [
    {
      items: [
        { id: 'overview', title: 'Overview', href: '#overview', icon: IconOverview },
        { id: 'recent', title: 'Recent bets', href: '#recent', icon: IconRecent, badge: betCount },
      ],
    },
    {
      heading: 'Analytics',
      items: [
        { id: 'month', title: 'Month', href: '#month', icon: IconMonth },
        { id: 'games', title: 'Games', href: '#games', icon: IconGames },
        { id: 'roi', title: 'ROI chart', href: '#roi', icon: IconChart },
      ],
    },
    {
      heading: 'Workspace',
      items: [
        {
          id: 'import',
          title: 'Import',
          href: '#import',
          icon: IconImport,
          children: [
            { id: 'import-how', title: 'How to import', href: '#import', icon: IconHelp },
            { id: 'import-recent', title: 'Verify in Recent', href: '#recent', icon: IconRecent },
          ],
        },
      ],
    },
  ]
}

function WorkspaceSwitcher({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (ws: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const workspaces = ['Private Tracker', 'Month Review']
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((v) => !v)}
        className="mb-4 flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition-colors select-none hover:bg-white/[0.05]"
      >
        <span className="flex items-center gap-3">
          {/* Lighthouse color-contrast: blue-600/white ≈ 5.2:1 (AA),
              vs bg-primary/white ≈ 3.7:1. Same blue family, keeps 21st shape. */}
          <span className="flex size-8 items-center justify-center rounded-md bg-[#2563eb] text-[13px] font-semibold text-white shadow-sm">
            {selected.charAt(0)}
          </span>
          <span className="flex flex-col overflow-hidden text-left">
            <span className="mb-1 max-w-[120px] truncate text-[13px] leading-none font-medium text-foreground">
              {selected}
            </span>
            <span className="text-[11px] leading-none text-muted-foreground">Private P&amp;L</span>
          </span>
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="size-4 shrink-0 text-muted-foreground/50"
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Close workspaces"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="listbox"
            aria-label="Workspaces"
            className="absolute top-[52px] left-0 z-50 flex w-full flex-col gap-0.5 rounded-lg border border-border/50 bg-card py-1 shadow-xl"
          >
            {workspaces.map((ws) => (
              <button
                key={ws}
                type="button"
                role="option"
                aria-selected={ws === selected}
                onClick={() => {
                  onSelect(ws)
                  setIsOpen(false)
                }}
                className={`mx-1 cursor-pointer rounded-md px-3 py-2 text-left text-[13px] transition-colors ${
                  ws === selected
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground/80 hover:bg-white/[0.05]'
                }`}
              >
                {ws}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function NavItem({
  item,
  activeId,
  onSelect,
  level = 0,
}: {
  item: NavItemData
  activeId: string
  onSelect: (id: string, href: string) => void
  level?: number
}) {
  const isActive = activeId === item.id
  const hasChildren = !!item.children?.length
  const [isOpen, setIsOpen] = useState(true)
  const Icon = item.icon

  return (
    <div className="flex w-full flex-col">
      <a
        href={item.href}
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasChildren ? isOpen : undefined}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault()
            setIsOpen((v) => !v)
            return
          }
          onSelect(item.id, item.href)
        }}
        style={{ paddingLeft: `${level * 12 + 10}px` }}
        className={`group flex cursor-pointer items-center justify-between rounded-md px-2.5 py-[7px] transition-all duration-200 select-none ${
          isActive
            ? 'bg-white/[0.08] font-medium text-foreground'
            : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground/90'
        }`}
      >
        <span className="flex items-center gap-2.5">
          <Icon className="size-4 shrink-0" />
          <span className="truncate text-[13px] tracking-wide">{item.title}</span>
        </span>
        <span className="flex items-center gap-2">
          {item.badge !== undefined && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
              {item.badge}
            </span>
          )}
          {hasChildren && <IconChevron open={isOpen} />}
        </span>
      </a>
      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="relative mt-0.5 flex min-h-0 flex-col gap-0.5 overflow-hidden">
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0 border-l border-white/[0.06]"
              style={{ left: `${level * 12 + 17.5}px` }}
            />
            {item.children!.map((child) => (
              <NavItem key={child.id} item={child} activeId={activeId} onSelect={onSelect} level={level + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function SidebarNav({
  className = '',
  activeId,
  onSelect,
  betCount,
  workspace,
  onWorkspaceSelect,
}: {
  className?: string
  activeId: string
  onSelect: (id: string, href: string) => void
  betCount: number
  workspace: string
  onWorkspaceSelect: (ws: string) => void
}) {
  const groups = roobetNavGroups(betCount)
  return (
    <nav
      aria-label="Roobet Tracker sections"
      className={`flex h-full w-[260px] flex-col border-r border-border/50 bg-card/50 p-3 ${className}`}
    >
      <WorkspaceSwitcher selected={workspace} onSelect={onWorkspaceSelect} />
      <div className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto">
        {groups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              // Lighthouse color-contrast audit: headings keep full
              // text-muted-foreground (#a1a1aa ≈ 7:1 on OLED), never /50.
              <span className="mb-1 px-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {group.heading}
              </span>
            )}
            {group.items.map((item) => (
              <NavItem key={item.id} item={item} activeId={activeId} onSelect={onSelect} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-border/50 pt-4">
        <p className="px-2.5 text-[11px] leading-relaxed text-muted-foreground">
          Private dashboard · data never leaves your DB.
        </p>
      </div>
    </nav>
  )
}
