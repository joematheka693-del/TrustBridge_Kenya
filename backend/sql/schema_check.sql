USE trustbridge_kenya;

SELECT 'DATABASE' AS check_type, DATABASE() AS value;

SELECT
  table_name,
  table_rows,
  engine,
  table_collation
FROM information_schema.tables
WHERE table_schema = 'trustbridge_kenya'
ORDER BY table_name;

SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL SELECT 'talent_profiles', COUNT(*) FROM talent_profiles
UNION ALL SELECT 'profile_skills', COUNT(*) FROM profile_skills
UNION ALL SELECT 'portfolio_links', COUNT(*) FROM portfolio_links
UNION ALL SELECT 'applications', COUNT(*) FROM applications
UNION ALL SELECT 'verification_requests', COUNT(*) FROM verification_requests
UNION ALL SELECT 'trust_score_events', COUNT(*) FROM trust_score_events;

SELECT role, status, COUNT(*) AS total FROM users GROUP BY role, status ORDER BY role, status;

SELECT
  constraint_name,
  table_name,
  referenced_table_name
FROM information_schema.referential_constraints
WHERE constraint_schema = 'trustbridge_kenya'
ORDER BY table_name, constraint_name;
