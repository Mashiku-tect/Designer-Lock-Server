const axios = require('axios');

class ClickPesaPaymentClient {
  constructor({ apiKey, clientId }) {
    this.apiKey = process.env.CLICKPESA_API_KEY;
    this.clientId = process.env.CLICKPESA_CLIENT_ID;
    this.baseUrl = process.env.CLICKPESA_URL; // production URL
    this.token = null;
    this.tokenExpiry = 0;
  }

  // ✅ Token management
  async getToken() {
    const now = Math.floor(Date.now() / 1000);
    if (this.token && now < this.tokenExpiry) return this.token;

    const resp = await axios.post(
      `${this.baseUrl}/third-parties/generate-token`,
      {},
      { headers: { 'api-key': this.apiKey, 'client-id': this.clientId } }
    );

    let token = resp.data?.access_token || resp.data?.token;
    if (!token) throw new Error('No token received');
    if (token.startsWith('Bearer ')) token = token.slice(7);

    this.token = token;
    this.tokenExpiry = now + 3500; // token valid ~1hr
    return this.token;
  }

  // ✅ USSD Push Payment Methods
  async previewUSSDPushRequest(paymentData) {
    const token = await this.getToken();
    const resp = await axios.post(
      `${this.baseUrl}/third-parties/payments/preview-ussd-push-request`,
      paymentData,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return resp.data;
  }

  async initiateUSSDPushRequest(paymentData) {
    const token = await this.getToken();
    const resp = await axios.post(
      `${this.baseUrl}/third-parties/payments/initiate-ussd-push-request`,
      paymentData,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return resp.data;
  }

  async checkUSSDPushTransactionStatus(orderReference) {
    const token = await this.getToken();
    const resp = await axios.get(
      `${this.baseUrl}/third-parties/payments/${orderReference}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return resp.data;
  }

  // ✅ Mobile Money Payout Methods
  async validateMobilePayout(payoutData) {
    try{
 const token = await this.getToken();
    const resp = await axios.post(
      `${this.baseUrl}/third-parties/payouts/preview-mobile-money-payout`,
      payoutData,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    //console.log("Validation response:", resp.data);
    return resp.data;
    }
   catch (error) {
  const details = error.response?.data || error.message;
  console.log("Error during payout validation:", error.response?.data || error.message);
  throw new Error('Payout validation failed: ' + JSON.stringify(details, null, 2));
}

   
  }

  async createMobilePayout(payoutData) {
    try{
 const token = await this.getToken();
    const resp = await axios.post(
      `${this.baseUrl}/third-parties/payouts/create-mobile-money-payout`,
      payoutData,
      { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    //console.log("Payout creation response:", resp.data);
    return resp.data;
    }
    catch (error) {
      console.log("Error during payout creation:", error.response?.data || error.message);
      throw new Error('Payout creation failed: ' + (error.response?.data || error.message));
    }
   
  }

  async checkMobilePayoutStatus(orderReference) {
    try{
        const token = await this.getToken();
    const resp = await axios.get(
      `${this.baseUrl}/third-parties/payouts/${orderReference}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
   // console.log("Payout status response:", resp.data);
    return resp.data;
      }
      catch (error) {
      throw new Error('Payout status check failed: ' + (error.response?.data || error.message));
    }
  
  }

   // ✅ Check merchant balance
  async checkBalance() {
    try{
      // console.log("Checking balance...");
 const token = await this.getToken();
    //console.log("Using token:", token);
    const response = await axios.get(
      `${this.baseUrl}/third-parties/account/balance`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
   // console.log("Balance Response In Clickpesa Client",response.data);
     const balance = Number(
  response.data?.balances?.find(b => b.currency === 'TZS')?.balance ?? 0
);
    return balance;
    }
    catch (error) {
      console.log("Error during balance check:", error.response?.data || error.message);
      throw new Error('Balance check failed: ' + (error.response?.data || error.message));
    }
  }

  // ✅ Full payout workflow (validate → create → check status)
  async processMobilePayout(payoutData) {
   // console.log("Payout Data",payoutData);
    const balance = await this.checkBalance();
    if (balance < payoutData.amount) throw new Error(`Insufficient balance: ${balance}`);
    //console.log("Done balance check:", balance);

    // Validate payout
    const validation = await this.validateMobilePayout(payoutData);
    //console.log('Validation successful:', validation);

    // Create payout
    const payoutResult = await this.createMobilePayout(payoutData);
    //console.log('Payout initiated:', payoutResult);

    // Check payout status
    const payoutStatus = await this.checkMobilePayoutStatus(payoutData.orderReference);
    //console.log('Payout status:', payoutStatus);

    return payoutStatus;
  }

 
}

module.exports = ClickPesaPaymentClient;
