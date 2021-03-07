# Meal Planner Data

## Summary

This project will hold the user data for the actual meal planner, like recipes, planned recipes, etc.

## Database

This database will be event sourced and the data will be retrieved per user. The data will be "put"
so I can just grab the latest data rather than build the data set from scratch every time.

### Events Table

**Fields**

- Id (long, identity, not null)
	+ This will be used to determine the sequence in which items were added
- User Id (long, not null)
	+ The user ID
- Source (Guid string or "Server", not null)
	+ The source of the app (like server, user phone, etc.)
	+ Currently this won't be used, but will used when I implement the offline app.
- Type (text, not null)
	+ The type of the data being stored (like `Recipe`, `MealTime`, etc)
- Item Id (long, not null)
	+ The ID of the item added (the type and the item id form a unique pair)
- Value (blob, not null)
	+ The actual data being stored! This will be a binary of the stored data as JSON
- Deleted (boolean, not null, default false)

Primary key: UserId | Type | ItemId | Id

To query the data per user it would be something like this:

```sql
WITH Duplicates AS (
	SELECT *, ROW_NUMBER() OVER (PARTITION BY Type, ItemId ORDER BY Id DESC) DupNum
	FROM Events
    WHERE UserId = $UserId
)
SELECT d.Value
FROM Duplicates d
WHERE DupNum = 1
  AND Deleted = 0;";
```

