import { expect } from "chai";

import { Dias, Materia } from "../../libs/Materias";
import { MateriaParser } from "../../libs/MateriaParser";
import { addLeadingZero, formatDate } from "../../libs/util/dateUtils";

describe("MateriaParser", () => {

	it("Titulo de evento", () => {
		const materia = new Materia();
		expect(MateriaParser.tituloEvento(materia)).to.equal("");

		materia.nombre = "Fundamentos de Programación";
		materia.grupo = "1CM1";
		expect(MateriaParser.tituloEvento(materia)).to.equal("FP - 1CM1");

		materia.nombre = "Administración de Proyectos de Software";
		materia.grupo = "1CM2";
		expect(MateriaParser.tituloEvento(materia)).to.equal("APS - 1CM2");

		materia.nombre = "Taller de Ética";
		materia.grupo = "1CM3";
		expect(MateriaParser.tituloEvento(materia)).to.equal("TE - 1CM3");
	});

	it("Descripcion de evento", () => {
		const materia = new Materia();
		expect(MateriaParser.descripcionEvento(materia)).to.equal("");

		materia.profesor = "Juan Perez";
		materia.nombre = "Fundamentos de Programación";
		materia.grupo = "1CM1";
		expect(MateriaParser.descripcionEvento(materia)).to.equal(
			"Profesor: Juan Perez\nMateria: Fundamentos de Programación\nGrupo: 1CM1\n"
		);
	});

	it("Fechas de inicio", () => {
		expect(MateriaParser.fechasInicio).to.have.lengthOf(5);

		let today = new Date();
		while(today.getDay() !== 1) {
			today.setDate(today.getDate() + 1);
		}
		expect(MateriaParser.fechasInicio[0]).to.equal(formatDate(today));

		MateriaParser.fechasInicio = [];
		MateriaParser.fechaInicio = "20201231";

		expect(MateriaParser.fechasInicio).to.have.lengthOf(5);
		expect(MateriaParser.fechasInicio[0]).to.equal("20210104");
	});
});
