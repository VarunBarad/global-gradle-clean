# Global Gradle Clean

This is a node-js script to clean all gradle projects (those which use gradle-wrapper) under a given directory.

## Installation

This module isn't made to be used under another node project/module. But it is supposed to be globally installed on your system as a stand-alone module and then used as a command-line tool whenever required.

To install this globally, run the following command from an admin shell

```shell
npm install -g global-gradle-clean
```

## Usage

There are 2 ways to use this script

1. Running the script from base-directory
2. Running the script from anywhere and passing base-directory as parameter

`<base-dir>` refers to the base directory under which all your gradle projects are stored.

### Running from base-directory

Open `<base-dir>/` from your shell and then execute

```shell
$ global-gradle-clean
```

### Passing base-directory as parameter

Open your shell to any place and then execute

```shell
$ global-gradle-clean "<base-dir>"
```

__Note:__ Surround `<base-dir>` with double-quotes to avoid troubles with paths that might have `space` in them.

## Next steps

- Add file-ignore patterns
