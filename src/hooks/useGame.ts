import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useGameWebSocket } from './useGameWebSocket'
import { gameService } from '@/services/game.service'
import { IGame, IWebSocketMessage, GameStatus, PlayerSymbol } from '@/shared/types/game.types'
import toast from 'react-hot-toast'
import authTokenService from '@/services/auth/auth-token.service'

export function useGame() {
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

	const { game: wsGame, isConnected, disconnect } = useGameWebSocket({
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

	const handleCellClick = (row: number, col: number) => {
		if (!game || game.status !== GameStatus.ACTIVE) return
		if (game.board[row][col] !== null) return

		const isMyTurn =
			(game.current_turn === PlayerSymbol.X && String(game.player_x_id) === String(currentUserId)) ||
			(game.current_turn === PlayerSymbol.O && game.player_o_id && String(game.player_o_id) === String(currentUserId))

		if (!isMyTurn) {
			toast.error('Не ваш ход!')
			return
		}

		makeMoveMutation.mutate({ row, col })
	}

	return {
		game,
		currentUserId,
		isLoadingGame,
		gameError,
		isConnected,
		shouldConnectWebSocket,
		handleCellClick,
		isMakingMove: makeMoveMutation.isPending
	}
}
