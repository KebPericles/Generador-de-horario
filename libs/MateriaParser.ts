import { RRule } from "rrule";
import { GEvent } from "./GCalendar/gcalendar";
import { Dias, Materia } from "./Materias";
import { formatDate, parseDate } from "./util/dateUtils";

export type FechasInicioType = { Lunes: string, Martes: string, Miercoles: string, Jueves: string, Viernes: string };

export class MateriaParser {
	static fechaInicio: string = "";
	private static _fechasInicio: FechasInicioType = { Lunes: "", Martes: "", Miercoles: "", Jueves: "", Viernes: "" };

	private static asignadores = (() => {
		let asignadores = [];

		let voidFunction = () => { };

		asignadores.push(voidFunction);

		for (let i = 0; i < 5; i++) {

			asignadores.push((fecha: string) => {
				this._fechasInicio[Dias[i] as "Lunes" | "Martes" | "Miercoles" | "Jueves" | "Viernes"] = fecha;
			});
		}

		asignadores.push(voidFunction);

		return asignadores;
	})();

	private static fechasJsonToArray() {
		if (!this._fechasInicio) {
			throw Error("No hay fechas D:");
		}
		let fechasInicio: string[] = [];

		fechasInicio.push(this._fechasInicio.Lunes);
		fechasInicio.push(this._fechasInicio.Martes);
		fechasInicio.push(this._fechasInicio.Miercoles);
		fechasInicio.push(this._fechasInicio.Jueves);
		fechasInicio.push(this._fechasInicio.Viernes);

		return fechasInicio;
	}

	static get fechasInicio() {
		if (this._fechasInicio.Lunes !== "") {
			return this.fechasJsonToArray();
		}

		// Se calcula la fecha de inicio de cada dia de la semana
		this._fechasInicio = { Lunes: "", Martes: "", Miercoles: "", Jueves: "", Viernes: "" };
		if (!this.fechaInicio) {
			this.fechaInicio = formatDate(new Date());
		}

		let fecha = parseDate(this.fechaInicio);
		let diaSemana = fecha.getDay();

		for (let i = 0; i < 7; i++) {
			this.asignadores[diaSemana](formatDate(fecha));

			fecha.setDate(fecha.getDate() + 1);
			diaSemana = fecha.getDay();
		}

		return this.fechasJsonToArray();
	}

	private static vaciarFechasInicio() {
		this._fechasInicio = { Lunes: "", Martes: "", Miercoles: "", Jueves: "", Viernes: "" };
	}

	static set fechasInicio(fechasInicio: string[]) {
		this.vaciarFechasInicio();

		if (fechasInicio.length === 0) {
			return;
		}
		if (fechasInicio.length !== 5) {
			throw Error("Se deben de proporcionar 5 fechas");
		}

		for (let i = 1; i < 6; i++) {
			this.asignadores[i](fechasInicio[i]);
		}
	}

	static tituloEvento = (materia: Materia) => {
		if (!materia.abreviacionNombre || !materia.grupo) {
			return "";
		}
		return `${materia.abreviacionNombre} - ${materia.grupo}`;
	};

	static descripcionEvento = (materia: Materia) => {
		let descripcion = "";
		if (materia.profesor) {
			descripcion += `Profesor: ${materia.profesor}\n`;
		}
		if (materia.nombre) {
			descripcion += `Materia: ${materia.nombre}\n`;
		}
		if (materia.grupo) {
			descripcion += `Grupo: ${materia.grupo}\n`;
		}

		return descripcion;
	};

	static parseHora(hora: string) {
		let [horaInicio, minutoInicio] = hora.split(":");

		return `${horaInicio}${minutoInicio}00`;
	}

	static parseMateriaToEvento(materia: Materia) {
		let gevents: GEvent[] = [];

		for (const horario of materia.horarios) {
			let gevent = new GEvent();
			gevent.text = MateriaParser.tituloEvento(materia);
			//TODO: Calcular fecha de inicio y fin
			gevent.dates = [
				`${MateriaParser.fechasInicio[horario.dia]}T${this.parseHora(
					horario.horaInicio
				)}`,
				`${MateriaParser.fechasInicio[horario.dia]}T${this.parseHora(
					horario.horaFin
				)}`,
			];

			gevent.details = MateriaParser.descripcionEvento(materia);
			gevent.recur = new RRule({
				freq: RRule.WEEKLY,
				count: 21,
			});

			gevents.push(gevent);
		}

		return gevents;
	}
}
