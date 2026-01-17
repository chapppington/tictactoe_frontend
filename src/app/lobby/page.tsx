'use client'

import { GameCard } from '@/components/lobby/GameCard'
import { gameService } from '@/services/game.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { MiniLoader } from '@/components/ui/MiniLoader'
import authTokenService from '@/services/auth/auth-token.service'
import Link from 'next/link'
import { useWaitingGamesWebSocket } from '@/hooks/useWaitingGamesWebSocket'
import { IGame } from '@/shared/types/game.types'

export default function LobbyPage() {
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
						disabled={isCreating || createGameMutation.isPending}
						className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
					>
						{isCreating || createGameMutation.isPending ? (
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
							{myGames.data.data.pagination.total > gamesPerPage && (
								<div className="flex items-center gap-2">
									<button
										onClick={() => setMyGamesPage(prev => Math.max(0, prev - 1))}
										disabled={myGamesPage === 0 || isLoadingMy}
										className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
									>
										Предыдущая
									</button>
									<span className="text-zinc-400 text-sm">
										Страница {myGamesPage + 1} из {Math.ceil((myGames.data.data.pagination.total || 0) / gamesPerPage)}
									</span>
									<button
										onClick={() => setMyGamesPage(prev => prev + 1)}
										disabled={
											myGamesPage >= Math.ceil((myGames.data.data.pagination.total || 0) / gamesPerPage) - 1 ||
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
										isJoining={joinGameMutation.isPending}
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
									isJoining={joinGameMutation.isPending}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
