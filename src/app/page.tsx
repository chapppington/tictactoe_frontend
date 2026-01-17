import { DASHBOARD_PAGES } from '@/config/pages/dashboard.config'
import { PUBLIC_PAGES } from '@/config/pages/public.config'
import Link from 'next/link'

export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-6">
			<h1 className="text-4xl font-bold text-zinc-100">Крестики-нолики</h1>
			<p className="text-zinc-400">Добро пожаловать в игру!</p>
			<div className="flex gap-4 mt-4">
				<Link
					href={PUBLIC_PAGES.LOGIN}
					className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
				>
					Войти
				</Link>
				<Link
					href={DASHBOARD_PAGES.LOBBY}
					className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
				>
					Лобби
				</Link>
			</div>
		</div>
	)
}
