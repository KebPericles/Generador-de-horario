import type { ElementHandle, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

import { Dias, Horario, Materia } from "./libs/Materias";
import { MateriaParser } from "./libs/MateriaParser";
const readline = require("readline/promises");
require("dotenv").config();

type DATOS_MATERIA = "Grupo" | "Materia" | "Profesores" | "Horario";

const SELECTOR_GENERATOR = (i: number, dato: DATOS_MATERIA) => {
	if (dato !== "Horario") {
		return `#ctl00_mainCopy_GV_Horario_ctl0${i}_Lbl_${dato}`;
	}

	let ids = [];

	for (let dia = 0; dia < 5; dia++) {
		ids.push(`#ctl00_mainCopy_GV_Horario_ctl0${i}_Lbl_${Dias[dia]}`);
	}

	return ids;
};

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

let form = async (page: Page) => {
	// Pausa la automatización y permite que el usuario complete el inicio de sesión manualmente
	await rl.question("\n|------>\n|SAES-1. Inicia sesión y luego presiona Enter aquí.");
};

let loginGoogle = async (page: Page) => {
	await page.goto("https://accounts.google.com/Login", {
		waitUntil: "networkidle2",
	});
	// Llena el campo de usuario
	let nextButton = await page.$("#identifierNext button");
	if (!nextButton) {
		rl.question(
			"\n|------>\nERROR EN AUTORRELLENO.\n\n|------>\n|SAES-1. Inicia sesion de forma manual. Presiona ENTER despues de haber iniciado sesion."
		);
		return;
	}

	await page.type("#identifierId", process.env.GOOGLE_EMAIL as string); // Lee BOLETA desde .env
	await nextButton.click();

	await new Promise((resolve) => setTimeout(resolve, 2000));

	await page.waitForSelector("#password input", { visible: true });
	await page.type("#password input", process.env.GOOGLE_PASSWORD as string); // Lee PASSWORD desde .env
	await page.waitForSelector("#passwordNext button", { visible: true });
	await page.click("#passwordNext button");

	// Pausa la automatización y permite que el usuario complete el inicio de sesión manualmente
	await rl.question(
		"\n|------>\n|GOOGLE-3. Confirma la autenticación de doble factor y presiona ENTER para continuar."
	);
};

if (
	process.env.BOLETA &&
	process.env.PASSWORD &&
	process.env.GOOGLE_EMAIL &&
	process.env.GOOGLE_PASSWORD
) {
	console.log("Se encontraron las variables de entorno USERNAME y PASSWORD.");
	form = async (page: Page) => {
		// Llena el campo de usuario
		await page.type(
			"#ctl00_leftColumn_LoginUser_UserName",
			process.env.BOLETA as string
		); // Lee BOLETA desde .env

		// Llena el campo de contraseña
		await page.type(
			"#ctl00_leftColumn_LoginUser_Password",
			process.env.PASSWORD as string
		); // Lee PASSWORD desde .env
		// Pausa la automatización y permite que el usuario complete el inicio de sesión manualmente
		await rl.question(
			"\n|------>\n|SAES-1. Rellena el CAPTCHA manualmente y luego presiona Enter aquí."
		);
	};

}

(async () => {
	const browser = await puppeteer.launch({
		headless: false,
	});
	const page = await browser.newPage();

	// Navega a la página donde se requiere el inicio de sesión manual
	await page.goto("https://www.saes.upiita.ipn.mx/");

	await form(page);

	await page.goto(
		"https://www.saes.upiita.ipn.mx/Alumnos/Informacion_semestral/Horario_Alumno.aspx",
		{ waitUntil: "networkidle2" }
	);

	const tableSelector = "#ctl00_mainCopy_GV_Horario";
	const tableElement = await page.$(tableSelector);

	let materias: Materia[] = [];

	if (!tableElement) {
		console.log("No se encontró la tabla.");
		await browser.close();
		process.exit(200);
	}

	// Extraer las materias de la tabla
	let rows = await tableElement.$$("tr");

	for (let i = 0; i < rows.length; i++) {
		if (i == 0) {
			continue;
		}
		let materia = await parseMateriaFromRow(rows[i], i + 1);
		materias.push(materia);
	}

	// Iniciar sesion en Google Calendar
	await loginGoogle(page);

	// Crear eventos en Google Calendar
	await page.goto("https://calendar.google.com/calendar/r", {
		waitUntil: "networkidle2",
	});
	await rl.question(
		"\n|------>\n|GOOGLE-5. Selecciona el calendario en el que quieres crear los eventos, unicamente debe estar activo el calendario en el que quieres poner tú horario. Presiona ENTER para continuar."
	);

	for (let i = 0; i < materias.length; i++) {
		let materia = materias[i];
		let eventos = MateriaParser.parseMateriaToEvento(materia);

		for (let j = 0; j < eventos.length; j++) {
			let evento = eventos[j];

			console.log(evento.urlGenerador);

			await page.goto(evento.urlGenerador);

			await page.waitForSelector("#xSaveBu", { visible: true });
			await page.click("#xSaveBu");

			await page.waitForSelector("#gb", { visible: true });

			await new Promise((resolve) => setTimeout(resolve, 1500));
		}
	}

	// FINALIZAR
	await rl.question("\n|------>\n|GOOGLE-7. Finaliza el proceso con ENTER.");

	await browser.close();
	process.exit(0);
})();

async function parseMateriaFromRow(
	row: ElementHandle<HTMLTableRowElement>,
	i: number
) {
	let materia = new Materia();
	const campos: DATOS_MATERIA[] = ["Grupo", "Materia", "Profesores", "Horario"];

	for (const campo of campos) {
		let selectorGenerado = SELECTOR_GENERATOR(i, campo);
		if (selectorGenerado instanceof Array) {
			let horarios: Horario[] = [];
			for (let dia = 0; dia < selectorGenerado.length; dia++) {
				let selectorDia = selectorGenerado[dia];
				let campoDia = await row.$(selectorDia);
				let value = await campoDia?.evaluate(
					(campoDia) => campoDia.textContent
				);

				if (!value) {
					continue;
				}

				horarios.push({
					dia: dia,
					horaInicio: value?.split(" - ")[0].trim(),
					horaFin: value?.split(" - ")[1].trim(),
				});
			}

			materia.horarios = horarios;
			continue;
		}

		let campoElement = await row.$(selectorGenerado);
		let value = await campoElement?.evaluate(
			(campoElement) => campoElement.textContent
		);
		console.log(`Campo: ${campo} - Valor: ${value}`);
		switch (campo) {
			case "Grupo":
				materia.grupo = value as string;
				break;
			case "Materia":
				materia.nombre = value?.split(" - ")[1].trim() as string;
				break;
			case "Profesores":
				materia.profesor = value?.trim() as string;
				break;
		}
	}

	console.log(materia);
	return materia;
}
