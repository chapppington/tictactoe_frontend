import { useEffect, useRef, useState } from 'react'
import { IGame, IWebSocketMessage, IPaginatedResponse } from '@/shared/types/game.types'
import { BACKEND_MAIN } from '@/constants'

interface UseWaitingGamesWebSocketOptions {
	enabled?: boolean
	initialGames?: IGame[]
	onGamesUpdate?: (games: IGame[]) => void
	onError?: (error: Event) => void
}

export function useWaitingGamesWebSocket({
	enabled = true,
	initialGames = [],
	onGamesUpdate,
	onError
}: UseWaitingGamesWebSocketOptions) {
	const [isConnected, setIsConnected] = useState(false)
	const [games, setGames] = useState<IGame[]>(initialGames)
	const wsRef = useRef<WebSocket | null>(null)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const initialGamesRef = useRef<IGame[]>(initialGames)

	useEffect(() => {
		if (initialGames.length > 0) {
			if (games.length === 0) {
				setGames(initialGames)
			}
			initialGamesRef.current = initialGames
		}
	}, [initialGames, games.length])

	const connect = () => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			return
		}
		
		if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
			return
		}

		const wsUrl = `${BACKEND_MAIN.replace('http', 'ws')}/api/v1/games/waiting-games/ws`
		const ws = new WebSocket(wsUrl)

		ws.onopen = () => {
			setIsConnected(true)
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
				reconnectTimeoutRef.current = null
			}
		}

		ws.onmessage = event => {
			try {
				const message: IWebSocketMessage = JSON.parse(event.data)

				if (message.event === 'games_list' && message.data) {
					const gamesData = Array.isArray(message.data) 
						? message.data 
						: (message.data as IPaginatedResponse<IGame>).items || []
					setGames(gamesData)
					onGamesUpdate?.(gamesData)
				} else if (message.event === 'new_waiting_game' && message.data) {
					const newGame = message.data as IGame
					setGames(prev => {
						if (prev.some(g => g.oid === newGame.oid)) {
							return prev
						}
						const updated = [...prev, newGame]
						onGamesUpdate?.(updated)
						return updated
					})
				} else if (message.event === 'waiting_game_removed' && message.data) {
					const removedGameId = message.data?.game_id || (message.data as IGame)?.oid
					if (removedGameId) {
						setGames(prev => {
							const updated = prev.filter(g => g.oid !== removedGameId)
							onGamesUpdate?.(updated)
							return updated
						})
					}
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error)
			}
		}

		ws.onerror = error => {
			console.error('WebSocket error:', error)
			onError?.(error)
		}

		ws.onclose = () => {
			setIsConnected(false)
			wsRef.current = null

			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current)
			}

			if (enabled) {
				reconnectTimeoutRef.current = setTimeout(() => {
					connect()
				}, 3000)
			}
		}

		wsRef.current = ws
	}

	const disconnect = () => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current)
			reconnectTimeoutRef.current = null
		}

		if (wsRef.current) {
			wsRef.current.close()
			wsRef.current = null
		}
		setIsConnected(false)
	}

	useEffect(() => {
		if (!enabled) {
			disconnect()
			return
		}

		connect()

		return () => {
			disconnect()
		}
	}, [enabled])

	return {
		isConnected,
		games,
		disconnect
	}
}
