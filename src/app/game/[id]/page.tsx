'use client'

import { GameBoard } from '@/components/game/GameBoard'
import { GameInfo } from '@/components/game/GameInfo'
import { useGame } from '@/hooks/useGame'
import { GameStatus } from '@/shared/types/game.types'
import { useRouter } from 'next/navigation'
import { MiniLoader } from '@/components/ui/MiniLoader'

export default function GamePage() {
	const router = useRouter()
	const {
		game,
		currentUserId,
		isLoadingGame,
		gameError,
		isConnected,
		shouldConnectWebSocket,
		handleCellClick,
		isMakingMove
	} = useGame()

	if (isLoadingGame || !currentUserId) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<MiniLoader />
			</div>
		)
	}

	if (gameError || !game) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen gap-4">
				<p className="text-red-400 text-xl">Игра не найдена</p>
				<button
					onClick={() => router.push('/lobby')}
					className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
				>
					Вернуться в лобби
				</button>
			</div>
		)
	}

	return (
		<div className="w-full max-w-4xl mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold text-zinc-100">Игра в крестики-нолики</h1>
				{shouldConnectWebSocket && (
					<div className="flex items-center gap-2">
						<div
							className={`w-2 h-2 rounded-full ${
								isConnected ? 'bg-green-400' : 'bg-red-400'
							}`}
						/>
						<span className="text-sm text-zinc-400">
							{isConnected ? 'Подключено' : 'Отключено'}
						</span>
					</div>
				)}
				{!shouldConnectWebSocket && game.status === GameStatus.FINISHED && (
					<div className="text-sm text-zinc-500">Игра завершена</div>
				)}
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				<div className="md:col-span-2">
					<GameBoard
						game={game}
						currentUserId={currentUserId}
						onCellClick={handleCellClick}
						isLoading={isMakingMove}
					/>
				</div>

				<div>
					<GameInfo game={game} currentUserId={currentUserId} />
				</div>
			</div>
		</div>
	)
}
