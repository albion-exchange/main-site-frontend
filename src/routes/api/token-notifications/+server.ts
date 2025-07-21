import { json, type RequestHandler } from '@sveltejs/kit';
import { createMailChimpService, MAILCHIMP_LISTS } from '$lib/services';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, assetId, assetName, tokenReleaseId, notificationType } = await request.json();
		
		if (!email || !assetId || !assetName) {
			return json({ 
				success: false, 
				message: 'Email, assetId, and assetName are required' 
			}, { status: 400 });
		}
		
		const mailChimpService = createMailChimpService();
		
		const result = await mailChimpService.subscribeToTokenNotifications(
			MAILCHIMP_LISTS.TOKEN_NOTIFICATIONS,
			{
				email,
				assetId,
				assetName,
				tokenReleaseId,
				notificationType: notificationType || 'token_release'
			}
		);
		
		return json(result);
	} catch (error) {
		console.error('Token notification subscription error:', error);
		return json(
			{ success: false, message: 'Failed to subscribe to token notifications' },
			{ status: 500 }
		);
	}
};