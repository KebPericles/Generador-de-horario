export const addLeadingZero = (number: number) => {
	return number.toString().padStart(2, "0");
};

/**
 * Obtiene la fecha actual en formato YYYYMMDD
 * @returns Fecha actual en formato YYYYMMDD
 * @example 20201231
 */
export const formatDate = (date: Date) => {
	const year = date.getFullYear();
	const month = addLeadingZero(date.getMonth() + 1);
	const day = addLeadingZero(date.getDate());
	return `${year}${month}${day}`;
};

export const parseDate = (date: string) => {
	const year = date.slice(0, 4);
	const month = date.slice(4, 6);
	const day = date.slice(6, 8);

	// Se agrega un segundo para que el evento se cree en el dia correcto
	return new Date(`${year}-${month}-${day} 00:00:01`);
}