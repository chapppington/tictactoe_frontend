export enum GameStatus {
	WAITING = 'waiting',
	ACTIVE = 'active',
	FINISHED = 'finished',
	CANCELLED = 'cancelled'
}

export enum PlayerSymbol {
	X = 'X',
	O = 'O'
}

export interface IGame {
	oid: string
	player_x_id: string
	player_o_id: string | null
	status: GameStatus
	board: (string | null)[][]
	current_turn: PlayerSymbol
	winner_id: string | null
	finished_at: string | null
	created_at: string
	updated_at: string
}

export interface IGameMove {
	oid: string
	game_id: string
	player_id: string
	row: number
	col: number
	symbol: PlayerSymbol
	move_number: number
	created_at: string
}

export interface ICreateGameRequest {}

export interface IJoinGameRequest {}

export interface IMakeMoveRequest {
	row: number
	col: number
}

export interface IWebSocketMessage {
	event: string
	game_id: string
	data: any
}

export interface IPagination {
	limit: number
	offset: number
	total: number
}

export interface IPaginatedResponse<T> {
	items: T[]
	pagination: IPagination
}
