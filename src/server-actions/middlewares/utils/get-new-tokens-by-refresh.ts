'use server'

import { API_URL } from '@/constants'

interface ApiResponse<T> {
	data: T
	meta?: Record<string, unknown>
	errors?: unknown[]
}

interface RefreshTokenResponse {
	access_token: string
}

export async function getNewTokensByRefresh(refreshToken: string) {
	const response = await fetch(`${API_URL}/auth/token/refresh`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Cookie: `refresh_token=${refreshToken}`
		},
		credentials: 'include'
	})

	if (!response.ok) {
		throw new Error('Failed to fetch new tokens')
	}

	const data: ApiResponse<RefreshTokenResponse> = await response.json()
	return { accessToken: data.data.access_token }
}
