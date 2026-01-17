'use client'
import { MiniLoader } from '@/components/ui/MiniLoader'
import { PUBLIC_PAGES } from '@/config/pages/public.config'
import { useProfile } from '@/hooks/useProfile'
import { gameService } from '@/services/game.service'
import authService from '@/services/auth/auth.service'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GameStatus } from '@/shared/types/game.types'

export function ProfileInfo() {
	const router = useRouter()

	const { isLoading, refetch, user } = useProfile()

	const { data: myGames, isLoading: isLoadingGames } = useQuery({
		queryKey: ['games', 'my', 'profile'],
		queryFn: () => gameService.getMyGames(undefined, 3, 0),
		enabled: !!user
	})

	const [isPending, startTransition] = useTransition()

	const { mutate: mutateLogout, isPending: isLogoutPending } = useMutation({
		mutationKey: ['logout'],
		mutationFn: () => authService.logout(),
		onSuccess() {
			refetch()
			startTransition(() => {
				router.push(PUBLIC_PAGES.LOGIN)
			})
		}
	})

	const isLogoutLoading = isLogoutPending || isPending

	if (isLoading)
		return (
			<div className="flex items-center justify-center min-h-screen">
				<MiniLoader />
			</div>
		)

	if (!user) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<p className="text-zinc-400">Профиль не найден</p>
			</div>
		)
	}

	const handleCopyId = () => {
		navigator.clipboard.writeText(user.oid)
	}

	return (
		<div className="w-full max-w-2xl mx-auto p-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-zinc-900 rounded-lg border border-zinc-800 p-8 space-y-6"
			>
				<div className="flex items-center gap-6">
					<div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white">
						{user.name?.[0]?.toUpperCase() || 'U'}
					</div>
					<div className="flex-1">
						<h1 className="text-3xl font-bold text-zinc-100 mb-2">
							{user.name || 'Пользователь'}
						</h1>
						<p className="text-zinc-400">{user.email}</p>
					</div>
				</div>

				<div className="h-px bg-zinc-800" />

				<div className="space-y-4">
					<div>
						<label className="text-zinc-500 text-sm mb-2 block">ID пользователя</label>
						<div className="flex items-center gap-2">
							<code className="flex-1 bg-zinc-800 px-4 py-2 rounded-lg text-zinc-300 text-sm font-mono break-all">
								{user.oid}
							</code>
							<button
								onClick={handleCopyId}
								className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors text-sm"
							>
								Копировать
							</button>
						</div>
					</div>

					<div>
						<label className="text-zinc-500 text-sm mb-2 block">Email</label>
						<div className="bg-zinc-800 px-4 py-2 rounded-lg text-zinc-300">
							{user.email}
						</div>
					</div>

					<div>
						<label className="text-zinc-500 text-sm mb-2 block">Имя</label>
						<div className="bg-zinc-800 px-4 py-2 rounded-lg text-zinc-300">
							{user.name || 'Не указано'}
						</div>
					</div>
				</div>

				<div className="h-px bg-zinc-800" />

				<div>
					<div className="flex items-center justify-between mb-4">
						<label className="text-zinc-500 text-sm">Последние игры</label>
						<Link
							href="/lobby"
							className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
						>
							Все игры →
						</Link>
					</div>
					{isLoadingGames ? (
						<div className="flex items-center justify-center py-8">
							<MiniLoader />
						</div>
					) : myGames?.data.data.items.length === 0 ? (
						<div className="text-center py-8 bg-zinc-800 rounded-lg border border-zinc-700">
							<p className="text-zinc-400 text-sm">У вас пока нет игр</p>
							<Link
								href="/lobby"
								className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block transition-colors"
							>
								Создать игру
							</Link>
						</div>
					) : (
						<div className="space-y-2">
							{myGames?.data.data.items.map(game => (
								<Link
									key={game.oid}
									href={`/game/${game.oid}`}
									className="block bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:border-zinc-600 rounded-lg px-3 py-2 transition-colors"
								>
									<div className="flex items-center justify-between gap-3">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<span className="text-zinc-300 text-sm font-medium truncate">
													#{game.oid.slice(0, 8)}
												</span>
												<span
													className={`px-1.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
														game.status === GameStatus.WAITING
															? 'bg-yellow-500/20 text-yellow-400'
															: game.status === GameStatus.ACTIVE
																? 'bg-blue-500/20 text-blue-400'
																: 'bg-zinc-500/20 text-zinc-400'
													}`}
												>
													{game.status === GameStatus.WAITING
														? 'Ожидание'
														: game.status === GameStatus.ACTIVE
															? 'В процессе'
															: 'Завершена'}
												</span>
											</div>
											<p className="text-zinc-500 text-xs truncate">
												{new Date(game.created_at).toLocaleDateString('ru-RU', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit'
												})}
											</p>
										</div>
										<div className="text-zinc-500 flex-shrink-0">→</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>

				<div className="h-px bg-zinc-800" />

				<button
					onClick={() => mutateLogout()}
					disabled={isLogoutLoading}
					className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium"
				>
					{isLogoutLoading ? (
						<span className="flex items-center justify-center gap-2">
							<MiniLoader />
							Выход...
						</span>
					) : (
						'Выйти из аккаунта'
					)}
				</button>
			</motion.div>
		</div>
	)
}
