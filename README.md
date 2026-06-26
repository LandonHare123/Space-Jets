# Background
As of now the webapp is served once to the client with no complimentary features. 
I decided to add accounts which keep track of a users high score.
This both expands on the capability of webapp and teaches me more about front/backend development.

# Implementation
In order to do this I needed a backend with a database to handle user login and data storage
as well as a front end that makes the relevant api calls to the server.
Once the user is logged in the server creates a user session and sets it as a cookie in the headers. Any future api calls (as of now just /api/writescore) are authenticated via this session token.
