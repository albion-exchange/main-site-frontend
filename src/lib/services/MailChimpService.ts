import mailchimp from '@mailchimp/mailchimp_marketing';

export interface MailChimpSubscription {
	email: string;
	firstName?: string;
	lastName?: string;
	tags?: string[];
	mergeFields?: Record<string, any>;
}

export interface TokenNotificationRequest {
	email: string;
	assetId: string;
	assetName: string;
	tokenReleaseId?: string;
	notificationType: 'token_release' | 'newsletter';
}

export class MailChimpService {
	private initialized = false;
	
	constructor(
		private apiKey: string = 'your-api-key-here',
		private server: string = 'us1'  // e.g., us1, us2, etc.
	) {
		this.initialize();
	}
	
	private initialize() {
		if (this.initialized) return;
		
		mailchimp.setConfig({
			apiKey: this.apiKey,
			server: this.server,
		});
		
		this.initialized = true;
	}
	
	/**
	 * Subscribe user to general newsletter
	 */
	async subscribeToNewsletter(
		listId: string,
		subscription: MailChimpSubscription
	): Promise<{ success: boolean; message: string }> {
		try {
			this.initialize();
			
			const memberInfo = {
				email_address: subscription.email,
				status: 'subscribed' as const,
				merge_fields: {
					FNAME: subscription.firstName || '',
					LNAME: subscription.lastName || '',
					...subscription.mergeFields
				},
				tags: subscription.tags || []
			};
			
			const response = await mailchimp.lists.addListMember(listId, memberInfo);
			
			return {
				success: true,
				message: 'Successfully subscribed to newsletter'
			};
		} catch (error: any) {
			console.error('MailChimp subscription error:', error);
			
			// Handle existing member
			if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
				return {
					success: true,
					message: 'Email already subscribed to newsletter'
				};
			}
			
			return {
				success: false,
				message: 'Failed to subscribe to newsletter'
			};
		}
	}
	
	/**
	 * Add user to token notification list with asset-specific tags
	 */
	async subscribeToTokenNotifications(
		listId: string,
		request: TokenNotificationRequest
	): Promise<{ success: boolean; message: string }> {
		try {
			this.initialize();
			
			const tags = [
				'token-notifications',
				`asset-${request.assetId}`,
				request.notificationType
			];
			
			if (request.tokenReleaseId) {
				tags.push(`release-${request.tokenReleaseId}`);
			}
			
			const memberInfo = {
				email_address: request.email,
				status: 'subscribed' as const,
				merge_fields: {
					ASSET_ID: request.assetId,
					ASSET_NAME: request.assetName,
					TOKEN_RELEASE_ID: request.tokenReleaseId || '',
					NOTIFICATION_TYPE: request.notificationType
				},
				tags
			};
			
			const response = await mailchimp.lists.addListMember(listId, memberInfo);
			
			return {
				success: true,
				message: 'Successfully subscribed to token notifications'
			};
		} catch (error: any) {
			console.error('MailChimp token notification error:', error);
			
			// Handle existing member - update their tags
			if (error.status === 400 && error.response?.body?.title === 'Member Exists') {
				try {
					const subscriberHash = this.getSubscriberHash(request.email);
					
					// Add tags to existing member
					await mailchimp.lists.updateListMemberTags(listId, subscriberHash, {
						tags: [
							{ name: 'token-notifications', status: 'active' },
							{ name: `asset-${request.assetId}`, status: 'active' },
							{ name: request.notificationType, status: 'active' }
						]
					});
					
					return {
						success: true,
						message: 'Updated notification preferences'
					};
				} catch (updateError) {
					console.error('Failed to update existing member:', updateError);
					return {
						success: false,
						message: 'Failed to update notification preferences'
					};
				}
			}
			
			return {
				success: false,
				message: 'Failed to subscribe to notifications'
			};
		}
	}
	
	/**
	 * Send notification to subscribers when new tokens are released
	 */
	async sendTokenReleaseNotification(
		listId: string,
		assetId: string,
		assetName: string,
		tokenReleaseId: string,
		campaignData: {
			subject: string;
			previewText: string;
			htmlContent: string;
			textContent: string;
		}
	): Promise<{ success: boolean; message: string; campaignId?: string }> {
		try {
			this.initialize();
			
			// Create campaign
			const campaign = await mailchimp.campaigns.create({
				type: 'regular',
				recipients: {
					list_id: listId,
					segment_opts: {
						match: 'any',
						conditions: [
							{
								condition_type: 'TextMerge',
								field: 'ASSET_ID',
								op: 'is',
								value: assetId
							}
						]
					}
				},
				settings: {
					subject_line: campaignData.subject,
					preview_text: campaignData.previewText,
					title: `Token Release - ${assetName}`,
					from_name: 'Albion',
					reply_to: 'contact@albion.exchange',
					auto_footer: false,
					fb_comments: false
				}
			});
			
			// Set campaign content
			await mailchimp.campaigns.setContent(campaign.id, {
				html: campaignData.htmlContent,
				plain_text: campaignData.textContent
			});
			
			// Send campaign
			await mailchimp.campaigns.send(campaign.id);
			
			return {
				success: true,
				message: 'Token release notification sent successfully',
				campaignId: campaign.id
			};
		} catch (error: any) {
			console.error('Failed to send token release notification:', error);
			return {
				success: false,
				message: 'Failed to send token release notification'
			};
		}
	}
	
	/**
	 * Get subscriber hash for MailChimp API calls
	 */
	private getSubscriberHash(email: string): string {
		const crypto = require('crypto');
		return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
	}
	
	/**
	 * Get campaign statistics
	 */
	async getCampaignStats(campaignId: string) {
		try {
			this.initialize();
			return await mailchimp.reports.getCampaignReport(campaignId);
		} catch (error) {
			console.error('Failed to get campaign stats:', error);
			return null;
		}
	}
	
	/**
	 * Unsubscribe user from list
	 */
	async unsubscribe(listId: string, email: string): Promise<{ success: boolean; message: string }> {
		try {
			this.initialize();
			const subscriberHash = this.getSubscriberHash(email);
			
			await mailchimp.lists.updateListMember(listId, subscriberHash, {
				status: 'unsubscribed'
			});
			
			return {
				success: true,
				message: 'Successfully unsubscribed'
			};
		} catch (error: any) {
			console.error('Unsubscribe error:', error);
			return {
				success: false,
				message: 'Failed to unsubscribe'
			};
		}
	}
}

// Environment configuration helper
export function createMailChimpService(): MailChimpService {
	// In a real app, these would come from environment variables
	const apiKey = process.env.MAILCHIMP_API_KEY || 'your-api-key-here';
	const server = process.env.MAILCHIMP_SERVER || 'us1';
	
	return new MailChimpService(apiKey, server);
}

// Default list IDs (these would be configured in your MailChimp account)
export const MAILCHIMP_LISTS = {
	NEWSLETTER: process.env.MAILCHIMP_NEWSLETTER_LIST_ID || 'newsletter-list-id',
	TOKEN_NOTIFICATIONS: process.env.MAILCHIMP_TOKEN_NOTIFICATIONS_LIST_ID || 'token-notifications-list-id'
} as const;