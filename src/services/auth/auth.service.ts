import { axiosClassic } from '@/api/axios'
import {
	ILoginFormData,
	IRegisterFormData
} from '@/shared/types/auth.types'
import { IUser } from '@/shared/types/user.types'
import authTokenService from './auth-token.service'

interface ApiResponse<T> {
	data: T
	meta?: Record<string, unknown>
	errors?: unknown[]
}

interface TokenResponse {
	access_token: string
	refresh_token: string
}

interface RefreshTokenResponse {
	access_token: string
}

class AuthService {
	async login(data: ILoginFormData) {
		const response = await axiosClassic.post<
			ApiResponse<TokenResponse>
		>('/auth/login', data)

		const tokens = response.data.data

		if (tokens.access_token && tokens.refresh_token) {
			authTokenService.saveAccessToken(tokens.access_token)
			authTokenService.saveRefreshToken(tokens.refresh_token)
		}

		return tokens
	}

	async register(data: IRegisterFormData) {
		const response = await axiosClassic.post<ApiResponse<IUser>>(
			'/auth/register',
			data
		)

		return response.data.data
	}

	async refreshToken() {
		const response = await axiosClassic.post<
			ApiResponse<RefreshTokenResponse>
		>('/auth/token/refresh')

		const tokenData = response.data.data

		if (tokenData.access_token) {
			authTokenService.saveAccessToken(tokenData.access_token)
		}

		return tokenData
	}

	async logout() {
		authTokenService.removeAccessToken()
		authTokenService.removeRefreshToken()
	}
}

export default new AuthService()
