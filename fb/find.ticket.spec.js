const findTicket = require("./find.ticket");

describe("find ticket", () => {
	const events = [
		["478163216374701", true],
		["238643773716018", true],
		["2628121710543752", true]
	];
	it.each(events)("should find ticket info", async (event, shouldExpect) => {
		const ticketInfo = await findTicket(event);

		if (shouldExpect) expect(ticketInfo).toEqual(expect.anything());
		else expect(ticketInfo).not.toEqual(expect.anything());
	});
});
