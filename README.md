# Bulk disable of Rocket.Chat users

Install node dependencies.
```
npm i
```

Copy *config.json* to *config.local.json* and put you local config there.

Copy *exclude.json* to *exclude.local.json* and put the list of users you want
to exclude.

Execute the main script.
```
node index.js
```

## Links

 * https://developer.rocket.chat/reference/api/rest-api/endpoints/core-endpoints/users-endpoints