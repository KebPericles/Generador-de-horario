import type { ElementHandle, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

import { Dias, Horario, Materia } from "./libs/Materias";
import { MateriaParser } from "./libs/MateriaParser";
import { aFind } from "./libs/util/asyncLib";
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
	await rl.question("Inicia sesión y luego presiona Enter aquí.");
};

let loginGoogle = async (page: Page) => {
	// Pausa la automatización y permite que el usuario complete el inicio de sesión manualmente
	await rl.question(
		"Inicia sesión en Google Calendar y luego presiona Enter aquí."
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
			"Rellena el CAPTCHA manualmente y luego presiona Enter aquí."
		);
	};

	loginGoogle = async (page: Page) => {
		// Llena el campo de usuario
		let nextButton = await page.$("#identifierNext button");
		if (!nextButton) {
			rl.question(
				"\nERROR EN AUTORRELLENO. Inicia sesion de forma manual. Presiona ENTER despues de haber iniciado sesion."
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
			"Confirma la autenticación de doble factor y presiona ENTER para continuar."
		);
	};
}

(async () => {
	const browser = await puppeteer.launch({
		headless: false,
		executablePath:
			"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
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
	await page.goto("https://calendar.google.com/calendar/r", {
		waitUntil: "networkidle2",
	});
	await loginGoogle(page);

	// Crear eventos en Google Calendar
	let nombreCalendario: string = "";
	for (let i = 0; i < materias.length; i++) {
		let materia = materias[i];
		let eventos = MateriaParser.parseMateriaToEvento(materia);

		for (let j = 0; j < eventos.length; j++) {
			let evento = eventos[j];

			console.log(evento.urlGenerador);

			await page.goto(evento.urlGenerador);

			if (i == 0 && j == 0) {
				await rl.question(
					"Confirma el calendario en el que quieres crear los eventos. Presiona ENTER para continuar."
				);

				nombreCalendario =
					(await (
						await page.waitForSelector("#xCalOwn", { hidden: true })
					)?.evaluate((element) => element.textContent)) ?? "";
			} else {
				await page.waitForSelector("#xCalSel", { visible: true });

				let calendarioDropdown = await page.$("#xCalSel>div");
				await calendarioDropdown?.click();

				await new Promise((resolve) => setTimeout(resolve, 500));

				//* Intento de seleccionar el calendario
				//! No funciona
				/* let selectores = await page.$$("#xCalSel>div");

				let selector;

				for (let s of selectores) {
					if ((await s.evaluate((element) => element.ariaHidden)) !== "true") {
						selector = s;
					}
				}

				if(!selector) {
					console.log("No se encontró el selector.");
					await browser.close();
					process.exit(200);
				}

				let calendarios = await selector?.$$("div");

				if (!calendarios) {
					console.log("No se encontraron calendarios.");
					await browser.close();
					process.exit(200);
				}

				let calendario = await aFind(calendarios, async (calendario) => {
					let nombre = await calendario.evaluate(
						(calendario) => calendario.innerText
					);
					return nombre === nombreCalendario;
				});

				if (!calendario) {
					console.log("No se encontró el calendario.");
					await browser.close();
					process.exit(200);
				}

				console.log(
					await page.evaluate((calendario) => calendario.innerHTML, calendario)
				);

				console.log(
					await page.evaluate((calendario) => calendario.outerHTML, calendario)
				);

				//TODO Click en el calendario
				let { left, right, top, bottom } = await page.evaluate(
					(selector) => selector.getBoundingClientRect(),
					selector
				);

				let width = right - left;
				let height = bottom - top;

				console.log(left, right, bottom, top);

				left += width / 2;
				right += height / 2;
				left = Math.round(left);
				right = Math.round(right);

				console.log(left, right);

				await page.mouse.click(left, right); */

				await rl.question(
					"Confirma el calendario en el que quieres crear los eventos. Presiona ENTER para continuar."
				);
			}

			await page.waitForSelector("#xSaveBu", { visible: true });
			await page.click("#xSaveBu");

			await page.waitForSelector("#gb", { visible: true });

			await new Promise((resolve) => setTimeout(resolve, 1500));
		}
	}

	// FINALIZAR
	await rl.question("Finaliza el proceso con ENTER.");

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
