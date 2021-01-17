# Meal Planner

[[_TOC_]]

## About

An offline first minimalist web app for organizing your meal planning needs.

## TODO

- [ ] Have a central place for creating/updating/deleting database so that I can update the change table
- [ ] Add Recipe form needs type of recipe, like dinner, etc.
- [ ] Service worker
- [ ] Use service worker to sync to S3 with the AWS Lambda function
- [ ] Use Netlify's user/password to start working on this.
- [ ] See if it works on Netlify :-)

## Sync

A: Client A  
B: Client B  
S: Server

Rather than using a timestamp on the server use an incrementing number. Also, do full deletes.

- Tracking fields:
    + `Table` name
    + Record `ID`
        * Timestamp of when the record was originally made
        * Created on the client side
    + `ClientServerUpdatedId`
        * This will correspond to when it was updated on the server and will be
          set to 0 when it was updated on the client.
    + `ServerUpdatedId`
        * The last time the item was updated the with an autoincrementing ID
        * Created on the server
        * If it was deleted then it should have a column for such.

For simplicity if there are conflicts between clients then last write wins. If
I wanted to make it more robust I could compare last updated values and have
the clients do a manual check if there is a conflict.

E.g.,

`ServerUpdatedId` → S  
`ClientServerUpdatedId` ­→ C

| Case | Logic | Sync with Server              |
| ---- | ----- | ----------------              |
| 1    | C = 0 | Update to Server from Client  |
| 2    | S = C | Already synced                |
| 3    | S > C | Update client with new values |

The client saves the last updated value in a setting. And is updated after a
server update.

Case 1: This is the list on the client of items which have been updated since
        the last sync.

Case 2: This means that the client and server are already synced. This means no
        update is needed. This value can be saved in a file on the CDN that the
        client pulls when the user wishes to check for udpates.

Case 3: If the server value is higher that means the server was updated by a
        different client and the current client needs to be udpated. This could
        simply be done with the ETag value of the file then a `HEAD` Http call
        could be made rather than downloading the file. But the file will be
        really small so I doubt it should matter.

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

## Databases

**Cost**

- DynamoDB
    + Write : $1.25/Million
    + Read : $0.25/Million
    + Storage : 25 GB free - $0.25/GB
- FaunaDB
    + Write : ~1.45M free - $2.00/Million
    + Read : ~2.9M free - $0.50/Million
    + Storage : 5GB free - $0.18/GB
- Cloudflare Workers KV
    + Base subscription $5/Month
    + Lists : 1M free - $5/Million
    + Delete : 1M free - $5/Million
    + Write : 1M free - $5/Million
    + Read : 10M free - $0.50/Million
    + Storage : 1GB free - $0.50/GB
