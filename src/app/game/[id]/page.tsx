'use client'

import { GameBoard } from '@/components/game/GameBoard'
import { GameInfo } from '@/components/game/GameInfo'
import { useGameWebSocket } from '@/hooks/useGameWebSocket'
import { gameService } from '@/services/game.service'
import { IGame, IWebSocketMessage, GameStatus, PlayerSymbol } from '@/shared/types/game.types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, useRef } from 'react'
import toast from 'react-hot-toast'
import { MiniLoader } from '@/components/ui/MiniLoader'
import authTokenService from '@/services/auth/auth-token.service'

export default function GamePage() {
	const params = useParams()
	const router = useRouter()
	const gameId = params.id as string
	const queryClient = useQueryClient()
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)
	const finishedNotificationShown = useRef(false)
	const currentUserIdRef = useRef<string | null>(null)
	const wasGameActiveRef = useRef(false)

	const { data: gameData, isLoading: isLoadingGame, error: gameError } = useQuery({
		queryKey: ['game', gameId],
		queryFn: () => gameService.getGame(gameId),
		enabled: !!gameId,
		retry: 1
	})

	const initialGame = gameData?.data?.data
	const shouldConnectWebSocket = initialGame 
		? initialGame.status !== GameStatus.FINISHED && initialGame.status !== GameStatus.CANCELLED
		: false
	
	if (initialGame && initialGame.status === GameStatus.ACTIVE) {
		wasGameActiveRef.current = true
	}

	const { game: wsGame, isConnected, disconnect, reconnect } = useGameWebSocket({
		gameId,
		enabled: shouldConnectWebSocket && !isLoadingGame,
		onMessage: (message: IWebSocketMessage) => {
			if (message.event === 'move_made') {
				if (message.data?.game) {
					const updatedGame = message.data.game as IGame
					queryClient.setQueryData(['game', gameId], { data: updatedGame })
				}
			}
			if (message.event === 'game_finished') {
				if (message.data?.game) {
					const updatedGame = message.data.game as IGame
					queryClient.setQueryData(['game', gameId], { data: updatedGame })
					
					const userId = currentUserIdRef.current
					if (userId && !finishedNotificationShown.current) {
						finishedNotificationShown.current = true
						const winnerId = updatedGame.winner_id
						if (winnerId && String(winnerId) === String(userId)) {
							toast.success('Вы выиграли! 🎉', { duration: 3000 })
						} else if (winnerId) {
							toast.error('Вы проиграли 😔', { duration: 3000 })
						} else {
							toast('Ничья!', { duration: 3000 })
						}
					}
					
					disconnect()
				}
			}
			if (message.event === 'player_joined') {
				if (message.data?.game) {
					const updatedGame = message.data.game as IGame
					const joinedPlayerId = message.data?.player_id
					queryClient.setQueryData(['game', gameId], { data: updatedGame })
					if (currentUserId && joinedPlayerId && String(joinedPlayerId) !== String(currentUserId)) {
						toast.success('Игрок присоединился!', { duration: 2000 })
					}
				}
			}
		},
		onGameState: (game: IGame) => {
			queryClient.setQueryData(['game', gameId], { data: game })
			if (game.status === GameStatus.FINISHED || game.status === GameStatus.CANCELLED) {
				disconnect()
			}
		},
		onError: () => {
			toast.error('Ошибка подключения к игре')
		}
	})

	const makeMoveMutation = useMutation({
		mutationFn: ({ row, col }: { row: number; col: number }) =>
			gameService.makeMove(gameId, { row, col }),
		onSuccess: (response) => {
			const updatedGame = response.data.data
			queryClient.setQueryData(['game', gameId], { data: updatedGame })
		},
		onError: (error: any) => {
			const message = error?.response?.data?.errors?.[0]?.message || 'Ошибка при выполнении хода'
			toast.error(message)
		}
	})

	useEffect(() => {
		const token = authTokenService.getAccessToken()
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split('.')[1]))
				const userId = payload.sub
				setCurrentUserId(userId)
				currentUserIdRef.current = userId
			} catch {
				router.push('/login')
			}
		} else {
			router.push('/login')
		}
	}, [router])

	useEffect(() => {
		if (wsGame && wsGame.oid === gameId) {
			const currentData = queryClient.getQueryData<{ data: IGame }>(['game', gameId])
			if (!currentData || currentData.data.updated_at !== wsGame.updated_at) {
				queryClient.setQueryData(['game', gameId], { data: wsGame })
			}
		}
	}, [wsGame, gameId, queryClient])


	const game = useMemo(() => {
		return wsGame || gameData?.data?.data
	}, [wsGame, gameData])

	useEffect(() => {
		if (game && game.status === GameStatus.ACTIVE) {
			wasGameActiveRef.current = true
			finishedNotificationShown.current = false
		} else if (game && game.status !== GameStatus.FINISHED) {
			wasGameActiveRef.current = false
			finishedNotificationShown.current = false
		}
		
		if (game && (game.status === GameStatus.FINISHED || game.status === GameStatus.CANCELLED)) {
			disconnect()
		}
	}, [game, disconnect])

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

	const handleCellClick = (row: number, col: number) => {
		if (game.status !== GameStatus.ACTIVE) return
		if (game.board[row][col] !== null) return

		const isMyTurn =
			(game.current_turn === PlayerSymbol.X && game.player_x_id === currentUserId) ||
			(game.current_turn === PlayerSymbol.O && game.player_o_id === currentUserId)

		if (!isMyTurn) {
			toast.error('Не ваш ход!')
			return
		}

		makeMoveMutation.mutate({ row, col })
	}

	return (
		<div className="w-full max-w-4xl mx-auto p-6 space-y-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold text-zinc-100">Игра в крестики-нолики</h1>
				{shouldConnectWebSocket && (
					<>
						{isConnected ? (
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-green-400" />
								<span className="text-sm text-zinc-400">Подключено</span>
							</div>
						) : (
							<button
								onClick={reconnect}
								className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
							>
								Переподключиться
							</button>
						)}
					</>
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
						isLoading={makeMoveMutation.isPending}
					/>
				</div>

				<div>
					<GameInfo game={game} currentUserId={currentUserId} />
				</div>
			</div>
		</div>
	)
}
