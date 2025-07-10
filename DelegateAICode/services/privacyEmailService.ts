/**
 * Privacy Email Service for Delegate AI
 * =====================================
 * 
 * Handles sending privacy-related emails to the development team
 * ensuring CCPA compliance requirements are met.
 */

interface PrivacyRequestEmailData {
  requestType: 'know' | 'delete' | 'opt_out' | 'limit_sensitive' | 'access' | 'portability';
  userEmail: string;
  userId?: string;
  categories?: string[];
  details?: string;
  timestamp: string;
  requestId: string;
}

class PrivacyEmailService {
  private developerEmail: string = 'privacy@delegate-ai.com'; // Replace with actual developer email
  private isProduction: boolean = process.env.NODE_ENV === 'production';

  /**
   * Send privacy request notification to development team
   */
  async sendPrivacyRequestNotification(data: PrivacyRequestEmailData): Promise<boolean> {
    try {
      const requestTypeLabels = {
        know: 'Right to Know',
        delete: 'Right to Delete', 
        opt_out: 'Right to Opt-Out of Sale',
        limit_sensitive: 'Right to Limit Sensitive Data Use',
        access: 'Right to Access',
        portability: 'Right to Data Portability'
      };

      const requestLabel = requestTypeLabels[data.requestType] || data.requestType;
      
      // In production, this would integrate with an email service
      // For now, we'll use a mailto link approach or API call
      
      if (this.isProduction) {
        // In production, you would send this to your backend API
        const response = await fetch('/api/privacy/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: this.developerEmail,
            subject: `🔒 URGENT: ${requestLabel} Request - ID: ${data.requestId}`,
            requestData: data
          })
        });
        
        return response.ok;
      } else {
        // Development mode: Create a mailto link
        this.createMailtoLink(data, requestLabel);
        return true;
      }
    } catch (error) {
      console.error('Failed to send privacy request notification:', error);
      return false;
    }
  }

  /**
   * Create a mailto link for development mode
   */
  private createMailtoLink(data: PrivacyRequestEmailData, requestLabel: string): void {
    const subject = encodeURIComponent(`🔒 URGENT: ${requestLabel} Request - ID: ${data.requestId}`);
    
    const body = encodeURIComponent(`
CCPA Privacy Request Notification

Request Type: ${requestLabel}
Request ID: ${data.requestId}
User Email: ${data.userEmail}
${data.userId ? `User ID: ${data.userId}` : ''}
Timestamp: ${new Date(data.timestamp).toLocaleString()}
${data.categories ? `Categories: ${data.categories.join(', ')}` : ''}
${data.details ? `Details: ${data.details}` : ''}

ACTION REQUIRED: This is a legal privacy request under CCPA/CPRA. 
Please process this request within 45 days as required by law.

Next Steps:
1. Verify the user's identity if required
2. Process the request according to CCPA guidelines  
3. Respond to the user within 45 days
4. Update the request status in the admin console
5. Document the completion for compliance records

---
Generated automatically by Delegate AI Privacy System
${new Date().toISOString()}
    `);

    const mailtoUrl = `mailto:${this.developerEmail}?subject=${subject}&body=${body}`;
    
    // Open the mailto link
    window.open(mailtoUrl, '_blank');
    
    console.log('📧 Privacy request email created. Please send the email to complete the notification process.');
  }

  /**
   * Send confirmation email to user (development mode simulation)
   */
  async sendPrivacyRequestConfirmation(
    userEmail: string, 
    requestType: string, 
    requestId: string
  ): Promise<boolean> {
    try {
      const requestTypeLabels = {
        know: 'Right to Know',
        delete: 'Right to Delete',
        opt_out: 'Right to Opt-Out of Sale', 
        limit_sensitive: 'Right to Limit Sensitive Data Use',
        access: 'Right to Access',
        portability: 'Right to Data Portability'
      };

      const requestLabel = requestTypeLabels[requestType as keyof typeof requestTypeLabels] || requestType;

      if (this.isProduction) {
        // In production, send via backend API
        const response = await fetch('/api/privacy/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: userEmail,
            requestType,
            requestId,
            requestLabel
          })
        });
        
        return response.ok;
      } else {
        // Development mode: Just log the confirmation
        console.log(`📧 Confirmation email would be sent to ${userEmail} for ${requestLabel} request (ID: ${requestId})`);
        return true;
      }
    } catch (error) {
      console.error('Failed to send privacy request confirmation:', error);
      return false;
    }
  }

  /**
   * Get developer email for contact purposes
   */
  getDeveloperEmail(): string {
    return this.developerEmail;
  }

  /**
   * Set developer email (for configuration)
   */
  setDeveloperEmail(email: string): void {
    this.developerEmail = email;
  }
}

export const privacyEmailService = new PrivacyEmailService();