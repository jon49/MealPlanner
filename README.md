# Meal Planner

[toc]

## About

An offline first minimalist web app for organizing your meal planning needs.

## TODO

- [ ] Add Recipe form needs type of recipe, like dinner, etc.
- [ ] Service worker
- [ ] Use service worker to sync to S3 with the AWS Lambda function
- [ ] Use Netlify's user/password to start working on this.
- [ ] See if it works on Netlify :-)

## Sync

A: Client A  
B: Client B  
S: Server

- Tracking fields:
    + `Table` name
    + Record `ID`
        * Timestamp of when the record was originally made created by the
          client
        * Created on the client side
    + `LastUpdated`
        * Timestamp of when the record was modified by the client
        * Created on the client side
    + `ServerSync`
        * Timestamp of when the record was synced to the server
        * Created on the server
    + `ETag`
        + The file created from the `ServerSync` value which exists on a CDN
          which negates the client from having to know the `ServerSync` value.
          The server would need to know past `ServerSync` values in this
          scenario then.
    + `Deleted`

On the client a timestamp (`ClientSync`) will be created which corresponds to
the last time it was updated with the server. Including the `ServerSync` value.
E.g.,

```
LastSync: `ServerSync` `ClientSync`
```

+------+----------------+-----------------------------+------------------+
| Case | `ServerSync`   | `ClientSync`                | Sync with Server |
+======+================+=============================+==================+
| 1    | Same           | > All `LastUpdated`         | false            |
+------+----------------+-----------------------------+------------------+
| 2    | Same           | <= at least 1 `LastUpdated` | true             |
+------+----------------+-----------------------------+------------------+
| 3    | < Server Value | > All `LastUpdated`         | true             |
+------+----------------+-----------------------------+------------------+
| 4    | < Server Value | <= at least 1 `LastUpdated` | true             |
+------+----------------+-----------------------------+------------------+

Case 1: Abandon sync with the server.

Case 2: Send the server all the values which are greater than `LastUpdated` to
        be synced. The server will not send back any items since it is already
        up-to-date.

Case 3: The client will not send any values to the server but will request the
        latest data and the last `LastUpdated` value.

Case 4: The client will send up the latest data it contains and the server will
        send the latest data back to the client, including possible overrides of
        what the client just sent up.

Rather than call a server directly the server could also update a file that is
placed on a CDN with the latest saved server sync information. This would have
an ETag that the client could call for the header information. If the ETag is
the same which the client contains then it wouldn't check for an update. If it
is different then it would initiate the sync (so, case 3 would be initiated).
This would not need to contain anything but the `ServerSync` value since the
client would never actually need to know the value. This might would negate any
reason for the client to ever know the `ServerSync` value at all, just the
`ETag` information and where to query for the ETag.

It is assumed that the client devices are relatively in sync with each other and
that the clients will not be making simultaneous updates since this is meant for
individual users rather than multiple people using the same user profile at the
same time. This greatly simplifies the syncing. Having said that it might be
worth trying to figure out how close the server and client times are to one
another and to disallow clients who have their time off too much.

Since the data will live on a public CDN the server will not need to send the
updated values themselves, but just the tracking data changes. The client can
then request the updates from the CDN directly.

