const axios = require("axios");

async function findTicket(eventID) {
	const headers = {
			"user-agent":
				"Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
			"accept-language": "en-US"
		},
		endpoint = "https://m.facebook.com/api/graphql/";

	const params = new URLSearchParams();
	params.append("variables", JSON.stringify({ eventID }));
	params.append("doc_id", "1538131899628031");

	const {
		data: { data: { event } = {}, errors = null }
	} = await axios.post(endpoint, params, { headers });
	if (errors) throw errors.pop();
	else if (!event) return null;
	
	const ticketInfo = {
		url: event.event_buy_ticket_url,
		createdBy: event.event_creator,
		...event.ticketing_context_row
	};

	return ticketInfo;
}

module.exports = findTicket;
