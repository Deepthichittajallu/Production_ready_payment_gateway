-- Payments table
CREATE TABLE payments (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  merchant_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  method VARCHAR(20) NOT NULL,
  vpa VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  captured BOOLEAN DEFAULT false,
  error_code VARCHAR(50),
  error_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refunds table
CREATE TABLE refunds (
  id VARCHAR(64) PRIMARY KEY,
  payment_id VARCHAR(64) REFERENCES payments(id),
  merchant_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP
);

CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);

-- Webhook logs table
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  event VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  response_code INTEGER,
  response_body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_merchant ON webhook_logs(merchant_id);
CREATE INDEX idx_webhooks_status ON webhook_logs(status);
CREATE INDEX idx_webhooks_retry ON webhook_logs(next_retry_at)
WHERE status = 'pending';

-- Idempotency keys table
CREATE TABLE idempotency_keys (
  key VARCHAR(255),
  merchant_id UUID,
  response JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  PRIMARY KEY (key, merchant_id)
);