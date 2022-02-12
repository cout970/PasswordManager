# Password Manager

Free password manager that doesn't store credentials, instead generates them every time you need a password. Since the
generation algorithm and the input parameters are the same you will always get the same passwords.

### [Try it online here!](https://nss.cout970.net)

### How it works?

A master password is supplied by the user (can be stored on the browser). Each service has a code that is mixed with the
master password and fed into the password generator. The generator uses SHA-512 (and random-seed for legacy
compatibility) to generate a sequence of bytes that depend on the input provided. The sequence is converted to a
password using an alphabet: a list of valid characters that can be used on a password.

The user provides a master password, the name of the service and a few configuration options and the tool generates a
unique password.

The only things stored (for convenience) are the services, alphabets and settings, since they are part of the generation
of the passwords and must be the same to generate the same values.

### Previous version

The previous version is still available [here](https://sss.cout970.net)
