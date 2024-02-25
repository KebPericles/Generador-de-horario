import { RRule } from "rrule";

export interface GEventOptions {
	text: string;
	dates: string[];
	ctz: string;
	details: string;
	location: string;
	crm: "AVAILABLE" | "BUSY" | "BLOCKING";
	recur: RRule;
}
