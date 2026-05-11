const DEFAULT_BACKEND_API_URL =
  process.env.BACKEND_API_URL ||
  process.env.BACKEND_URL ||
  "http://vps-9ebf5d76.vps.ovh.net:5000/api/v1";

const TEST_NGROK_BASE_URL = process.env.TEST_NGROK_BASE_URL?.replace(
  /\/+$/,
  "",
);
const TEST_NGROK_API_URL = TEST_NGROK_BASE_URL
  ? TEST_NGROK_BASE_URL.endsWith("/api/v1")
    ? TEST_NGROK_BASE_URL
    : `${TEST_NGROK_BASE_URL}/api/v1`
  : null;

export function getCheckoutBackendApiUrl(paymentMethod?: string) {
  if (paymentMethod === "MBWAY" && TEST_NGROK_API_URL) {
    return TEST_NGROK_API_URL;
  }

  return DEFAULT_BACKEND_API_URL;
}

export function getPaymentStatusBackendCandidates() {
  return TEST_NGROK_API_URL
    ? [TEST_NGROK_API_URL, DEFAULT_BACKEND_API_URL]
    : [DEFAULT_BACKEND_API_URL];
}

export function getWebhookBackendApiUrl() {
  return TEST_NGROK_API_URL || DEFAULT_BACKEND_API_URL;
}
