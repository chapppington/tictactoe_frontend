import { useEffect, useRef, useState } from 'react'
import { IGame, IWebSocketMessage } from '@/shared/types/game.types'
import authTokenService from '@/services/auth/auth-token.service'
import { BACKEND_MAIN } from '@/constants'

interface UseGameWebSocketOptions {
	gameId: string
	enabled?: boolean
	onMessage?: (message: IWebSocketMessage) => void
	onGameState?: (game: IGame) => void
	onError?: (error: Event) => void
}

export function useGameWebSocket({
	gameId,
	enabled = true,
	onMessage,
	onGameState,
	onError
}: UseGameWebSocketOptions) {
	const [isConnected, setIsConnected] = useState(false)
	const [game, setGame] = useState<IGame | null>(null)
	const wsRef = useRef<WebSocket | null>(null)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const connect = () => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			return
		}
		
		if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
			return
		}

		const wsUrl = `${BACKEND_MAIN.replace('http', 'ws')}/api/v1/games/${gameId}/ws`
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

				if (message.event === 'game_state' && message.data) {
					const gameData = message.data as IGame
					setGame(gameData)
					onGameState?.(gameData)
				} else if (message.event === 'move_made' || message.event === 'game_finished') {
					if (message.data?.game) {
						const gameData = message.data.game as IGame
						setGame(prevGame => {
							if (prevGame?.oid === gameData.oid) {
								return gameData
							}
							return gameData
						})
					}
					onMessage?.(message)
				} else if (message.event === 'player_joined') {
					if (message.data?.game) {
						const gameData = message.data.game as IGame
						setGame(gameData)
					}
					onMessage?.(message)
				} else if (message.event === 'game_created') {
					if (message.data) {
						const gameData = message.data as IGame
						setGame(gameData)
						onGameState?.(gameData)
					}
					onMessage?.(message)
				} else {
					onMessage?.(message)
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
				reconnectTimeoutRef.current = null
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

	const sendPing = () => {
		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify({ event: 'ping' }))
		}
	}

	useEffect(() => {
		if (!enabled) {
			disconnect()
			return
		}

		connect()

		const pingInterval = setInterval(() => {
			sendPing()
		}, 30000)

		return () => {
			disconnect()
			clearInterval(pingInterval)
		}
	}, [gameId, enabled])

	return {
		isConnected,
		game,
		disconnect,
		sendPing
	}
}
