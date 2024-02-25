import { expect } from "chai";

import { Dias, Materia } from "../../libs/Materias";
import { MateriaParser } from "../../libs/MateriaParser";

describe("Materias", () => {
	it("Abreviacion de materia", () => {
		const materia = new Materia();
		expect(materia.abreviacionNombre).to.equal("");

		materia.nombre = "Fundamentos de Programación";
		expect(materia.abreviacionNombre).to.equal("FP");

		materia.nombre = "Administración de Proyectos de Software";
		expect(materia.abreviacionNombre).to.equal("APS");

		materia.nombre = "Taller de Ética";
		expect(materia.abreviacionNombre).to.equal("TE");
	});

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

		materia.profesor = "Juan Perez";
		materia.nombre = "Administración de Proyectos de Software";
		materia.grupo = "1CM2";
		expect(MateriaParser.descripcionEvento(materia)).to.equal(
			"Profesor: Juan Perez\nMateria: Administración de Proyectos de Software\nGrupo: 1CM2\n"
		);

		materia.profesor = "Juan Perez";
		materia.nombre = "Taller de Ética";
		materia.grupo = "1CM3";
		expect(MateriaParser.descripcionEvento(materia)).to.equal(
			"Profesor: Juan Perez\nMateria: Taller de Ética\nGrupo: 1CM3\n"
		);
	});

	it("Horarios de materia", () => {
		const materia = new Materia();
		expect(materia.horarios).to.be.empty;

		materia.horarios = [
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
		];

		expect(materia.horarios).to.have.lengthOf(2);
		expect(materia.horarios[0].dia).to.equal(Dias.Lunes);
		expect(materia.horarios[0].horaInicio).to.equal("10:00");
		expect(materia.horarios[0].horaFin).to.equal("12:00");
		expect(materia.horarios[1].dia).to.equal(Dias.Miercoles);
		expect(materia.horarios[1].horaInicio).to.equal("10:00");
		expect(materia.horarios[1].horaFin).to.equal("12:00");
	});
});