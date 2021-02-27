# DB Design

user table
user id | email | user app id | password | first name | last name | Session Temp Data?

auth
GUID | Expiration | user id

This table shouldn't be needed
session
GUID | Data

```sql
SELECT u.*
FROM auth a
JOIN user u ON u.Id = a.UserId
WHERE a.GUID = $GUID
  AND a.Expiration < $CurrentTime;
```

WITH OrderedSession AS (
	SELECT ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) Idd, *
	FROM session
), Duplicates AS (
	SELECT *, ROW_NUMBER() OVER (PARTITION BY Id ORDER BY Idd DESC) DupNum
	FROM OrderedSession
)
SELECT Id, Expiration, Deleted, UserId
FROM Duplicates d
WHERE DupNum = 1
  AND Deleted = 0
  AND Expiration > 16138000;



WasDeleted AS (
	SELECT *
	FROM Duplicates
	WHERE deleted = 1
	   OR expiration < 16138000
), ActiveSession AS (
	SELECT s.*
	FROM session s
	LEFT JOIN WasDeleted d
		ON s.Id = d.Id
	WHERE d.Id is NULL

