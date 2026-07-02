# Background
My last entry had working encryption functions however due to sessions being half implemented the backend could not handle multiple clients and certain api calls were still unencrypted. This entry resolves this

# Implementation
Sessions are used to keep track of keys. The Sessions are created by the backend as part of the TLS Handshake and are set as cookies. The generated key is stored in the database with the session, on subsequent requests the session cookies are used to pull the keys from the db.
There are two types of sessions a 'net' session which tracks the connecting client, and a 'log' session which tracks when a user is logged in and is used for authentication. 
    A net session is created on connection and to a key which encrypts the entire json payload in a single string of ciphertext. 
    A log session is created when a user clicks login or create account, the corresponding key is used to encrypt particularly sensitive data under the net session
        
# Results
The backend can now support multiple clients and only sends encrypted data. There are some stray sessions not being delete properly from the DB, this will be resolved next time

# For Next Time
Determine the cause of these stray sessions and also add TTL/expiry so if a user doesn't signout properly the session is removed and if a client disconnects the network session terminates.
