import { json, type RequestHandler } from '@sveltejs/kit';
import { createMailChimpService, MAILCHIMP_LISTS } from '$lib/services';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, firstName, lastName } = await request.json();
		
		if (!email) {
			return json({ success: false, message: 'Email is required' }, { status: 400 });
		}
		
		const mailChimpService = createMailChimpService();
		
		const result = await mailChimpService.subscribeToNewsletter(
			MAILCHIMP_LISTS.NEWSLETTER,
			{
				email,
				firstName,
				lastName
			}
		);
		
		return json(result);
	} catch (error) {
		console.error('Newsletter subscription error:', error);
		return json(
			{ success: false, message: 'Failed to subscribe to newsletter' },
			{ status: 500 }
		);
	}
};