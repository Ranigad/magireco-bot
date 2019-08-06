
import * as Discord from 'discord.js';
import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { Emoji } from '../entity/Emoji';
import { createConnection } from "typeorm";

@Singleton
@AutoWired
export class DatabaseService extends BaseService {

  async init(client: Discord.Client) {
    this.client = client;
    this.dbclient = await.createConnection({
      type: "sqlite",
      host: "localhost",
      database: "emoji",  // Pass this in?
      entities: [
        Emoji
      ],
      synchronize: true,
      logging: false
    });
    this.emojiRepository = dbclient.getRepository(Emoji);

    this.regex = /\<a?\:([\w]{2,})\:([\d]+)\>/g;
  }

  // Add emoji to the db, also add to
  async dbadd() {

  }

  // Delete emoji from the db, used for TTL and Reaction removal
  async dbremove() {

  }

  // Get server data
  async serverLookup() {


  }

  // get user data
  async userLookup() {


  }

  // get emoji data
  async emojiLookup() {


  }

  // get reaction data
  async reactionLookup() {


  }

  // get reaction by user data
  async reactionUserLookup() {


  }

  // getEmojiCount
  async constructEmojiCount() {


  }
}
