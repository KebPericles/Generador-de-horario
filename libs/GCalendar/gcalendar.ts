import { RRule } from "rrule";
import { Browser } from "puppeteer";
import { GEventOptions } from "./types";
import { addLeadingZero } from "../util/dateUtils";

class GCalendar {
	private _browser: Browser;
	private static _URL_EVENTO =
		"https://calendar.google.com/calendar/render?action=TEMPLATE&text=Birthday&dates=20201231T193000Z/20201231T223000Z&details=With%20clowns%20and%20stuff&location=North%20Pole";

	constructor(browser: Browser) {
		this._browser = browser;
	}
}

function validarFecha(fecha: string) {
	const regex = new RegExp("^[0-9]{8}T[0-9]{6}$");
	const regex2 = new RegExp("^[0-9]{8}$");
	if (!regex.test(fecha) && !regex2.test(fecha)) {
		throw new Error(
			`El formato de fecha es incorrecto, se esperaba YYYYMMDDTHHMMSS o YYYYMMDD, se recibió ${fecha}`
		);
	}
}

export type CRMOption = "AVAILABLE" | "BUSY" | "BLOCKING";

class GEventDefaults {
	static CTZ = "America/Mexico_City";
	static CRM: CRMOption = "BUSY";
	static RECUR = new RRule();
	static DETAILS = "";
	static LOCATION = "";

	static dates() {
		let today = new Date();

		let year = today.getFullYear();
		let month = addLeadingZero(today.getMonth() + 1);
		let day = addLeadingZero(today.getDate());

		let hour = addLeadingZero(today.getHours());
		let minute = addLeadingZero(today.getMinutes());
		let second = addLeadingZero(today.getSeconds());

		let hourEnd = addLeadingZero(today.getHours() + 1);

		let fechaInicio = `${year}${month}${day}T${hour}${minute}${second}`;
		let fechaFin = `${year}${month}${day}T${hourEnd}${minute}${second}`;

		return [fechaInicio, fechaFin];
	}
}

export class GEvent {
	/**
	 * Título del evento
	 */
	text: string;

	private _dates!: string[];

	/**
	 * Zona horaria del evento
	 * @default 'America/Mexico_City'
	 * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
	 */
	ctz: string = "America/Mexico_City";

	/**
	 * Descripción del evento
	 */
	details!: string;

	/**
	 * Ubicación del evento (opcional)
	 */
	location!: string;

	crm: CRMOption = "BUSY";

	private _recur!: RRule;

	constructor({
		text,
		dates,
		ctz,
		details,
		location,
		crm,
		recur,
	}: Partial<GEventOptions> = {}) {
		this.text = text ?? "";
		this.dates = dates ?? GEventDefaults.dates();
		this.ctz = ctz ?? GEventDefaults.CTZ;
		this.details = details ?? GEventDefaults.DETAILS;
		this.location = location ?? GEventDefaults.LOCATION;
		this.crm = crm ?? GEventDefaults.CRM;
		this.recur = recur ?? GEventDefaults.RECUR;
	}

	set dates(dates: string[]) {
		if (dates.length != 2) {
			throw new Error("El arreglo de fechas debe tener 3 elementos");
		}

		validarFecha(dates[0]);
		validarFecha(dates[1]);

		this._dates = dates;
	}

	/**
	 * Arreglo con las fechas de inicio y fin del evento en formato YYYYMMDDTHHMMSS o YYYYMMDD
	 * @example ['20201231T193000', '20201231T223000']
	 */
	get dates() {
		return this._dates;
	}

	set recur(recur: RRule) {
		this._recur = recur;
	}

	get recur() {
		return this._recur;
	}

	private _recurToString() {
		return this._recur.toString();
	}

	get urlGenerador() {
		let TEMPLATE_URL =
			"https://calendar.google.com/calendar/render?action=TEMPLATE";
		TEMPLATE_URL += `&text=${this.text}`;
		TEMPLATE_URL += `&dates=${this.dates[0]}/${this.dates[1]}`;
		TEMPLATE_URL += `&ctz=${this.ctz}`;
		TEMPLATE_URL += `&details=${this.details}`;
		TEMPLATE_URL += `&location=${this.location}`;
		TEMPLATE_URL += `&crm=${this.crm}`;
		TEMPLATE_URL += `&recur=${this._recurToString()}`;

		return encodeURI(TEMPLATE_URL);
	}
}
