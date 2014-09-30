dsauth
======

This is a prototype for a web authentication protocol using [DSA](https://duckduckgo.com/Digital_Signature_Algorithm), i.e. password-less authentication for your website. It's a browser extension that uses [SJCL](https://github.com/bitwiseshiftleft/sjcl/)'s implementation of ECDSA to sign a challenge and send it to a RESTful web service in your own server that verifies the signature.

Web pages that implement DSAuth must include a special meta tag on their HTML, like this:

```HTML
<meta name="dsap" content="somerandomnonce">
```

This will trigger the browser extension and it will display an icon in your address bar:

![screenshot](doc/screen1.png)

After you select the id you want to use to sign-in, the extension will sign a package. It looks like this:

```javascript
{
  msg: {
    challenge: "bd273cfe472ab0ad16207e8cb381dadbedfa33d88e5192da3205595748e6174b",
    origin: "http://localhost",
    id: "meow",
    public_key: "9d5e0dc7634ce70f4926a3f09c11235acd170d7cdc454e446e1f925af136d24b2aa74f2bdf0156c6fab09ffe73657cbdab8372060f18dc8962fb5e67c1a59fcc"
  },
  signature: "lbNOwCyoQrB9Lo/0c0MRQXTtTO7M1EPk5+TIQeGBAVdL0xKth+qw2UJeZt/VjYNug2otfoF/ZLWO81r82/x09A=="
}
```

The `public_key` value is only used the first time to register the user in the server's database. After that it will always verify that the `signature` of the stringified JSON `msg` correspond to the public key on their db. Then, if everything is ok, the server will return a JSON message containing a session cookie and a redirection page that the extension will apply automatically.

To generate new id's (an username=>keypair) the extension includes this user interface:

![screenshot](doc/screen2.png)

*Disclamer:* this project is in a very-early stage of development: there is no formal specification, no auditories, no peer reviewed papers. This is just a weekend project; something I wanted to code various years ago for my own personal use. It's really buggy/insecure, so don't use it yet :-)
