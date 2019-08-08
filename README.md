
# Magireco Bot

A bot made for the Magireco discord.

## Environment Variables

Put these values in a [`.env`](https://www.npmjs.com/package/dotenv) file.

### Required

* `DISCORD_TOKEN` - the Discord token for the bot.
* `TYPEORM_CONNECTION` - sqlite
* `TYPEORM_SYNCHRONIZE` - true
* `TYPEORM_ENTITIES` - src/entity/*.ts
* `TYPEORM_DATABASE` - the path to the sqlite database, recommend putting in src/data/

### Optional

* `COMMAND_PREFIX` - the command prefix for the bot. Defaults to `!`.
* `IGNORE_PRESENCE` - do not set presence values.
