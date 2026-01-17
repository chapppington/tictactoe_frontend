import { AuthToken } from '@/shared/types/auth.types'
import { NextRequest } from 'next/server'
import { getNewTokensByRefresh } from './get-new-tokens-by-refresh'
import { jwtVerifyServer } from './jwt-verify'

function isTokenExpired(accessToken: string): boolean {
	try {
		const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString())
		const exp = payload.exp
		if (!exp) return true
		return Date.now() >= exp * 1000
	} catch {
		return true
	}
}

export async function getTokensFromRequest(request: NextRequest) {
	const refreshToken = request.cookies.get(AuthToken.REFRESH_TOKEN)?.value
	let accessToken = request.cookies.get(AuthToken.ACCESS_TOKEN)?.value

	if (!refreshToken) {
		request.cookies.delete(AuthToken.ACCESS_TOKEN)
		return null
	}

	if (!accessToken || (accessToken && isTokenExpired(accessToken))) {
		try {
			const data = await getNewTokensByRefresh(refreshToken)
			accessToken = data.accessToken
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === 'invalid token' || error.message === 'Failed to fetch new tokens') {
					request.cookies.delete(AuthToken.ACCESS_TOKEN)
					return null
				}
			}
			return null
		}
	} else {
		const verifiedData = await jwtVerifyServer(accessToken)
		if (!verifiedData) {
			try {
				const data = await getNewTokensByRefresh(refreshToken)
				accessToken = data.accessToken
			} catch (error) {
				if (error instanceof Error) {
					if (error.message === 'invalid token' || error.message === 'Failed to fetch new tokens') {
						request.cookies.delete(AuthToken.ACCESS_TOKEN)
						return null
					}
				}
				return null
			}
		}
	}

	return { accessToken, refreshToken }
}
