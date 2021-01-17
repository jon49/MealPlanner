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

