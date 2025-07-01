-- Add profit settings columns to the profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS default_profit_margin NUMERIC(5,2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS sea_freight_margin NUMERIC(5,2) DEFAULT 12.00,
ADD COLUMN IF NOT EXISTS air_freight_margin NUMERIC(5,2) DEFAULT 18.00,
ADD COLUMN IF NOT EXISTS land_freight_margin NUMERIC(5,2) DEFAULT 15.00,
ADD COLUMN IF NOT EXISTS warehouse_margin NUMERIC(5,2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS customs_margin NUMERIC(5,2) DEFAULT 25.00,
ADD COLUMN IF NOT EXISTS insurance_margin NUMERIC(5,2) DEFAULT 30.00;

-- Update existing profiles with default values if they don't have them
UPDATE profiles SET 
  default_profit_margin = COALESCE(default_profit_margin, 15.00),
  sea_freight_margin = COALESCE(sea_freight_margin, 12.00),
  air_freight_margin = COALESCE(air_freight_margin, 18.00),
  land_freight_margin = COALESCE(land_freight_margin, 15.00),
  warehouse_margin = COALESCE(warehouse_margin, 20.00),
  customs_margin = COALESCE(customs_margin, 25.00),
  insurance_margin = COALESCE(insurance_margin, 30.00)
WHERE default_profit_margin IS NULL 
   OR sea_freight_margin IS NULL 
   OR air_freight_margin IS NULL 
   OR land_freight_margin IS NULL 
   OR warehouse_margin IS NULL 
   OR customs_margin IS NULL 
   OR insurance_margin IS NULL;

-- Verify the changes
SELECT id, user_id, first_name, last_name, 
       default_profit_margin, sea_freight_margin, air_freight_margin,
       land_freight_margin, warehouse_margin, customs_margin, insurance_margin
FROM profiles
LIMIT 5;