export const AuthToken = {
	ACCESS_TOKEN: 'access_token',
	REFRESH_TOKEN: 'refresh_token'
} as const

export type AuthToken = (typeof AuthToken)[keyof typeof AuthToken]

export const UserRole = {
	USER: 'USER'
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface ITokenInside {
	sub: string
	iat: number
	exp: number
}

export type TProtectUserData = Omit<ITokenInside, 'iat' | 'exp'>

export interface ILoginFormData {
	email: string
	password: string
}

export interface IRegisterFormData {
	email: string
	password: string
	name: string
}
