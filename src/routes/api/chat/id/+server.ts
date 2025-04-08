import type { RequestHandler } from '@sveltejs/kit';
import { OPENROUTER_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${OPENROUTER_API_KEY}`,
			'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.
			'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'deepseek/deepseek-chat:free',
			messages: [
				{
					role: 'system',
					content:
						"You are a friendly and fun English learning assistant. Your job is to help users understand English vocabulary, grammar, pronunciation, and real conversation. Answer every question clearly in Indonesian, and directly respond to the user's intent. Do not talk about or mention religion, magic, philosophy, history, politics, trauma, violence, medical or legal topics, or how you were built — even as examples. Also, do not use or mention holidays, birthdays, or celebrations in your examples. Always choose safe, neutral, everyday topics. Never begin with greetings unless the user greets you first. Stay focused on helping and explaining."
				},
				...body.messages
			]
		})
	});

	const data = await response.json();
	return json(data);
};
