// relayActivity.spec.tsからコピー
export const expectedHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=ySrhIrb8czKTX2m+5iuJSdbLugtcILvQdV2rXGCxls8=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/userId#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="i335/DHLc9AVBH8vUEyucyC6hfQGdp0iBaD01FWdyrmJYjwr3cyvmzDJPg931z6wK01T2ef6VDq/VrvvR6qfXw8/e3Sx/iGgt34eNs6OS4Oen/qjgXk4Baq4zMdzMiijCXNcS956NG1UMYMZx6h8OgYsqtleoTlaRc/RLdDLiZgLk1uI/uxdyZgrh1dgQkAASMBTxVaWA5lO5me78JOKpRSgb5V/yQQHvHbqnwCMefF0x96wZ8LZjEKq3+8c9Rb2s4F7BQMrt5NnhvEl/Jz7wuF8VRn6zudyv3DQBIGWCuJlDdG/9etcRmtjAFEiI9itcyONIr90++WBy6vrUw=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const otherSignedHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=Gwtaf2C1j/hnbwtC6f37u2T6SiitMcs15298sjIcR5w=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="jKd5MWWaxNkuXfLrV+hnhs2xOJ0DOI7rcQFjOa9eTKw0UI83AKLn+AfMAEWGZjO97jYP5OvTk2gjOeJZ2imo3E4KnfrfUH1MG2GwhJQjhpjeAu6oluzZZ1Ct8Qjz1kf25ZvlMAO8qbpoMcvwedOAw9wpDgZagddm/y/xCMCaCOYb3P4n4Zinv/k+EcAnVWjPFm+i3optmghZ9gQST8D4LG3Trzv/JsWhhwFTs9BhVH8MaXM33ELn1KPw2ECX7bx4YMG105uaRmLDM1tmxMDPjQZb43fX0TQEbtK0ohQ56upOpGCds/B2F0iGsx+zMsUzObxQVS3E9HPAC76xpQ=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const noKeyIdHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=ySrhIrb8czKTX2m+5iuJSdbLugtcILvQdV2rXGCxls8=",
  host: "remote.example.com",
  signature: `algorithm="rsa-sha256",headers="(request-target) host date digest",signature="DJ1f8IMyMucicl6MbEMUIMX59omtgeHNyRhNY4sO+3kN9PXdoyjkCiDRf6nrOr2gBRYwGaLlFsGx8B30vBnR62ScOd3pBsAOcxZftDA8ssySQFJpXt9yEQa8aX1Q4TqAG7dH4YHmIRd8RSt4NkcE/USIxis8AsALREQBUfC/QMI1c0EH/KkzFQAHdyET9xc/8+ORVxoIKWORZSxl9FP+7VF04tasu2U35IebrK8uclvICbjFEJoqRlXZ8PkfXltzwY9cqdlHdtZg14mmuO5lZmf1yzhilQdW0hnq7NPfKaGuxGXaQ9aJ1hY33wrH7T69H4fAJNVXIJoZHGLVwQ=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const noAlgorithmHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=ySrhIrb8czKTX2m+5iuJSdbLugtcILvQdV2rXGCxls8=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId#main-key",headers="(request-target) host date digest",signature="DJ1f8IMyMucicl6MbEMUIMX59omtgeHNyRhNY4sO+3kN9PXdoyjkCiDRf6nrOr2gBRYwGaLlFsGx8B30vBnR62ScOd3pBsAOcxZftDA8ssySQFJpXt9yEQa8aX1Q4TqAG7dH4YHmIRd8RSt4NkcE/USIxis8AsALREQBUfC/QMI1c0EH/KkzFQAHdyET9xc/8+ORVxoIKWORZSxl9FP+7VF04tasu2U35IebrK8uclvICbjFEJoqRlXZ8PkfXltzwY9cqdlHdtZg14mmuO5lZmf1yzhilQdW0hnq7NPfKaGuxGXaQ9aJ1hY33wrH7T69H4fAJNVXIJoZHGLVwQ=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const noHeadersHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=ySrhIrb8czKTX2m+5iuJSdbLugtcILvQdV2rXGCxls8=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId#main-key",algorithm="rsa-sha256",signature="DJ1f8IMyMucicl6MbEMUIMX59omtgeHNyRhNY4sO+3kN9PXdoyjkCiDRf6nrOr2gBRYwGaLlFsGx8B30vBnR62ScOd3pBsAOcxZftDA8ssySQFJpXt9yEQa8aX1Q4TqAG7dH4YHmIRd8RSt4NkcE/USIxis8AsALREQBUfC/QMI1c0EH/KkzFQAHdyET9xc/8+ORVxoIKWORZSxl9FP+7VF04tasu2U35IebrK8uclvICbjFEJoqRlXZ8PkfXltzwY9cqdlHdtZg14mmuO5lZmf1yzhilQdW0hnq7NPfKaGuxGXaQ9aJ1hY33wrH7T69H4fAJNVXIJoZHGLVwQ=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const noSignatureHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=ySrhIrb8czKTX2m+5iuJSdbLugtcILvQdV2rXGCxls8=",
  host: "remote.example.com",
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const unSupportedDigestHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-512=GJpn7Z0rhlxi7/yIwjEeQln6ix6FqsnOBpzQ156l7mM=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="DJ1f8IMyMucicl6MbEMUIMX59omtgeHNyRhNY4sO+3kN9PXdoyjkCiDRf6nrOr2gBRYwGaLlFsGx8B30vBnR62ScOd3pBsAOcxZftDA8ssySQFJpXt9yEQa8aX1Q4TqAG7dH4YHmIRd8RSt4NkcE/USIxis8AsALREQBUfC/QMI1c0EH/KkzFQAHdyET9xc/8+ORVxoIKWORZSxl9FP+7VF04tasu2U35IebrK8uclvICbjFEJoqRlXZ8PkfXltzwY9cqdlHdtZg14mmuO5lZmf1yzhilQdW0hnq7NPfKaGuxGXaQ9aJ1hY33wrH7T69H4fAJNVXIJoZHGLVwQ=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const invalidDateHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:01 GMT",
  digest: "SHA-256=ySrhIrb8czKTX2m+5iuJSdbLugtcILvQdV2rXGCxls8=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="DJ1f8IMyMucicl6MbEMUIMX59omtgeHNyRhNY4sO+3kN9PXdoyjkCiDRf6nrOr2gBRYwGaLlFsGx8B30vBnR62ScOd3pBsAOcxZftDA8ssySQFJpXt9yEQa8aX1Q4TqAG7dH4YHmIRd8RSt4NkcE/USIxis8AsALREQBUfC/QMI1c0EH/KkzFQAHdyET9xc/8+ORVxoIKWORZSxl9FP+7VF04tasu2U35IebrK8uclvICbjFEJoqRlXZ8PkfXltzwY9cqdlHdtZg14mmuO5lZmf1yzhilQdW0hnq7NPfKaGuxGXaQ9aJ1hY33wrH7T69H4fAJNVXIJoZHGLVwQ=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const invalidHostHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=ySrhIrb8czKTX2m+5iuJSdbLugtcILvQdV2rXGCxls8=",
  host: "invalid.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="DJ1f8IMyMucicl6MbEMUIMX59omtgeHNyRhNY4sO+3kN9PXdoyjkCiDRf6nrOr2gBRYwGaLlFsGx8B30vBnR62ScOd3pBsAOcxZftDA8ssySQFJpXt9yEQa8aX1Q4TqAG7dH4YHmIRd8RSt4NkcE/USIxis8AsALREQBUfC/QMI1c0EH/KkzFQAHdyET9xc/8+ORVxoIKWORZSxl9FP+7VF04tasu2U35IebrK8uclvICbjFEJoqRlXZ8PkfXltzwY9cqdlHdtZg14mmuO5lZmf1yzhilQdW0hnq7NPfKaGuxGXaQ9aJ1hY33wrH7T69H4fAJNVXIJoZHGLVwQ=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const invalidSignatureHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=ySrhIrb8czKTX2m+5iuJSdbLugtcILvQdV2rXGCxls8=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="__invalid__"`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};

