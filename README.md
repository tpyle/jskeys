# JSKeys
JSKeys is a simple key manager for the command line. It supports a number of options, including a remote server for backing up and mainting a consistent password base across multiple machines.

## Usage
JSKeys follows the pattern of:
`node jskeys.js <mode> [other args]`

Where mode takes one of the following:
* `add`
* `remove`
* `create`
* `update`
* `pin`
* `lookup`
* `dump`
* `change`

Each of these has their own options, described in the 'Description' section.

## Configuration
JSKeys expects a config.json, located in the user's home directory, under '.jskeys'. If that folder does not exist, it will make one itself.
Config.json specifies the following values:
1. keys_file - The location to store the keys, relative to `~/.jskeys/`
2. token_file - The file which contains the token used for the remote server, also relative
3. key_server - The IP/DNS name of the server to be used.

If the token or key_server are empty, they will not be used.  
If the keys_file is not specified, it defaults to ~/.jskeys/.keys.

## Description
### 1. `add`
`node jskeys add <location> <password>`

Adds a password and location pair that was created elsewhere

`<location>` The location the password belongs to
`<password>` The password for that location

### 2. `remove`

`node jskeys remove <location>`

Removes the entry for the given location

`<location>` The location to remove

### 3. `update`
`node jskeys update <location> [password] [-n <numbers>] [-s <specials>] [-u <uppercases>] [-l <length>] [--specials <speciallist>]` 

Updates the entry for a given location, either with a provided password, or it will create a new one. If a password is provided, it will not attempt to generate a new one.

`<location>` The location to update
`[password]` The password to use now
`[n <numbers>=4]` The amount of numbers to use in the password
`[s <specials>=4]` The amount of special characters to use in the password
`[u <uppercases>=4]` The amount of uppercase letters to use in the password
`[l <length>=16]` The length of the password
`[specials <speciallist>=!@#$%^&*]` The valid special characters

### 4. `create`
`node jskeys create <location> [-n <numbers>] [-s <specials>] [-u <uppercases>] [-l <length>] [--specials <speciallist>]`

Creates a new password for the given location

`<location>` The location to create a password for
`[n <numbers>=4]` The amount of numbers to use in the password
`[s <specials>=4]` The amount of special characters to use in the password
`[u <uppercases>=4]` The amount of uppercase letters to use in the password
`[l <length>=16]` The length of the password
`[specials <speciallist>=!@#$%^&*]` The valid special characters

### 5. `pin`
`node jskeys pin <location> [-l <length>]`

Creates a new pin for the given location

`<location>` The location to create a pin for
`[l <length>=4]` The length of the pin

### 6. `lookup`
`node jskeys.js lookup <location> [-n]`

Lookups the password for the given location

`<location>` The location to lookup
`[n]` Don't use a newline when printing

### 7. `dump`
`node jskeys.js dump [-j]`

Dumps out all information

`[j]` Print out data in JSON form instead of as a table

### 8. `change`
`node jskeys.js change`

Change the password used for encryption.
