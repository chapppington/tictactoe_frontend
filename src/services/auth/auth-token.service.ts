import { AuthToken } from '@/shared/types/auth.types'
import Cookies from 'js-cookie'

class AuthTokenService {
	getAccessToken() {
		const accessToken = Cookies.get(AuthToken.ACCESS_TOKEN)
		return accessToken || null
	}

	getRefreshToken() {
		const refreshToken = Cookies.get(AuthToken.REFRESH_TOKEN)
		return refreshToken || null
	}

	saveAccessToken(accessToken: string) {
		Cookies.set(AuthToken.ACCESS_TOKEN, accessToken, {
			sameSite: 'lax',
			expires: 1,
			path: '/'
		})
	}

	saveRefreshToken(refreshToken: string) {
		Cookies.set(AuthToken.REFRESH_TOKEN, refreshToken, {
			sameSite: 'lax',
			expires: 7,
			path: '/'
		})
	}

	removeAccessToken() {
		Cookies.remove(AuthToken.ACCESS_TOKEN, { path: '/' })
		Cookies.remove(AuthToken.ACCESS_TOKEN)
	}

	removeRefreshToken() {
		Cookies.remove(AuthToken.REFRESH_TOKEN, { path: '/' })
		Cookies.remove(AuthToken.REFRESH_TOKEN)
	}
}

export default new AuthTokenService()
