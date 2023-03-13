![eventlog](https://user-images.githubusercontent.com/124432361/224667094-06302e95-6a82-4bfb-8d31-6c13d1ae3d38.png)

# Node Event Logger

An event logger using nodejs, it lets you listen to the on-chain events emitted when transaction occur, and save the information in firestore database.

## Requirements
* NodeJs

## Installing the project

To install the project, first clone the repo and run the following on the directory where you save the project:
```
npm install
```
Or if you're using yarn:
```
yarn install
```
After you run the above command, create a key.json file in the directory. This key.json file is your firebase-admin key. Generate private key from your firebase project and paste the value inside the key.json file.

Next, create .env.remotenode file. This .env.remotenode file contains the contract address you want to listen to, the provider you're using, and the firebase collection name.
You can add more .env file and name it as your needs, don't forget to update package.json script if you're adding more .env files.
The .env file format looks like this:
```
CONTRACT_ADDRESS=<contract_address_here>
PROVIDER=<provider you are using, you can use http:// provider or ws:// provider>
COLLECTION=<the name of firebase collection you want to use>
```

## Run the project
To start the logger, run the following:
```
npm run start-remotenode
```
Or using yarn:
```
yarn start-remotenode
```
You can tweak the package.json script if you're using different .env file name. This project use custom-env library to manage environment variables.
