'use client'

import { PUBLIC_PAGES } from '@/config/pages/public.config'
import authService from '@/services/auth/auth.service'
import {
	ILoginFormData,
	IRegisterFormData
} from '@/shared/types/auth.types'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export function useAuthForm(isLogin: boolean) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const loginForm = useForm<ILoginFormData>()
	const registerForm = useForm<IRegisterFormData>()

	const { mutate: mutateLogin, isPending: isLoginPending } = useMutation({
		mutationKey: ['login'],
		mutationFn: (data: ILoginFormData) => authService.login(data),
		onSuccess() {
			startTransition(() => {
				loginForm.reset()
				toast.success('Успешный вход!')
				router.push(PUBLIC_PAGES.HOME)
			})
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.errors?.[0]?.message ||
					error.response?.data?.message ||
					'Ошибка при входе'
				toast.error(errorMessage)
			}
		}
	})

	const { mutate: mutateRegister, isPending: isRegisterPending } =
		useMutation({
			mutationKey: ['register'],
			mutationFn: (data: IRegisterFormData) =>
				authService.register(data),
			onSuccess() {
				startTransition(() => {
					registerForm.reset()
					toast.success('Регистрация успешна!')
					router.push(PUBLIC_PAGES.HOME)
				})
			},
			onError(error) {
				if (axios.isAxiosError(error)) {
					const errorMessage =
						error.response?.data?.errors?.[0]?.message ||
						error.response?.data?.message ||
						'Ошибка при регистрации'
					toast.error(errorMessage)
				}
			}
		})

	const onSubmitLogin: SubmitHandler<ILoginFormData> = data => {
		mutateLogin(data)
	}

	const onSubmitRegister: SubmitHandler<IRegisterFormData> = data => {
		mutateRegister(data)
	}

	const isLoading = isPending || isLoginPending || isRegisterPending

	return {
		registerLogin: loginForm.register,
		registerRegister: registerForm.register,
		handleSubmit: isLogin
			? loginForm.handleSubmit(onSubmitLogin)
			: registerForm.handleSubmit(onSubmitRegister),
		isLoading
	}
}
