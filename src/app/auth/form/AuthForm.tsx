'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { twMerge } from 'tailwind-merge'
import styles from './AuthForm.module.scss'
import { AuthToggle } from './AuthToggle'
import { useAuthForm } from './useAuthForm'

interface Props {
	isLogin: boolean
}

export function AuthForm({ isLogin }: Props) {
	const { handleSubmit, isLoading, registerLogin, registerRegister } = useAuthForm(isLogin)

	const emailProps = isLogin 
		? registerLogin('email', { required: true })
		: registerRegister('email', { required: true })
	
	const passwordProps = isLogin
		? registerLogin('password', { required: true })
		: registerRegister('password', { required: true })

	return (
		<form
			onSubmit={handleSubmit}
			className="max-w-sm mx-auto"
		>
			{!isLogin && (
				<div className="mb-4">
					<label className="text-gray-600">
						Name
						<input
							type="text"
							placeholder="Enter name: "
							{...registerRegister('name', { required: true })}
							className={styles['input-field']}
						/>
					</label>
				</div>
			)}

			<div className="mb-4">
				<label className="text-gray-600">
					Email
					<input
						type="email"
						placeholder="Enter email: "
						{...emailProps}
						className={styles['input-field']}
					/>
				</label>
			</div>

			<div className="mb-6">
				<label className="text-gray-600">
					Password
					<input
						type="password"
						placeholder="Enter password: "
						{...passwordProps}
						className={styles['input-field']}
					/>
				</label>
			</div>

			<div className="mb-3">
				<button
					type="submit"
					className={twMerge(
						styles['btn-primary'],
						isLogin ? 'bg-blue-500' : 'bg-green-500',
						isLoading && 'opacity-75 cursor-not-allowed'
					)}
					disabled={isLoading}
				>
					{isLoading ? <MiniLoader /> : isLogin ? 'Sign In' : 'Sign Up'}
				</button>
			</div>

			<AuthToggle isLogin={isLogin} />
		</form>
	)
}
