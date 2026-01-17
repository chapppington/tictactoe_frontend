class DashboardPages {
	HOME = '/dashboard'
	PROFILE = `${this.HOME}/profile`
	LOBBY = '/lobby'
	GAME = (id: string) => `/game/${id}`
}

export const DASHBOARD_PAGES = new DashboardPages()
