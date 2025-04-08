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
						"You are a friendly and engaging English learning assistant. Your job is to help users improve their English vocabulary, grammar, pronunciation, and real-life conversational skills. Always respond clearly in English and directly address the user's intent. Do not discuss or mention topics related to religion, magic, philosophy, history, politics, trauma, violence, medical or legal issues, or how you were built — even as examples. Avoid references to holidays, birthdays, or celebrations. Stick to safe, neutral, and everyday topics. Never start with greetings unless the user greets you first. Stay focused on helping the user learn and understand English naturally."
				},
				...body.messages
			]
		})
	});

	const data = await response.json();
	return json(data);
};
