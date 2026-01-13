# Production-Ready Payment Gateway

A **production-grade payment gateway** built using **Node.js, Express, PostgreSQL, Redis, BullMQ, and Docker**.  
The system supports **asynchronous payments**, **refunds**, **idempotency**, **payment capture**, **secure webhooks with retries**, an **embeddable checkout SDK**, and a **basic operational dashboard**.

This project is implemented **strictly according to the provided project specification (PDF)**.

---

## 🚀 Features

### Payments
- Asynchronous payment processing using **BullMQ + Redis**
- Payment lifecycle: `pending → success / failed`
- Explicit **payment capture** flow
- **Idempotent payment creation** using `Idempotency-Key`

### Refunds
- Full and partial refunds
- Asynchronous refund processing
- Refund lifecycle tracking

### Webhooks
- Secure webhooks using **HMAC SHA-256**
- Automatic retry with exponential backoff (test-mode schedule)
- Manual webhook retry API
- Persistent webhook delivery logs with attempts & status

### SDK & Dashboard
- **Embeddable Checkout SDK** (`checkout.js`)
- Modal + iframe-based checkout
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

```
backend/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── workers/
│   ├── jobs/
│   ├── config/
│   ├── app.js
│   └── server.js
├── public/
│   ├── sdk/
│   │   ├── checkout.js
│   │   └── checkout.html
│   └── dashboard.html
├── Dockerfile
├── Dockerfile.worker
└── package.json

docker-compose.yml
README.md
.gitignore
```

---

## 🔑 API Endpoints

### Create Payment
```
POST /api/v1/payments
```

Headers:
```
Idempotency-Key: <unique-key>
```

Body:
```json
{
  "order_id": "order_123",
  "method": "upi",
  "vpa": "user@paytm",
  "amount": 50000
}
```

Response:
```json
{
  "id": "pay_xxxx",
  "status": "pending"
}
```

---

### Capture Payment
```
POST /api/v1/payments/{payment_id}/capture
```

---

### Create Refund
```
POST /api/v1/refunds
```

Body:
```json
{
  "payment_id": "pay_xxxx",
  "amount": 20000,
  "reason": "Customer requested refund"
}
```

---

### List Webhook Logs
```
GET /api/v1/webhooks
```

---

### Retry Webhook
```
POST /api/v1/webhooks/{webhook_id}/retry
```

---

## 🔔 Webhook Security

- All webhooks are signed using **HMAC SHA-256**
- Signature sent via header:
```
X-Signature: <signature>
```
- Merchants verify payload integrity using a shared webhook secret

---

## 💳 Checkout SDK Usage

Include SDK:
```html
<script src="http://localhost:8000/sdk/checkout.js"></script>
```

Open checkout:
```html
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
```

---

## 📊 Dashboard

Webhook dashboard available at:
```
http://localhost:8000/dashboard.html
```

Displays:
- Webhook events
- Delivery status
- Retry attempts

---

## 🐳 Running Locally

### Prerequisites
- Docker Desktop
- Docker Compose

### Start the application
```bash
docker compose up --build
```

### Health Check
```
GET http://localhost:8000/health
```

Expected response:
```json
{
  "status": "ok",
  "db": "Connected"
}
```

---

## 🧪 Verification Summary

- Asynchronous payment processing verified
- Idempotency verified (no duplicate payments)
- Payment capture tested
- Refunds (full & partial) tested
- Webhook delivery, failure, and retries verified
- Manual webhook retry verified
- Checkout SDK modal and callbacks verified
- Dashboard loads webhook logs correctly

---

## 🔐 Security & Best Practices

- `node_modules/` excluded from version control
- `.env` files excluded from version control
- Dependencies installed at build time using Docker
- Secrets managed via environment variables

---

## 🏁 Conclusion

This project demonstrates a **real-world payment gateway architecture** with:
- Reliability through async processing
- Security via signatures and idempotency
- Observability through logs and dashboard
- Scalability using queues and workers

Implemented fully in compliance with the given project specification.
