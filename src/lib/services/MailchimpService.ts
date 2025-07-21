interface MailchimpSubscription {
	email: string;
	asset?: string;
	tokenReleaseId?: string;
	firstName?: string;
	lastName?: string;
	listType: 'newsletter' | 'tokenNotifications';
}

interface MailchimpResponse {
	success: boolean;
	message: string;
	id?: string;
}

export class MailchimpService {
	private readonly apiKey: string;
	private readonly dataCenter: string;
	private readonly newsletterListId: string;
	private readonly tokenNotificationListId: string;

	constructor() {
		// These would typically come from environment variables
		// For now, using placeholder values that will work with embedded forms
		this.apiKey = process.env.MAILCHIMP_API_KEY || '';
		this.dataCenter = process.env.MAILCHIMP_DATA_CENTER || 'us1';
		this.newsletterListId = process.env.MAILCHIMP_NEWSLETTER_LIST_ID || '';
		this.tokenNotificationListId = process.env.MAILCHIMP_TOKEN_NOTIFICATION_LIST_ID || '';
	}

	/**
	 * Subscribe user to newsletter
	 */
	async subscribeToNewsletter(email: string, firstName?: string, lastName?: string): Promise<MailchimpResponse> {
		return this.subscribe({
			email,
			firstName,
			lastName,
			listType: 'newsletter'
		});
	}

	/**
	 * Subscribe user to token release notifications
	 */
	async subscribeToTokenNotifications(
		email: string, 
		asset: string, 
		tokenReleaseId?: string,
		firstName?: string,
		lastName?: string
	): Promise<MailchimpResponse> {
		return this.subscribe({
			email,
			asset,
			tokenReleaseId,
			firstName,
			lastName,
			listType: 'tokenNotifications'
		});
	}

	private async subscribe(subscription: MailchimpSubscription): Promise<MailchimpResponse> {
		try {
			// In a real implementation, this would make an API call to MailChimp
			// For now, we'll simulate the subscription and log the data
			console.log('MailChimp Subscription:', subscription);

			// Simulate API delay
			await new Promise(resolve => setTimeout(resolve, 1000));

			// For development, we'll always return success
			// In production, this would handle the actual MailChimp API integration
			return {
				success: true,
				message: 'Successfully subscribed!',
				id: `mc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
			};
		} catch (error) {
			console.error('MailChimp subscription error:', error);
			return {
				success: false,
				message: error instanceof Error ? error.message : 'Subscription failed'
			};
		}
	}

	/**
	 * Get embedded form HTML for newsletter signup
	 * This would typically be configured in your MailChimp account
	 */
	getNewsletterEmbedFormHtml(): string {
		return `
			<!-- This is a placeholder for the actual MailChimp embedded form -->
			<!-- Replace with your actual MailChimp embed code -->
			<div id="mc_embed_signup">
				<form action="https://exchange.us1.list-manage.com/subscribe/post?u=your_user_id&amp;id=your_list_id" 
					  method="post" id="mc-embedded-subscribe-form" 
					  name="mc-embedded-subscribe-form" class="validate" target="_blank" novalidate>
					<div id="mc_embed_signup_scroll">
						<div class="mc-field-group">
							<input type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL" 
								   placeholder="Enter your email address" required>
						</div>
						<div id="mce-responses" class="clear">
							<div class="response" id="mce-error-response" style="display:none"></div>
							<div class="response" id="mce-success-response" style="display:none"></div>
						</div>
						<div style="position: absolute; left: -5000px;" aria-hidden="true">
							<input type="text" name="b_your_user_id_your_list_id" tabindex="-1" value="">
						</div>
						<div class="clear">
							<input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe">
						</div>
					</div>
				</form>
			</div>
		`;
	}

	/**
	 * Get embedded form HTML for token notifications
	 */
	getTokenNotificationEmbedFormHtml(): string {
		return `
			<!-- This is a placeholder for the actual MailChimp embedded form -->
			<!-- Replace with your actual MailChimp embed code for token notifications -->
			<div id="mc_embed_signup_tokens">
				<form action="https://exchange.us1.list-manage.com/subscribe/post?u=your_user_id&amp;id=your_token_list_id" 
					  method="post" id="mc-embedded-subscribe-form-tokens" 
					  name="mc-embedded-subscribe-form-tokens" class="validate" target="_blank" novalidate>
					<div id="mc_embed_signup_scroll_tokens">
						<div class="mc-field-group">
							<input type="email" value="" name="EMAIL" class="required email" id="mce-EMAIL-tokens" 
								   placeholder="Enter your email address" required>
						</div>
						<div class="mc-field-group" style="display: none;">
							<input type="text" name="ASSET" id="mce-ASSET" value="">
						</div>
						<div class="mc-field-group" style="display: none;">
							<input type="text" name="TOKENID" id="mce-TOKENID" value="">
						</div>
						<div id="mce-responses-tokens" class="clear">
							<div class="response" id="mce-error-response-tokens" style="display:none"></div>
							<div class="response" id="mce-success-response-tokens" style="display:none"></div>
						</div>
						<div style="position: absolute; left: -5000px;" aria-hidden="true">
							<input type="text" name="b_your_user_id_your_token_list_id" tabindex="-1" value="">
						</div>
						<div class="clear">
							<input type="submit" value="Notify Me" name="subscribe" id="mc-embedded-subscribe-tokens">
						</div>
					</div>
				</form>
			</div>
		`;
	}
}

export const useMailchimpService = () => new MailchimpService();