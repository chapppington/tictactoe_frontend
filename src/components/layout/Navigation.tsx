'use client'

import { DASHBOARD_PAGES } from '@/config/pages/dashboard.config'
import { PUBLIC_PAGES } from '@/config/pages/public.config'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
	const pathname = usePathname()

	const isAuthPage = pathname.startsWith(PUBLIC_PAGES.AUTH)
	const isHomePage = pathname === '/'

	if (isAuthPage || isHomePage) {
		return null
	}

	const isActive = (path: string) => {
		return pathname === path || pathname.startsWith(path + '/')
	}

	return (
		<nav className="bg-zinc-900 border-b border-zinc-800">
			<div className="max-w-7xl mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					<Link
						href="/"
						className="text-xl font-bold text-zinc-100 hover:text-white transition-colors"
					>
						Крестики-нолики
					</Link>
					<div className="flex items-center gap-4">
						<Link
							href={DASHBOARD_PAGES.LOBBY}
							className={`px-4 py-2 rounded-lg transition-colors ${
								isActive(DASHBOARD_PAGES.LOBBY)
									? 'bg-blue-500 text-white'
									: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
							}`}
						>
							Лобби
						</Link>
						<Link
							href={DASHBOARD_PAGES.PROFILE}
							className={`px-4 py-2 rounded-lg transition-colors ${
								isActive(DASHBOARD_PAGES.PROFILE)
									? 'bg-blue-500 text-white'
									: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
							}`}
						>
							Профиль
						</Link>
					</div>
				</div>
			</div>
		</nav>
	)
}
