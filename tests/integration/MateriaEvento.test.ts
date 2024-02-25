import { expect } from "chai";
import { MateriaParser } from "../../libs/MateriaParser";
import { Dias, Materia } from "../../libs/Materias";

let materia = new Materia({
	nombre: "Fundamentos de Programación",
	grupo: "1CM1",
	profesor: "Juan Perez",
	horarios: [
		{
			dia: Dias.Lunes,
			horaInicio: "10:00",
			horaFin: "12:00",
		},
		{
			dia: Dias.Miercoles,
			horaInicio: "10:00",
			horaFin: "12:00",
		},
	],
});

console.log(materia);

let eventos = MateriaParser.parseMateriaToEvento(materia);

describe("MateriaEvento", () => {
	it("Parse materia to evento", () => {
		expect(eventos).to.have.lengthOf(2);
	});
});