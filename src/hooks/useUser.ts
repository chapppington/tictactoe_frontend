import { useQuery } from '@tanstack/react-query'
import userService from '@/services/user.service'
import { IUser } from '@/shared/types/user.types'

export function useUser(userId: string | null | undefined) {
	const { data, isLoading } = useQuery({
		queryKey: ['user', userId],
		queryFn: () => userService.getUserById(userId!),
		enabled: !!userId,
		retry: 1
	})

	return {
		isLoading,
		user: data?.data || null
	}
}
