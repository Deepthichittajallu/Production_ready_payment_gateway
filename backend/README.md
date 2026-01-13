# Production-Ready Payment Gateway

A **production-grade payment gateway** built using **Node.js, Express, PostgreSQL, Redis, BullMQ, and Docker**.  
The system supports **asynchronous payments**, **refunds**, **secure webhooks with retries**, **idempotency**, **payment capture**, and an **embeddable checkout SDK**.

This project is implemented **strictly according to the provided project specification (PDF)**.

---

## 🚀 Features

### Payments
- Asynchronous payment processing using **BullMQ + Redis**
- Payment lifecycle: `pending → success / failed`
- Explicit **payment capture** flow
- **Idempotency support** using `Idempotency-Key` header

### Refunds
- Full and partial refunds
- Asynchronous refund processing
- Refund status tracking

### Webhooks
- Secure webhooks using **HMAC SHA-256**
- Automatic retry with exponential backoff (test-mode schedule)
- Manual webhook retry API
- Persistent webhook delivery logs

### SDK & Dashboard
- **Embeddable Checkout SDK** (`checkout.js`)
- Modal + iframe based checkout
- Communication via `postMessage`
- Minimal dashboard for webhook observability

### Infrastructure
- PostgreSQL for persistence
- Redis for background job queues
- Fully containerized using **Docker Compose**

---

## 🧱 Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL 15
- **Queue:** BullMQ
- **Cache:** Redis
- **Security:** HMAC-SHA256
- **Containerization:** Docker, Docker Compose

---

## 📂 Project Structure

backend/
├── src/
│ ├── controllers/
│ ├── routes/
│ ├── workers/
│ ├── jobs/
│ ├── config/
│ └── app.js
├── public/
│ ├── sdk/
│ │ ├── checkout.js
│ │ └── checkout.html
│ └── dashboard.html
├── Dockerfile
├── Dockerfile.worker
└── package.json

docker-compose.yml
README.md

yaml
Copy code

---

## 🔑 API Endpoints

### Create Payment
POST /api/v1/payments

makefile
Copy code

Headers:
Idempotency-Key: <unique-key>

css
Copy code

Body:
```json
{
  "order_id": "order_123",
  "method": "upi",
  "vpa": "user@paytm",
  "amount": 50000
}
Capture Payment
bash
Copy code
POST /api/v1/payments/{payment_id}/capture
Create Refund
bash
Copy code
POST /api/v1/refunds
Body:

json
Copy code
{
  "payment_id": "pay_xxxx",
  "amount": 20000,
  "reason": "Customer requested refund"
}
List Webhook Logs
bash
Copy code
GET /api/v1/webhooks
Retry Webhook
bash
Copy code
POST /api/v1/webhooks/{webhook_id}/retry
🔔 Webhook Security
All webhooks are signed using HMAC SHA-256

Signature is sent in the header:

css
Copy code
X-Signature: <signature>
Merchants verify the signature using a shared webhook secret

💳 Checkout SDK Usage
Include the SDK:

html
Copy code
<script src="http://localhost:8000/sdk/checkout.js"></script>
Open checkout:

html
Copy code
<script>
PaymentGateway.open({
  order_id: "order_sdk_1",
  amount: 50000,
  onSuccess: (res) => {
    console.log("Payment Success:", res);
  },
  onFailure: (err) => {
    console.error("Payment Failed:", err);
  }
});
</script>
📊 Dashboard
Webhook dashboard is available at:

bash
Copy code
http://localhost:8000/dashboard.html
Displays:

Webhook events

Delivery status

Retry attempts

🐳 Running Locally
Prerequisites
Docker Desktop

Docker Compose

Start the application
bash
Copy code
docker compose up --build
Health Check
bash
Copy code
GET http://localhost:8000/health
Expected response:

json
Copy code
{
  "status": "ok",
  "db": "Connected"
}
🧪 Testing Summary
Asynchronous payment processing verified

Payment capture tested

Refunds (full & partial) tested

Webhook delivery, failure, retries verified

Manual webhook retry verified

Checkout SDK modal and callbacks verified

🏁 Conclusion
This project demonstrates a real-world payment gateway architecture with:

Reliability

Security

Observability

Scalability