export const unSupportedAlgorithmHeader = {
  accept: "application/activity+json",
  "content-type": "application/json",
  date: "Wed, 01 Jan 2020 00:00:00 GMT",
  digest: "SHA-256=ySrhIrb8czKTX2m+5iuJSdbLugtcILvQdV2rXGCxls8=",
  host: "remote.example.com",
  signature: `keyId="https://myhost.example.com/users/dummy_userId#main-key",algorithm="rsa-sha512",headers="(request-target) host date digest",signature="DJ1f8IMyMucicl6MbEMUIMX59omtgeHNyRhNY4sO+3kN9PXdoyjkCiDRf6nrOr2gBRYwGaLlFsGx8B30vBnR62ScOd3pBsAOcxZftDA8ssySQFJpXt9yEQa8aX1Q4TqAG7dH4YHmIRd8RSt4NkcE/USIxis8AsALREQBUfC/QMI1c0EH/KkzFQAHdyET9xc/8+ORVxoIKWORZSxl9FP+7VF04tasu2U35IebrK8uclvICbjFEJoqRlXZ8PkfXltzwY9cqdlHdtZg14mmuO5lZmf1yzhilQdW0hnq7NPfKaGuxGXaQ9aJ1hY33wrH7T69H4fAJNVXIJoZHGLVwQ=="`,
  "user-agent": "Unsocial/1.2.3 (myhost.example.com)",
};
