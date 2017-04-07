# WebAPIServer
Web API Server hosting, compiling and executing of Monkkey projects.

## Project architecture

```
server           # Server-side files
|:: bin          # | Compiled files
|:: src          # | Source files
client           # Client-side files
|:: bin          # | Compiled files
|:: src          # | Source files
public           # Public files
|:: bin          # | Public destination folder
|:: src          # | Public source folder
    |:: styles   #   | Style files
    |:: views    #   | HTML pages
config.json      # Server configuration file
```

## Installation

```bash
npm install -g dev-watch typescript node-sass browserify
npm run build
```

## Usage

```bash
npm start
```

## Types

Sub-project | Type
-|-
Server side source(s) | `TypeScript`
Client side source(s) | `TypeScript`
HTML source(s) | `HTML`
Style source(s) | `SCSS`
Icons | `SVG`

## Short road-map

* Transform the project into TypeScript for a better maintainability
* Check user management
  * Check user addition
  * Check user connection
  * Check user disconnection
  * Check user rights to publish
* Add a better log manager
* Better separate the core and the API
* Separated development (not compiled) files and compiled files (~ resulting standalone folder)
* Complete the README.md file
* Add 'Framework image' compilation (OS image -> Framwork image -> Exercice image)
