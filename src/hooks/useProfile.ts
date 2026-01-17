import authService from '@/services/auth/auth.service'
import userService from '@/services/user.service'
import { useQuery } from '@tanstack/react-query'

export function useProfile() {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ['profile'],
		queryFn: () => userService.fetchProfile(),
		refetchInterval: 1800000 // 30 minutes
	})

	const profile = data?.data

	return {
		isLoading,
		refetch,
		user: profile || null
	}
}
