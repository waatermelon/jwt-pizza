# Curiosity Report: HTTPS Connections

## What is HTTPS?
HTTPS stands for Hyper-Text Transfer Protocol Secure. I've always understood it as a blackbox system, but recently I have wanted to learn more about what it really consists of. In simple terms, HTTPS encrypts the data between the server and your browser.

## HTTPS Background
HTTPS uses an SSL/TLS certificate to authenticate the site you are visiting. This allows for the encryption of the data so that hackers won't be able to read any of the data being transferred.

SSL and TLS are secure cryptographic protocols that are built to secure any communications from interception. TLS is the more modern and more secure successor to SSL, which is now deprecated. 

In the backend, HTTPS is basically just HTTP combined with SSL/TLS. That is why it is considered "Secure".

## Why is HTTPS important?
When you connect to a website, you basically do a TLS handshake which establishes a secure and encrypted connection. When these handshakes are not performed correctly, the browser will warn you and are given the option to not connect. If you do connect despite these warnings, your data being sent or receieved will be unencrypted, which means interceptions can be detrimental (if PII is transferred).


## Handshake
I decided to go more in depth with the Handshake, and performed the following on git bash.
```ci
openssl s_client -connect google.com:443 -servername google.com
```

The results were as follows:

```ci
Connecting to 142.251.121.138
CONNECTED(000001B0)
depth=2 C=US, O=Google Trust Services LLC, CN=GTS Root R1
verify return:1
depth=1 C=US, O=Google Trust Services, CN=WR2
verify return:1
depth=0 CN=*.google.com
verify return:1
---
Certificate chain
 0 s:CN=*.google.com
   i:C=US, O=Google Trust Services, CN=WR2
   a:PKEY: id-ecPublicKey, 256 (bit); sigalg: RSA-SHA256
   v:NotBefore: Oct 27 08:33:43 2025 GMT; NotAfter: Jan 19 08:33:42 2026 GMT
 1 s:C=US, O=Google Trust Services, CN=WR2
   i:C=US, O=Google Trust Services LLC, CN=GTS Root R1
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: Dec 13 09:00:00 2023 GMT; NotAfter: Feb 20 14:00:00 2029 GMT
 2 s:C=US, O=Google Trust Services LLC, CN=GTS Root R1
   i:C=BE, O=GlobalSign nv-sa, OU=Root CA, CN=GlobalSign Root CA
   a:PKEY: rsaEncryption, 4096 (bit); sigalg: RSA-SHA256
   v:NotBefore: Jun 19 00:00:42 2020 GMT; NotAfter: Jan 28 00:00:42 2028 GMT
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIOSDCCDTCgAwIBAgIRAJ2e0OHMDsyECgQuPC+e1XEwDQYJKoZIhvcNAQELBQAw
OzELMAkGA1UEBhMCVVMxHjAcBgNVBAoTFUdvb2dsZSBUcnVzdCBTZXJ2aWNlczEM
MAoGA1UEAxMDV1IyMB4XDTI1MTAyNzA4MzM0M1oXDTI2MD ... (the certificate was huge)
-----END CERTIFICATE-----
subject=CN=*.google.com
issuer=C=US, O=Google Trust Services, CN=WR2
---
No client certificate CA names sent
Peer signing digest: SHA256
Peer signature type: ECDSA
Server Temp Key: X25519, 253 bits
---
SSL handshake has read 6653 bytes and written 405 bytes
Verification: OK
---
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Server public key is 256 bit
This TLS version forbids renegotiation.
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)
---
```

I found that this information gave me a lot of insight on how the handshake actually works.
This line in particular was what helped me understand what was going on:
```ci
SSL handshake has read 6653 bytes and written 405 bytes
Verification: OK
```
I as the client generate the shared secret which allows the server to understand, and the server sends its public key.

I also noticed:
```ci
sigalg: RSA-SHA256
```
which I believe represents that the RSA encryption algorithm was used with a SHA-256 hashing algo.
I personally have worked on an RSA Encryption algorithm before so it was cool to see how widely used it is.

I decided to also try this on my personal website using:
```ci
openssl s_client -connect pizza.htakara.click:443 -servername pizza.htakara.click
```

