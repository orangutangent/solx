/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solx.json`.
 */
export type Solx = {
  "address": "9J4UHWXz5UrGZtr9KZBF6W4TD1JxcnLNCdN2rS7ANTCJ",
  "metadata": {
    "name": "solx",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createAuthor",
      "discriminator": [
        98,
        62,
        128,
        218,
        152,
        25,
        231,
        157
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "bio",
          "type": "string"
        }
      ]
    },
    {
      "name": "createPost",
      "discriminator": [
        123,
        92,
        184,
        29,
        231,
        24,
        15,
        202
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "author"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "timestamp",
          "type": "i64"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "deletePost",
      "discriminator": [
        208,
        39,
        67,
        161,
        55,
        13,
        153,
        42
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "author"
              }
            ]
          }
        },
        {
          "name": "post",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  115,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "author"
              },
              {
                "kind": "arg",
                "path": "id"
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "author"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "id",
          "type": "u64"
        }
      ]
    },
    {
      "name": "editBio",
      "discriminator": [
        195,
        168,
        147,
        223,
        191,
        152,
        141,
        64
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "author"
          ]
        }
      ],
      "args": [
        {
          "name": "bio",
          "type": "string"
        }
      ]
    },
    {
      "name": "editName",
      "discriminator": [
        234,
        251,
        223,
        86,
        25,
        161,
        11,
        123
      ],
      "accounts": [
        {
          "name": "author",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "author"
          ]
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "follow",
      "discriminator": [
        161,
        61,
        150,
        122,
        164,
        153,
        0,
        18
      ],
      "accounts": [
        {
          "name": "follower",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "follower"
          ]
        },
        {
          "name": "followed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "authorKey"
              }
            ]
          }
        },
        {
          "name": "followRelation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "authorKey"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "authorKey",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "unfollow",
      "discriminator": [
        122,
        47,
        24,
        161,
        12,
        85,
        224,
        68
      ],
      "accounts": [
        {
          "name": "follower",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "follower"
          ]
        },
        {
          "name": "followed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "authorKey"
              }
            ]
          }
        },
        {
          "name": "followRelation",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "arg",
                "path": "authorKey"
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "authorKey",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "author",
      "discriminator": [
        136,
        201,
        168,
        93,
        108,
        12,
        36,
        134
      ]
    },
    {
      "name": "followRelation",
      "discriminator": [
        27,
        1,
        227,
        0,
        25,
        161,
        204,
        144
      ]
    },
    {
      "name": "post",
      "discriminator": [
        8,
        147,
        90,
        186,
        185,
        56,
        192,
        150
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "canNotFollowYourself",
      "msg": "You cannot follow yourself"
    },
    {
      "code": 6001,
      "name": "overflow",
      "msg": "Overflow occurred"
    },
    {
      "code": 6002,
      "name": "canNotUnfollow",
      "msg": "You cannot unfollow this author"
    },
    {
      "code": 6003,
      "name": "nameTooLong",
      "msg": "Name is too long"
    },
    {
      "code": 6004,
      "name": "bioTooLong",
      "msg": "Bio is too long"
    },
    {
      "code": 6005,
      "name": "contentTooLong",
      "msg": "Content is too long"
    },
    {
      "code": 6006,
      "name": "postNotFound",
      "msg": "Post not found"
    },
    {
      "code": 6007,
      "name": "canNotDeletePost",
      "msg": "You cannot delete this post"
    },
    {
      "code": 6008,
      "name": "invalidTimestamp",
      "msg": "Invalid timestamp"
    }
  ],
  "types": [
    {
      "name": "author",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bio",
            "type": "string"
          },
          {
            "name": "postCount",
            "type": "u64"
          },
          {
            "name": "followers",
            "type": "u64"
          },
          {
            "name": "following",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "followRelation",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "follower",
            "type": "pubkey"
          },
          {
            "name": "followed",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "post",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "pubkey"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
