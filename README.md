# Background
This is an ongoing project based off a simple game I made in python.
The purpose of this project is to learn about Web Applications and Development with a focus on security.

# Accomplishments
  Implemented session based authentication for users
  Implemented application layer encryption and key exchange modeled off the TLS protocol

# To Do List/Known Issues
For one reason or another some issues were not immediately addressed when identified.

  Creating an account attempts to log the passed credentials in on the backend, if this fails it creates the account. 
  The frontend doesn't see any of this but it is still sloppy.

  The frontend has not been secured against common website attacks, SQL Injection, XXS, etc, this is on the backburner for now.

  During development decryption on the backend would occasionally fail, this appears to have stopped for the time
  
