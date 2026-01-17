import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useWaitingGamesWebSocket } from './useWaitingGamesWebSocket'
import { gameService } from '@/services/game.service'
import { IGame } from '@/shared/types/game.types'
import toast from 'react-hot-toast'
import authTokenService from '@/services/auth/auth-token.service'

export function useLobby() {
	const router = useRouter()
	const queryClient = useQueryClient()
	const [currentUserId, setCurrentUserId] = useState<string | null>(null)
	const [isCreating, setIsCreating] = useState(false)
	const [myGamesPage, setMyGamesPage] = useState(0)
	const gamesPerPage = 3

	const { data: initialWaitingGames, isLoading: isLoadingInitialWaiting } = useQuery({
		queryKey: ['games', 'waiting', 'initial'],
		queryFn: () => gameService.getWaitingGames(20, 0)
	})

	const { games: waitingGamesFromWs, isConnected: isWaitingGamesConnected } = useWaitingGamesWebSocket({
		enabled: !!currentUserId,
		initialGames: initialWaitingGames?.data?.data?.items || [],
		onGamesUpdate: (games: IGame[]) => {
			queryClient.setQueryData(['games', 'waiting'], { data: { data: { items: games, pagination: { total: games.length, limit: 20, offset: 0 } } } })
		}
	})

	const waitingGames = waitingGamesFromWs.length > 0
		? { data: { data: { items: waitingGamesFromWs, pagination: { total: waitingGamesFromWs.length, limit: 20, offset: 0 } } } }
		: initialWaitingGames

	const isLoadingWaiting = isLoadingInitialWaiting && waitingGamesFromWs.length === 0

	const { data: myGames, isLoading: isLoadingMy } = useQuery({
		queryKey: ['games', 'my', myGamesPage],
		queryFn: () => gameService.getMyGames(undefined, gamesPerPage, myGamesPage * gamesPerPage)
	})

	const createGameMutation = useMutation({
		mutationFn: () => gameService.createGame(),
		onSuccess: response => {
			const gameId = response.data.data.oid
			toast.success('Игра создана!')
			queryClient.invalidateQueries({ queryKey: ['games', 'my'] })
			router.push(`/game/${gameId}`)
		},
		onError: () => {
			toast.error('Ошибка при создании игры')
			setIsCreating(false)
		}
	})

	const joinGameMutation = useMutation({
		mutationFn: (gameId: string) => gameService.joinGame(gameId),
		onSuccess: (_, gameId) => {
			toast.success('Вы присоединились к игре!')
			queryClient.invalidateQueries({ queryKey: ['games', 'my'] })
			router.push(`/game/${gameId}`)
		},
		onError: (error: any) => {
			const message = error?.response?.data?.errors?.[0]?.message || 'Ошибка при присоединении'
			toast.error(message)
		}
	})

	useEffect(() => {
		const token = authTokenService.getAccessToken()
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split('.')[1]))
				setCurrentUserId(payload.sub)
			} catch {
				router.push('/login')
			}
		} else {
			router.push('/login')
		}
	}, [router])

	const handleCreateGame = () => {
		setIsCreating(true)
		createGameMutation.mutate()
	}

	const handleJoinGame = (gameId: string) => {
		joinGameMutation.mutate(gameId)
	}

	const handlePreviousPage = () => {
		setMyGamesPage(prev => Math.max(0, prev - 1))
	}

	const handleNextPage = () => {
		setMyGamesPage(prev => prev + 1)
	}

	const totalMyGamesPages = myGames?.data?.data?.pagination?.total 
		? Math.ceil(myGames.data.data.pagination.total / gamesPerPage)
		: 0

	return {
		currentUserId,
		waitingGames,
		myGames,
		isLoadingWaiting,
		isLoadingMy,
		isWaitingGamesConnected,
		isCreating: isCreating || createGameMutation.isPending,
		isJoining: joinGameMutation.isPending,
		myGamesPage,
		totalMyGamesPages,
		handleCreateGame,
		handleJoinGame,
		handlePreviousPage,
		handleNextPage
	}
}
