import { instance } from '@/api/axios'
import { IUser } from '@/shared/types/user.types'

interface ApiResponse<T> {
	data: T
	meta?: Record<string, unknown>
	errors?: unknown[]
}

class UserService {
	private _BASE_URL = '/users'

	async fetchProfile() {
		const response = await instance.get<ApiResponse<IUser>>(
			`${this._BASE_URL}/me`
		)
		return { data: response.data.data }
	}

	async getUserById(userId: string) {
		const response = await instance.get<ApiResponse<IUser>>(
			`${this._BASE_URL}/${userId}`
		)
		return { data: response.data.data }
	}
}

export default new UserService()
