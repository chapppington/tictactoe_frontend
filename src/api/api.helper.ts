export const getContentType = () => ({
	'Content-Type': 'application/json'
})

export const errorCatch = (error: any, field: 'message' | 'type' = 'message'): string => {
	const errors = error?.response?.data?.errors

	if (errors && Array.isArray(errors) && errors.length > 0) {
		return errors[0][field] || errors[0].message || 'Unknown error'
	}

	return error?.message || 'Unknown error'
}
