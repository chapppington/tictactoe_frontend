class PublicPages {
	HOME = '/'

	AUTH = '/auth'
	LOGIN = `${this.AUTH}/login`
	REGISTER = `${this.AUTH}/register`
}

export const PUBLIC_PAGES = new PublicPages()
