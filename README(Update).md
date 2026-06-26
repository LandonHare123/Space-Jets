# Background
During the Spring 2026 semester I learned the fundamentals of encryption in my cryptology course.
I decided to implement some of what I learned in this web app. Specifically secure key exchange and encryption 

# Implementation
I used ECCDH for key exchange and AESGCM for encryption via the crypto module and web crypto api
I decided to model my application layer encryption off of TLS, the protocol responsible for secure web connections. This would both teach me how encryption is performed on the internet and ensure my implementation, if done correctly, would be secure.

# Results
As of now key exchange and the cipher functions work. Encryption is preformed on user login and highscore transporting.
However key handling on the back end is currently unfinished due limitations on session handling.

# For Next Time
The plan is to expand on sessions on the front and backend to allow for more nuanced encryption application, as well as adding a database for keys
