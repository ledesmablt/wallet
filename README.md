# Wallet

Wallet app / money manager clone running on [Serverless framework](https://serverless.com/) and AWS Amplify. This is my first React app.
<br>You can play around with the project **[here](https://dev.d3pybesfyqwhqx.amplifyapp.com/)**!

## Features
- List, create, modify, delete records (shared "global user" for now)
- Assign categories to records; optional notes
- Calculated balance, income, expenses summary

## Overview
- Client-side API calls and data storage are handled handled by [easy-peasy store](https://easy-peasy.now.sh/).
- Frontend deployed through connecting AWS Amplify to this repository (dev branch).
- Requests are handled server-side by API Gateway which routes endpoints to their respective Lambda functions. These functions interact with DynamoDB, where categories and records are stored.
- Backend deployed using [serverless framework](https://serverless.com/) and manual setup of DynamoDB tables.


## Images
### Home page
![Sample](/public/home-sample.png)

### Modify a record
![Sample](/public/modify-sample.png)