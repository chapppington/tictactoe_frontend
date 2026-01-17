'use client'

import { IGame, GameStatus } from '@/shared/types/game.types'
import { PlayerSymbol } from '@/shared/types/game.types'
import { useUser } from '@/hooks/useUser'

interface Props {
	game: IGame
	currentUserId: string
}

export function GameInfo({ game, currentUserId }: Props) {
	const isPlayerX = game.player_x_id === currentUserId
	const isPlayerO = game.player_o_id === currentUserId
	
	const { user: playerX } = useUser(game.player_x_id)
	const { user: playerO } = useUser(game.player_o_id)

	return (
		<div className="bg-zinc-900 p-6 rounded-lg space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div
						className={`w-3 h-3 rounded-full ${
							isPlayerX ? 'bg-blue-400' : 'bg-zinc-600'
						}`}
					/>
					<span className="text-zinc-300">
						{isPlayerX ? 'Вы (X)' : playerX?.name || `Игрок X (${game.player_x_id.slice(0, 8)})`}
					</span>
					{isPlayerX && (
						<span className="text-xs text-zinc-500">(Вы)</span>
					)}
				</div>
				<span className="text-blue-400 font-bold text-xl">X</span>
			</div>

			<div className="h-px bg-zinc-700" />

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div
						className={`w-3 h-3 rounded-full ${
							isPlayerO ? 'bg-red-400' : 'bg-zinc-600'
						}`}
					/>
					<span className="text-zinc-300">
						{isPlayerO ? 'Вы (O)' : game.player_o_id ? (playerO?.name || `Игрок O (${game.player_o_id.slice(0, 8)})`) : 'Ожидание...'}
					</span>
					{isPlayerO && (
						<span className="text-xs text-zinc-500">(Вы)</span>
					)}
				</div>
				<span className="text-red-400 font-bold text-xl">O</span>
			</div>

			{game.status === GameStatus.FINISHED && game.finished_at && (
				<>
					<div className="h-px bg-zinc-700" />
					<div className="text-sm text-zinc-500">
						Игра завершена: {new Date(game.finished_at).toLocaleString('ru-RU')}
					</div>
				</>
			)}
		</div>
	)
}
