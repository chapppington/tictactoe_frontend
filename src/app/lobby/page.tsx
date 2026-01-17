'use client'

import { GameCard } from '@/components/lobby/GameCard'
import { useLobby } from '@/hooks/useLobby'
import Link from 'next/link'
import { MiniLoader } from '@/components/ui/MiniLoader'
import { IGame } from '@/shared/types/game.types'

export default function LobbyPage() {
	const {
		currentUserId,
		waitingGames,
		myGames,
		isLoadingWaiting,
		isLoadingMy,
		isWaitingGamesConnected,
		isCreating,
		isJoining,
		myGamesPage,
		totalMyGamesPages,
		handleCreateGame,
		handleJoinGame,
		handlePreviousPage,
		handleNextPage
	} = useLobby()

	if (!currentUserId) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<MiniLoader />
			</div>
		)
	}

	return (
		<div className="w-full max-w-6xl mx-auto p-6 space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold text-zinc-100">Лобби</h1>
				<div className="flex gap-4">
					<Link
						href="/dashboard/profile"
						className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
					>
						Профиль
					</Link>
					<button
						onClick={handleCreateGame}
						disabled={isCreating}
						className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
					>
						{isCreating ? (
							<span className="flex items-center gap-2">
								<MiniLoader />
								Создание...
							</span>
						) : (
							'Создать игру'
						)}
					</button>
				</div>
			</div>

			<div className="space-y-6">
				{myGames && (
					<div>
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold text-zinc-200">
								Мои игры ({myGames.data.data.pagination.total || 0})
							</h2>
							{myGames.data.data.pagination.total > 3 && (
								<div className="flex items-center gap-2">
									<button
										onClick={handlePreviousPage}
										disabled={myGamesPage === 0 || isLoadingMy}
										className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
									>
										Предыдущая
									</button>
									<span className="text-zinc-400 text-sm">
										Страница {myGamesPage + 1} из {totalMyGamesPages}
									</span>
									<button
										onClick={handleNextPage}
										disabled={
											myGamesPage >= totalMyGamesPages - 1 ||
											isLoadingMy
										}
										className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
									>
										Следующая
									</button>
								</div>
							)}
						</div>
						{isLoadingMy ? (
							<div className="flex items-center justify-center py-12">
								<MiniLoader />
							</div>
						) : myGames.data.data.items.length === 0 ? (
							<div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
								<p className="text-zinc-400">У вас пока нет игр</p>
								<p className="text-zinc-500 text-sm mt-2">
									Создайте новую игру, чтобы начать играть!
								</p>
							</div>
						) : (
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
								{myGames.data.data.items.map(game => (
									<GameCard
										key={game.oid}
										game={game}
										currentUserId={currentUserId}
										onJoin={handleJoinGame}
										isJoining={isJoining}
									/>
								))}
							</div>
						)}
					</div>
				)}

				<div>
					<div className="flex items-center gap-2 mb-4">
						<h2 className="text-xl font-semibold text-zinc-200">
							Ожидающие игры ({waitingGames?.data.data.items.length || 0})
						</h2>
						{isWaitingGamesConnected && (
							<span className="text-xs text-green-500" title="Подключено к вебсокету">
								●
							</span>
						)}
					</div>
					{isLoadingWaiting ? (
						<div className="flex items-center justify-center py-12">
							<MiniLoader />
						</div>
					) : waitingGames?.data.data.items.length === 0 ? (
						<div className="text-center py-12 bg-zinc-900 rounded-lg border border-zinc-800">
							<p className="text-zinc-400">Нет доступных игр</p>
							<p className="text-zinc-500 text-sm mt-2">
								Создайте новую игру, чтобы начать играть!
							</p>
						</div>
					) : (
						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
							{waitingGames?.data?.data?.items?.map((game: IGame) => (
								<GameCard
									key={game.oid}
									game={game}
									currentUserId={currentUserId}
									onJoin={handleJoinGame}
									isJoining={isJoining}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
