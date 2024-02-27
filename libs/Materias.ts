export enum Dias {
	Lunes,
	Martes,
	Miercoles,
	Jueves,
	Viernes,
}

export type Horario = {
	dia: Dias;
	horaInicio: string;
	horaFin: string;
};

function eliminarDiacriticos(texto: string) {
	return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export type MateriaOptions = {
	nombre: string;
	grupo: string;
	profesor: string;
	horarios: Horario[];
};

export class Materia {
	private _abreviacionNombre: string = "";
	private _nombre: string = "";
	grupo: string = "";
	profesor: string = "";
	horarios: Horario[] = [];

	constructor(options?: MateriaOptions) {
		if (options) {
			this.nombre = options.nombre ?? "";
			this.grupo = options.grupo ?? "";
			this.profesor = options.profesor ?? "";
			this.horarios = options.horarios ?? [];
		}
	}

	get nombre() {
		return this._nombre;
	}

	set nombre(nombre: string) {
		this._nombre = nombre;
		this._abreviacionNombre = "";
	}

	get abreviacionNombre() {
		if (this._abreviacionNombre !== "") {
			return this._abreviacionNombre;
		}

		if (!this._nombre) {
			return "";
		}
		let abreviacion = "";
		let palabras = this._nombre.split(" ");

		const filtro = [
			"de",
			"los",
			"las",
			"la",
			"el",
			"y",
			"a",
			"con",
			"en",
			"del",
			"para",
			"por",
			"al",
			"lo",
			"un",
			"una",
			"unos",
			"unas",
			"o",
			"e",
			"ante",
			"bajo",
			"cabe",
			"contra",
			"de",
			"desde",
			"durante",
			"en",
			"entre",
			"hacia",
			"hasta",
			"mediante",
			"para",
			"por",
			"según",
			"sin",
			"so",
			"sobre",
			"tras",
			"versus",
			"vía",
		];

		palabras = palabras.filter((palabra) => !filtro.includes(palabra.toLowerCase()));

		for (const element of palabras) {
			abreviacion += element[0];
		}

		this._abreviacionNombre = abreviacion.toUpperCase();

		this._abreviacionNombre = eliminarDiacriticos(this._abreviacionNombre);

		return this._abreviacionNombre;
	}
}

