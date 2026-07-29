CREATE TABLE IF NOT EXISTS payroll_schedules (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month SMALLINT CHECK (day_of_month BETWEEN 1 AND 31),
  time_of_day VARCHAR(5) NOT NULL,
  asset_code VARCHAR(12) NOT NULL DEFAULT 'XLM',
  token_address VARCHAR(64) NOT NULL,
  recipients JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  next_run_at TIMESTAMP NOT NULL,
  last_run_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payroll_schedule_runs (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER NOT NULL REFERENCES payroll_schedules(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('succeeded', 'failed')),
  tx_hash VARCHAR(64),
  batch_id BIGINT,
  error_message TEXT,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payroll_schedules_org_id ON payroll_schedules(organization_id);
CREATE INDEX idx_payroll_schedules_status ON payroll_schedules(status);
CREATE INDEX idx_payroll_schedules_next_run_at ON payroll_schedules(next_run_at);
CREATE INDEX idx_payroll_schedule_runs_schedule_id ON payroll_schedule_runs(schedule_id);

CREATE TRIGGER update_payroll_schedules_updated_at BEFORE UPDATE ON payroll_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
