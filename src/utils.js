export function deepCopy(obj) {
	return Object.keys(obj).reduce(
		(v, d) =>
			Object.assign(v, {
				[d]: obj[d] != null && obj[d].constructor === Object ? deepCopy(obj[d]) : obj[d],
			}),
		{}
	)
}
