# Authentication by jwt access/refresh token with express

`The database is fiction, all data is stored in variable on the server`


## Token types:

- Access token (short live time) for getting access to specific api
- Refresh token (medium live time) for updating access token when it expired

> Refresh Token Rotation approach presents for mitigating risks


### Usual Flow

- User Registration
    - User calls `/register`.
    - Server generates `access token 1` and Refresh token.
    - `access token 1` is returned in the response body.
    - Refresh token is added to the database and set in a cookie.

- API Access:
    - User sets the Authorization header as 'Bearer `access token 1`'.
    - User calls the desired API.
    - If the access token is valid, the user receives data.
    - If the access token is expired, the user receives a 401 error.

- Refreshing `access token 1`:
    - User calls `/get-new-access-token`.
    - Sends the Refresh token in the cookie.
    - Server verifies the Refresh token.
    - If verification is successful:
        - Generates a `access token 2` and new refresh token.
        - `access token 2` is returned in the response body.
        - New Refresh token is set in a cookie.
        - Old Refresh token is deleted from the database, and the new one is added.




### Refresh Token Steal Flow

- User Registration
    - User calls `/register`.
    - Server generates Access token and `refresh token 1`.
    - Access token is returned in the response body.
    - `refresh token 1` is added to the database and set in a cookie.

- Attacker stole `refresh token 1`:
    - Attacker calls `/get-new-access-token`.
    - Sends the `refresh token 1` in the cookie.
    - Server verifies the refreshToken.
    - If verification is successful:
        - Generates a new access token and `refresh token 2`.
        - New Access token is returned in the response body.
        - `refresh token 1` is deleted from the database.
        - `refresh token 2` is set in a cookie and added in database.
    - Attacker receives new `refresh token 2` and Access token

- User calls some API with expired Access token:
    - User receives a 401 error.
    - User calls `/get-new-access-token`.
    - Sends the `refresh token 1` in the cookie.
    - Server verifies the `refresh token 1` and don't find one in database.
    - Verification is failed:
        - All user's tokens are deleted from the database
        - returns 401 error, and user must log in again 

- Attacker try after expires Access token generate new one:
    - Attacker calls `/get-new-access-token`.
    - Sends the `refresh token 2` in the cookie.
    - Server can't find `refresh token 2`  in database because all tokens was deleted so return 401 error

- User Login
    - User calls `/login`.
    - Server generates Access token and `refresh token 3`.
    - Access token is returned in the response body.
    - `refresh token 3` is added to the database and set in a cookie.


> Refresh Tokens in database are saved is plain text. In real case maybe should save hashes but maybe this is useless. Because even if attacker steal database we still user `Refresh Token Rotation`