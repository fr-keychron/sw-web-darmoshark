export function Before(beforeFn: () => void) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		descriptor.value = function (...args: any[]) {
			beforeFn();
			return originalMethod.apply(this, args);
		};

		return descriptor;
	};
}

export function After(afterFn: () => void) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		descriptor.value = function (...args: any[]) {
			const result = originalMethod.apply(this, args);
			afterFn();
			return result;
		};

		return descriptor;
	};
}
