-- TrustBridge Kenya development reset script.
-- Use this only in local development or demo databases. It deletes all TrustBridge data.

DROP DATABASE IF EXISTS trustbridge_kenya;
CREATE DATABASE trustbridge_kenya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE trustbridge_kenya;

SOURCE sql/full_schema.sql;
SOURCE sql/seed.sql;
