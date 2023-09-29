// relayActivity.spec.tsからコピー
export const expectedHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId/activity#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="E4xXrCrDwMfcdyVopZCV/xAOCtNYhCpJvbcC9pM+Rv+hXpgtLNsIce0b0sv0t268/IjyR+ZP0gFsiY4MtzYbjO9Q3GXw2g+dF9IMDFrApmtfC9nrSWCqmd+qUQmmUfxC/lY+UyyzAL+kSH6alEQY5VfX64hm0FFgBqWMaSJllTAfUA50/pxXXo/tJog6As8h3Mljsqm3cyCz0hi1Ctb5cdpVGmKherwGGgKfHRdR/fft3jbZ0t2z2lEDleARo8MMnWLLXKITDTsQUZztSxdXA2RnXSoyRdDzv1iLswSgF+WgsJnw2qdPHsDDeHBpmSD7Fbv6LAZF+6wzzJlctg=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const noKeyIdHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  signature: `algorithm="rsa-sha256",headers="(request-target) host date digest",signature="E4xXrCrDwMfcdyVopZCV/xAOCtNYhCpJvbcC9pM+Rv+hXpgtLNsIce0b0sv0t268/IjyR+ZP0gFsiY4MtzYbjO9Q3GXw2g+dF9IMDFrApmtfC9nrSWCqmd+qUQmmUfxC/lY+UyyzAL+kSH6alEQY5VfX64hm0FFgBqWMaSJllTAfUA50/pxXXo/tJog6As8h3Mljsqm3cyCz0hi1Ctb5cdpVGmKherwGGgKfHRdR/fft3jbZ0t2z2lEDleARo8MMnWLLXKITDTsQUZztSxdXA2RnXSoyRdDzv1iLswSgF+WgsJnw2qdPHsDDeHBpmSD7Fbv6LAZF+6wzzJlctg=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const noAlgorithmHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId/activity#main-key",headers="(request-target) host date digest",signature="E4xXrCrDwMfcdyVopZCV/xAOCtNYhCpJvbcC9pM+Rv+hXpgtLNsIce0b0sv0t268/IjyR+ZP0gFsiY4MtzYbjO9Q3GXw2g+dF9IMDFrApmtfC9nrSWCqmd+qUQmmUfxC/lY+UyyzAL+kSH6alEQY5VfX64hm0FFgBqWMaSJllTAfUA50/pxXXo/tJog6As8h3Mljsqm3cyCz0hi1Ctb5cdpVGmKherwGGgKfHRdR/fft3jbZ0t2z2lEDleARo8MMnWLLXKITDTsQUZztSxdXA2RnXSoyRdDzv1iLswSgF+WgsJnw2qdPHsDDeHBpmSD7Fbv6LAZF+6wzzJlctg=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const noHeadersHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId/activity#main-key",algorithm="rsa-sha256",signature="E4xXrCrDwMfcdyVopZCV/xAOCtNYhCpJvbcC9pM+Rv+hXpgtLNsIce0b0sv0t268/IjyR+ZP0gFsiY4MtzYbjO9Q3GXw2g+dF9IMDFrApmtfC9nrSWCqmd+qUQmmUfxC/lY+UyyzAL+kSH6alEQY5VfX64hm0FFgBqWMaSJllTAfUA50/pxXXo/tJog6As8h3Mljsqm3cyCz0hi1Ctb5cdpVGmKherwGGgKfHRdR/fft3jbZ0t2z2lEDleARo8MMnWLLXKITDTsQUZztSxdXA2RnXSoyRdDzv1iLswSgF+WgsJnw2qdPHsDDeHBpmSD7Fbv6LAZF+6wzzJlctg=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const noSignatureHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const unSupportedDigestHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-512=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId/activity#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="E4xXrCrDwMfcdyVopZCV/xAOCtNYhCpJvbcC9pM+Rv+hXpgtLNsIce0b0sv0t268/IjyR+ZP0gFsiY4MtzYbjO9Q3GXw2g+dF9IMDFrApmtfC9nrSWCqmd+qUQmmUfxC/lY+UyyzAL+kSH6alEQY5VfX64hm0FFgBqWMaSJllTAfUA50/pxXXo/tJog6As8h3Mljsqm3cyCz0hi1Ctb5cdpVGmKherwGGgKfHRdR/fft3jbZ0t2z2lEDleARo8MMnWLLXKITDTsQUZztSxdXA2RnXSoyRdDzv1iLswSgF+WgsJnw2qdPHsDDeHBpmSD7Fbv6LAZF+6wzzJlctg=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const invalidDateHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:01 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId/activity#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="E4xXrCrDwMfcdyVopZCV/xAOCtNYhCpJvbcC9pM+Rv+hXpgtLNsIce0b0sv0t268/IjyR+ZP0gFsiY4MtzYbjO9Q3GXw2g+dF9IMDFrApmtfC9nrSWCqmd+qUQmmUfxC/lY+UyyzAL+kSH6alEQY5VfX64hm0FFgBqWMaSJllTAfUA50/pxXXo/tJog6As8h3Mljsqm3cyCz0hi1Ctb5cdpVGmKherwGGgKfHRdR/fft3jbZ0t2z2lEDleARo8MMnWLLXKITDTsQUZztSxdXA2RnXSoyRdDzv1iLswSgF+WgsJnw2qdPHsDDeHBpmSD7Fbv6LAZF+6wzzJlctg=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const invalidDigestHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=__invalid__",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId/activity#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="E4xXrCrDwMfcdyVopZCV/xAOCtNYhCpJvbcC9pM+Rv+hXpgtLNsIce0b0sv0t268/IjyR+ZP0gFsiY4MtzYbjO9Q3GXw2g+dF9IMDFrApmtfC9nrSWCqmd+qUQmmUfxC/lY+UyyzAL+kSH6alEQY5VfX64hm0FFgBqWMaSJllTAfUA50/pxXXo/tJog6As8h3Mljsqm3cyCz0hi1Ctb5cdpVGmKherwGGgKfHRdR/fft3jbZ0t2z2lEDleARo8MMnWLLXKITDTsQUZztSxdXA2RnXSoyRdDzv1iLswSgF+WgsJnw2qdPHsDDeHBpmSD7Fbv6LAZF+6wzzJlctg=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const invalidHostHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "invalid.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId/activity#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="E4xXrCrDwMfcdyVopZCV/xAOCtNYhCpJvbcC9pM+Rv+hXpgtLNsIce0b0sv0t268/IjyR+ZP0gFsiY4MtzYbjO9Q3GXw2g+dF9IMDFrApmtfC9nrSWCqmd+qUQmmUfxC/lY+UyyzAL+kSH6alEQY5VfX64hm0FFgBqWMaSJllTAfUA50/pxXXo/tJog6As8h3Mljsqm3cyCz0hi1Ctb5cdpVGmKherwGGgKfHRdR/fft3jbZ0t2z2lEDleARo8MMnWLLXKITDTsQUZztSxdXA2RnXSoyRdDzv1iLswSgF+WgsJnw2qdPHsDDeHBpmSD7Fbv6LAZF+6wzzJlctg=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const invalidSignatureHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId/activity#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="__invalid__"`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const unSupportedAlgorithmHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId/activity#main-key",algorithm="rsa-sha512",headers="(request-target) host date digest",signature="E4xXrCrDwMfcdyVopZCV/xAOCtNYhCpJvbcC9pM+Rv+hXpgtLNsIce0b0sv0t268/IjyR+ZP0gFsiY4MtzYbjO9Q3GXw2g+dF9IMDFrApmtfC9nrSWCqmd+qUQmmUfxC/lY+UyyzAL+kSH6alEQY5VfX64hm0FFgBqWMaSJllTAfUA50/pxXXo/tJog6As8h3Mljsqm3cyCz0hi1Ctb5cdpVGmKherwGGgKfHRdR/fft3jbZ0t2z2lEDleARo8MMnWLLXKITDTsQUZztSxdXA2RnXSoyRdDzv1iLswSgF+WgsJnw2qdPHsDDeHBpmSD7Fbv6LAZF+6wzzJlctg=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};
