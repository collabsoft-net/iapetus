# IAPETUS

Collabsoft shared logic

## Prerequisites

- Yarn (if you don't have it `npm i -g yarn`)
- .npmrc specifying the collabsoft pkg repository and auth token

## Known gotchas

- Make sure to use at least typescript 4.4.3 to deal with the typings
- The way npm/yarn resolves dependencies could result in conflicts if you include a package in /connect as well as /functions

## Install

yarn add @collabsoft-net/types
yarn add @collabsoft-net/enums
yarn add @collabsoft-net/entities
yarn add @collabsoft-net/emitters
yarn add @collabsoft-net/connect
yarn add @collabsoft-net/dto
yarn add @collabsoft-net/helpers
yarn add @collabsoft-net/validators
yarn add @collabsoft-net/inversify
yarn add @collabsoft-net/clients
yarn add @collabsoft-net/repositories
yarn add @collabsoft-net/services
yarn add @collabsoft-net/functions
yarn add @collabsoft-net/services
yarn add @collabsoft-net/controllers
yarn add @collabsoft-net/strategies
yarn add @collabsoft-net/middleware
yarn add @collabsoft-net/components
