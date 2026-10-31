-- ============================================================
-- SunFlow 360 — Database Initialization Script
-- ============================================================
-- Run this script ONCE as the PostgreSQL superuser (postgres)
-- to create the application database and user.
--
-- Usage:
--   "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f scripts/db-init.sql
--
-- After running, set these environment variables before starting the app:
--   SUNFLOW_DB_USERNAME=sunflow_user
--   SUNFLOW_DB_PASSWORD=<the password you chose>
-- ============================================================

-- Create the application user (change the password!)
CREATE USER sunflow_user WITH PASSWORD 'CHANGE_ME_BEFORE_USE';

-- Create the development database
CREATE DATABASE sunflow_dev OWNER sunflow_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sunflow_dev TO sunflow_user;
