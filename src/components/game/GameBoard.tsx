'use client'

import { IGame, PlayerSymbol, GameStatus } from '@/shared/types/game.types'
import { motion } from 'framer-motion'

interface Props {
	game: IGame
	currentUserId: string
	onCellClick: (row: number, col: number) => void
	isLoading?: boolean
}

export function GameBoard({ game, currentUserId, onCellClick, isLoading }: Props) {
	const isMyTurn =
		game.status === GameStatus.ACTIVE &&
		((game.current_turn === PlayerSymbol.X && String(game.player_x_id) === String(currentUserId)) ||
			(game.current_turn === PlayerSymbol.O && game.player_o_id && String(game.player_o_id) === String(currentUserId)))

	const canMakeMove = isMyTurn && !isLoading

	const getCellSymbol = (row: number, col: number) => {
		return game.board[row][col]
	}

	const isCellDisabled = (row: number, col: number) => {
		return !canMakeMove || game.board[row][col] !== null || game.status !== GameStatus.ACTIVE
	}

	const getPlayerSymbol = () => {
		if (String(game.player_x_id) === String(currentUserId)) return PlayerSymbol.X
		if (game.player_o_id && String(game.player_o_id) === String(currentUserId)) return PlayerSymbol.O
		return null
	}

	const mySymbol = getPlayerSymbol()

	return (
		<div className="flex flex-col items-center gap-6">
			<div className="text-center">
				{game.status === GameStatus.WAITING && (
					<p className="text-zinc-400">Ожидание второго игрока...</p>
				)}
				{game.status === GameStatus.ACTIVE && (
					<p className="text-zinc-300">
						{isMyTurn ? (
							<span className="text-green-400">Ваш ход ({mySymbol})</span>
						) : (
							<span className="text-zinc-400">
								Ход соперника ({game.current_turn})
							</span>
						)}
					</p>
				)}
				{game.status === GameStatus.FINISHED && (
					<div className="text-zinc-300">
						{game.winner_id && String(game.winner_id) === String(currentUserId) ? (
							<p className="text-green-400 text-xl font-bold">Вы выиграли! 🎉</p>
						) : game.winner_id ? (
							<p className="text-red-400 text-xl font-bold">Вы проиграли 😔</p>
						) : (
							<p className="text-yellow-400 text-xl font-bold">Ничья!</p>
						)}
					</div>
				)}
			</div>

			<div className="grid grid-cols-3 gap-2 bg-zinc-800 p-4 rounded-lg">
				{game.board.map((row, rowIndex) =>
					row.map((cell, colIndex) => (
						<motion.button
							key={`${rowIndex}-${colIndex}-${cell || 'empty'}-${game.updated_at}`}
							whileHover={!isCellDisabled(rowIndex, colIndex) ? { scale: 1.05 } : {}}
							whileTap={!isCellDisabled(rowIndex, colIndex) ? { scale: 0.95 } : {}}
							onClick={() => onCellClick(rowIndex, colIndex)}
							disabled={isCellDisabled(rowIndex, colIndex)}
							className={`
								w-24 h-24 bg-zinc-900 rounded-lg border-2
								flex items-center justify-center text-4xl font-bold
								transition-all duration-200
								${
									isCellDisabled(rowIndex, colIndex)
										? 'border-zinc-700 cursor-not-allowed opacity-60'
										: 'border-zinc-600 hover:border-zinc-500 cursor-pointer'
								}
								${cell === PlayerSymbol.X ? 'text-blue-400' : ''}
								${cell === PlayerSymbol.O ? 'text-red-400' : ''}
							`}
						>
							{cell && (
								<motion.span
									key={`${rowIndex}-${colIndex}-${cell}-${game.updated_at}`}
									initial={{ scale: 0, rotate: -180 }}
									animate={{ scale: 1, rotate: 0 }}
									transition={{ duration: 0.3, type: 'spring' }}
								>
									{cell}
								</motion.span>
							)}
						</motion.button>
					))
				)}
			</div>
		</div>
	)
}
