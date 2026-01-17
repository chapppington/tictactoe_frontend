import { instance } from '@/api/axios'
import { IGame, IGameMove, IMakeMoveRequest, IPaginatedResponse } from '@/shared/types/game.types'
import { GameStatus } from '@/shared/types/game.types'

class GameService {
	async createGame() {
		return instance.post<{ data: IGame }>('/games', {})
	}

	async getWaitingGames(limit = 10, offset = 0) {
		return instance.get<{ data: IPaginatedResponse<IGame> }>('/games', {
			params: { limit, offset }
		})
	}

	async getMyGames(status?: GameStatus, limit = 10, offset = 0) {
		return instance.get<{ data: IPaginatedResponse<IGame> }>('/games/my', {
			params: { status, limit, offset }
		})
	}

	async getGame(gameId: string) {
		return instance.get<{ data: IGame }>(`/games/${gameId}`)
	}

	async joinGame(gameId: string) {
		return instance.post<{ data: IGame }>(`/games/${gameId}/join`, {})
	}

	async makeMove(gameId: string, data: IMakeMoveRequest) {
		return instance.post<{ data: IGame }>(`/games/${gameId}/move`, data)
	}

	async getGameMoves(gameId: string) {
		return instance.get<{ data: IGameMove[] }>(`/games/${gameId}/moves`)
	}
}

export const gameService = new GameService()