I got this as output:
```ci
Connecting to 18.238.238.5
CONNECTED(000001B4)
depth=2 C=US, O=Amazon, CN=Amazon Root CA 1
verify return:1
depth=1 C=US, O=Amazon, CN=Amazon RSA 2048 M01
verify return:1
depth=0 CN=*.htakara.click
verify return:1
---
Certificate chain
 0 s:CN=*.htakara.click
   i:C=US, O=Amazon, CN=Amazon RSA 2048 M01
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: Oct 22 00:00:00 2025 GMT; NotAfter: Nov 20 23:59:59 2026 GMT
 1 s:C=US, O=Amazon, CN=Amazon RSA 2048 M01
   i:C=US, O=Amazon, CN=Amazon Root CA 1
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: Aug 23 22:21:28 2022 GMT; NotAfter: Aug 23 22:21:28 2030 GMT
 2 s:C=US, O=Amazon, CN=Amazon Root CA 1
   i:C=US, ST=Arizona, L=Scottsdale, O=Starfield Technologies, Inc., CN=Starfield Services Root Certificate Authority - G2
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA256
   v:NotBefore: May 25 12:00:00 2015 GMT; NotAfter: Dec 31 01:00:00 2037 GMT
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIFwTCCBKmgAwIBAgIQCCauVkIeNKkaHE7NGRGm7jANBgkqhkiG9w0BAQsFADA8
MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRwwGgYDVQQDExNBbWF6b24g ...
/QK3g4pMPwvJwIPnz4tFc++zi3ZOkc0staWjiGWHaKl2k0s3Dqx58ZGDpiuA833x
CEPZCXtscOeRTnB8yYkv0eKuwv1gb7umgRQUt5OFCnIpHy7fku5CMyi3nkPimVe/
Xh0gFxf1/AWNY+0s3IEf5cHkJ6IL3bzXQMknUZGBoCcPOq9dJg==
-----END CERTIFICATE-----
subject=CN=*.htakara.click
issuer=C=US, O=Amazon, CN=Amazon RSA 2048 M01
---
No client certificate CA names sent
Peer signing digest: SHA256
Peer signature type: RSA-PSS
Server Temp Key: X25519, 253 bits
---
SSL handshake has read 4327 bytes and written 398 bytes
Verification: OK
---
New, TLSv1.3, Cipher is TLS_AES_128_GCM_SHA256
Server public key is 2048 bit
This TLS version forbids renegotiation.
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)
---
---
Post-Handshake New Session Ticket arrived:
SSL-Session:
    Protocol  : TLSv1.3
    Cipher    : TLS_AES_128_GCM_SHA256
    Session-ID: B2564B7335313FBA65830AE0D686EDDBEE59A03D7E7FA9F5A2127F6307BDD7FA
    Session-ID-ctx:
    Resumption PSK: 5A81C6633569500A73955FB06432FB162095FC22C17A8A690F601B0C0A37F405
    PSK identity: None
    PSK identity hint: None
    SRP username: None
    TLS session ticket lifetime hint: 85531 (seconds)
    TLS session ticket:
    0000 - 01 31 37 36 34 31 33 33-31 38 32 30 30 30 00 00   .1764133182000..
    0010 - 00 49 d0 fe e9 03 50 34-3a 66 1d 7c a4 bc 2f 54   .I....P4:f.|../T
    0020 - e0 69 06 da 26 4b d0 a9-53 eb 8a 30 01 e8 3f 19   .i..&K..S..0..?.
    0030 - fd fc dd a8 f6 00 a8 a8-41 46 df b0 1e ee 72 91   ........AF....r.
    0040 - bf 4b d5 11 9d 64 98 a2-68 8b 9c cb 18 1f 35 67   .K...d..h.....5g
    0050 - 60 80 b6 4c 1e d1 9c 32-ac 3f 41 41 20 c2 0e 09   `..L...2.?AA ...
    0060 - ab ac 95 15 ba 52 bb 1f-1d db 29 9c 17 b2 8f 52   .....R....)....R
    0070 - ea 56 c1 f7 76 04 f3 f4-b8 58 33 6b d4 78 ef 47   .V..v....X3k.x.G
    0080 - 7c 3e 31 07 14 6c e4 fc-97 39                     |>1..l...9

    Start Time: 1764134048
    Timeout   : 7200 (sec)
    Verify return code: 0 (ok)
    Extended master secret: no
    Max Early Data: 0
---
read R BLOCK
```

It seems that my website uses RSA 2048-bit whereas google uses 256-bit.

with Node.js you can also view this information using https

```js
const https = require('https');

https.get('https://pizza.htakara.click', (res) => {
  const cert = res.socket.getPeerCertificate();
  console.log('Server Certificate:', cert);
  console.log('TLS Version:', res.socket.getProtocol());
  console.log('Cipher:', res.socket.getCipher());
});
```