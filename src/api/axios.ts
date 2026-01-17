import { API_URL } from '@/constants'
import authTokenService from '@/services/auth/auth-token.service'
import authService from '@/services/auth/auth.service'
import axios, { CreateAxiosDefaults } from 'axios'
import { errorCatch, getContentType } from './api.helper'

const axiosOptions: CreateAxiosDefaults = {
	baseURL: API_URL,
	headers: getContentType(),
	withCredentials: true
}

export const axiosClassic = axios.create(axiosOptions)

export const instance = axios.create(axiosOptions)

instance.interceptors.request.use(config => {
	const accessToken = authTokenService.getAccessToken()

	if (config?.headers && accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`
	}

	return config
})

instance.interceptors.response.use(
	config => config,
	async error => {
		const originalRequest = error.config

		if (
			error.response?.status === 401 &&
			error.config &&
			!error.config._isRetry
		) {
			originalRequest._isRetry = true

			try {
				await authService.refreshToken()
				return instance.request(originalRequest)
			} catch (refreshError) {
				const errorType = errorCatch(refreshError, 'type')
				if (
					errorType === 'MissingTokenError' ||
					errorType === 'JWTDecodeError'
				) {
					authTokenService.removeAccessToken()
					authTokenService.removeRefreshToken()
				}
				throw refreshError
			}
		}

		throw error
	}
)
