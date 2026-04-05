const axios = require('axios');

/**
 * ClickPesa API Client
 * Handles token management, balance check, payout validation, creation, and status check
 */
class ClickPesaClient {
  constructor(apiKey, clientId) {
    this.apiKey = apiKey;
    this.clientId = clientId;
    this.token = null;
    this.tokenExpiresAt = null;
  }

  // Generate a new token
  async generateToken() {
    try {
      const response = await axios.post(
        'https://api.clickpesa.com/third-parties/generate-token',
        {},
        { headers: { 'api-key': this.apiKey, 'client-id': this.clientId } }
      );

      this.token = response.data?.access_token || response.data?.token;
      // Token is valid for 1 hour
      this.tokenExpiresAt = Date.now() + 60 * 60 * 1000 - 5000; // 5 seconds margin
      console.log('Token generated successfully');
      return this.token;
    } catch (error) {
      throw new Error('Token generation failed: ' + (error.response?.data || error.message));
    }
  }

  // Ensure token is valid, refresh if expired
  async getToken() {
    if (!this.token || Date.now() >= this.tokenExpiresAt) {
      await this.generateToken();
    }
    // If token already has "Bearer ", strip it
if (this.token.startsWith('Bearer ')) {
  this.token = this.token.slice(7); // Remove 'Bearer ' prefix
}
    return this.token;
  }

  // Check merchant balance
  async checkBalance() {
    try {
      const token = await this.getToken();
      console.log(token);
      const response = await axios.get(
        'https://api.clickpesa.com/third-parties/account/balance',
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return response.data?.balance;
    } catch (error) {
      throw new Error('Balance check failed: ' + (error.response?.data || error.message));
    }
  }

  // Validate payout
  async validatePayout(payoutData) {
    try {
      const token = await this.getToken();
      const response = await axios.post(
        'https://api.clickpesa.com/third-parties/payouts/preview-mobile-money-payout',
        payoutData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      throw new Error('Payout validation failed: ' + (error.response?.data || error.message));
    }
  }

  // Create payout
  async createPayout(payoutData) {
    try {
      const token = await this.getToken();
      const response = await axios.post(
        'https://api.clickpesa.com/third-parties/payouts/create-mobile-money-payout',
        payoutData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      return response.data;
    } catch (error) {
      throw new Error('Payout creation failed: ' + (error.response?.data || error.message));
    }
  }

  // Check payout status
  async checkPayoutStatus(orderReference) {
    try {
      const token = await this.getToken();
      const response = await axios.get(
        `https://api.clickpesa.com/third-parties/payouts/${orderReference}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error('Payout status check failed: ' + (error.response?.data || error.message));
    }
  }

  // Process a single payout with full workflow
  async processPayout(payoutData) {
    // 1️⃣ Check balance
    const balance = await this.checkBalance();
    if (balance < payoutData.amount) {
      throw new Error(`Insufficient balance. Available: ${balance}, Required: ${payoutData.amount}`);
    }

    // 2️⃣ Validate payout
    const validation = await this.validatePayout(payoutData);
    console.log('Validation successful:', validation);

    // 3️⃣ Create payout
    const payoutResult = await this.createPayout(payoutData);
    console.log('Payout initiated successfully:', payoutResult);

    // 4️⃣ Check payout status
    const payoutStatus = await this.checkPayoutStatus(payoutData.orderReference);
    console.log('Payout status:', payoutStatus);

    return payoutStatus;
  }
}

// Example usage for batch payouts
(async () => {
  const client = new ClickPesaClient('SKqBIbVFFjwQ5p8X0jyFkeGAn4icLYEtuu2pmBRNym', 'ID0G6xHpubjTr3uq4sRICeJNER8YUw6m');

  const payouts = [
    {
      amount: 123,
      phoneNumber: '255626779507',
      currency: 'TZS',
      exchange: { fromCurrency: 'USD', toCurrency: 'USD', rate: 1, amount: 123 },
      orderReference: 'ORDER12345',
      checksum: '<CHECKSUM1>'
    }
    
  ];

  for (const payoutData of payouts) {
    try {
      await client.processPayout(payoutData);
    } catch (err) {
      console.error(`Error processing payout ${payoutData.orderReference}:`, err.message);
    }
  }
})();
