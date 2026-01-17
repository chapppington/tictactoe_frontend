'use client'

import { IGame, GameStatus } from '@/shared/types/game.types'
import { useUser } from '@/hooks/useUser'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Props {
	game: IGame
	currentUserId: string
	onJoin?: (gameId: string) => void
	isJoining?: boolean
}

export function GameCard({ game, currentUserId, onJoin, isJoining }: Props) {
	const isMyGame = game.player_x_id === currentUserId || game.player_o_id === currentUserId
	const canJoin = !isMyGame && game.status === GameStatus.WAITING && !game.player_o_id
	const canEnter = isMyGame && game.status === GameStatus.WAITING
	
	const { user: playerX } = useUser(game.player_x_id)
	const { user: playerO } = useUser(game.player_o_id)

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors"
		>
			<div className="flex items-center justify-between mb-3">
				<div className="flex-1 min-w-0">
					<p className="text-zinc-300 text-sm font-medium truncate">#{game.oid.slice(0, 8)}</p>
					<p className="text-zinc-500 text-xs mt-0.5 truncate">
						{new Date(game.created_at).toLocaleDateString('ru-RU', {
							day: '2-digit',
							month: '2-digit',
							hour: '2-digit',
							minute: '2-digit'
						})}
					</p>
				</div>
				<div
					className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
						game.status === GameStatus.WAITING
							? 'bg-yellow-500/20 text-yellow-400'
							: game.status === GameStatus.ACTIVE
								? 'bg-blue-500/20 text-blue-400'
								: 'bg-zinc-500/20 text-zinc-400'
					}`}
				>
					{game.status === GameStatus.WAITING ? 'Ожидание' : game.status === GameStatus.ACTIVE ? 'В процессе' : 'Завершена'}
				</div>
			</div>

			<div className="flex items-center gap-3 mb-3">
				<div className="flex-1 min-w-0">
					<p className="text-zinc-400 text-xs mb-0.5">X</p>
					<p className="text-zinc-200 text-sm truncate">
						{isMyGame ? 'Вы' : playerX?.name || `Игрок (${game.player_x_id.slice(0, 6)})`}
					</p>
				</div>
				<div className="text-zinc-600 text-xs">vs</div>
				<div className="flex-1 min-w-0">
					<p className="text-zinc-400 text-xs mb-0.5">O</p>
					<p className="text-zinc-200 text-sm truncate">
						{game.player_o_id 
							? (game.player_o_id === currentUserId 
								? 'Вы' 
								: playerO?.name || `Игрок (${game.player_o_id.slice(0, 6)})`)
							: 'Ожидание...'}
					</p>
				</div>
			</div>

			<div className="flex gap-2">
				{canJoin ? (
					<button
						onClick={() => onJoin?.(game.oid)}
						disabled={isJoining}
						className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors text-sm"
					>
						{isJoining ? 'Присоединение...' : 'Присоединиться'}
					</button>
				) : canEnter ? (
					<Link
						href={`/game/${game.oid}`}
						className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-center transition-colors text-sm"
					>
						Войти
					</Link>
				) : (
					<Link
						href={`/game/${game.oid}`}
						className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded-lg text-center transition-colors text-sm"
					>
						Смотреть
					</Link>
				)}
			</div>
		</motion.div>
	)
}
