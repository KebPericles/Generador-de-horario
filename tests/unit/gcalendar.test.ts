import { expect } from "chai";
import { GEvent } from "../../libs/GCalendar/gcalendar";
import { Frequency, RRule } from "rrule";

describe("Google Calendar", () => {
	let evento = new GEvent();

	it("Titulo de evento", () => {
		expect(evento.text).to.equal("");
		evento.text = "Fundamentos de Programación";
		expect(evento.text).to.equal("Fundamentos de Programación");
	});

	it("Fechas de evento", () => {
		expect(evento.dates).to.have.lengthOf(2);
		evento.dates = ["20210823T080000", "20210823T100000"];
		expect(evento.dates).to.have.lengthOf(2);
	});

	it("Zona horaria", () => {
		expect(evento.ctz).to.equal("America/Mexico_City");
		evento.ctz = "America/Monterrey";
		expect(evento.ctz).to.equal("America/Monterrey");
	});

	it("Detalles", () => {
		expect(evento.details).to.equal("");
		evento.details = "Fundamentos de Programación";
		expect(evento.details).to.equal("Fundamentos de Programación");
	});

	it("Ubicación", () => {
		expect(evento.location).to.equal("");
		evento.location = "Aula 1";
		expect(evento.location).to.equal("Aula 1");
	});

	it("CRM", () => {
		expect(evento.crm).to.equal("BUSY");
		evento.crm = "AVAILABLE";
		expect(evento.crm).to.equal("AVAILABLE");
	});

	it("Recurrencia", () => {
		expect(evento.recur).to.be.an.instanceOf(RRule);
		evento.recur = new RRule({
			freq: Frequency.WEEKLY,
			interval: 2,
			count: 10,
		});

		expect(evento.recur.options).to.have.property("freq");
		expect(evento.recur.options).to.have.property("interval");
		expect(evento.recur.options).to.have.property("count");
	});

	it("Evento completo", () => {
		expect(evento).to.have.property("text");
		expect(evento).to.have.property("dates");
		expect(evento).to.have.property("ctz");
		expect(evento).to.have.property("details");
		expect(evento).to.have.property("location");
		expect(evento).to.have.property("crm");
		expect(evento).to.have.property("recur");
	});

	it("URL Evento", () => {
		let evento = new GEvent({
			text: "Fundamentos de Programación",
			dates: ["20210823T080000", "20210823T100000"],
			ctz: "America/Monterrey",
			details: "Fundamentos de Programación\nGrupo: 1CM1",
			location: "Aula 1",
			crm: "AVAILABLE",
			recur: new RRule({
				freq: Frequency.WEEKLY,
				interval: 2,
				count: 10,
			}),
		});

		expect(evento).to.have.property("text");
		expect(evento).to.have.property("dates");
		expect(evento).to.have.property("ctz");
		expect(evento).to.have.property("details");
		expect(evento).to.have.property("location");
		expect(evento).to.have.property("crm");
		expect(evento).to.have.property("recur");

		expect(evento.urlGenerador).to.equal(
			"https://calendar.google.com/calendar/render?action=TEMPLATE&text=Fundamentos%20de%20Programaci%C3%B3n&dates=20210823T080000/20210823T100000&ctz=America/Monterrey&details=Fundamentos%20de%20Programaci%C3%B3n%0AGrupo:%201CM1&location=Aula%201&crm=AVAILABLE&recur=RRULE:FREQ=WEEKLY;INTERVAL=2;COUNT=10"
		);
	});
});