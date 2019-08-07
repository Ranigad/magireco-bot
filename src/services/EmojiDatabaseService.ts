
import * as Discord from 'discord.js';
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { Emoji } from '../entity/Emoji';
import { createConnection } from "typeorm";
import { Logger } from '../services/Logger';

@Singleton
@AutoWired
export class EmojiDatabaseService extends BaseService {

  @Inject private logger: Logger;

  private dbclient;
  private emojiRepository;
  private regex = /\<a?\:([\w]{2,})\:([\d]+)\>/g;

  public async init(client: Discord.Client) {
    super.init(client);
    // Does this work as a non async call? Constructor is not asynchronous
    this.dbclient = await createConnection({
      type: "sqlite",
      database: "../data/magireco.sqlite",  // Pass this in?
      entities: [
        Emoji
      ],
      synchronize: true,
      logging: false
    });
    this.emojiRepository = this.dbclient.getRepository(Emoji);
  }

  // Add emoji to the db, also add to
  async dbadd(emojiname: string, emojiid: string, username: string, userid: string, serverid: string, messageid: string, reaction: boolean) {
    const emoji = new Emoji();

    emoji.emojiid = emojiid;
    emoji.emojiname = emojiname;
    emoji.username = username;
    emoji.userid = userid;
    emoji.reaction = reaction;
    emoji.serverid = serverid;
    emoji.messageid = messageid;
    emoji.time = new Date().getTime();

    try {
      await this.emojiRepository.save(emoji);
      this.logger.log("Emoji added");
    } catch(e) {
      this.logger.error("Error in adding emoji to db: ", e);
    }
  }

  async reactionadd(emojiname: string, emojiid: string, username: string, userid: string, serverid: string, messageid: string) {
    await this.dbadd(emojiname, emojiid, username, userid, serverid, messageid, true);
  }

  // Delete emoji from the db, used for TTL and Reaction removal
  // Is this used for anything aside from reactions? TTL can have separate function.
  async reactionremove(emojiname: string, userid: string, messageid: string) {
    try {

      await this.emojiRepository.delete({
        emojiname: emojiname,
        userid: userid,
        messageid: messageid,
        reaction: true
      });
      this.logger.log("Emoji deleted");
    } catch (e) {
      this.logger.error("Error removing reaction: ", e);
    }

  }

  async printEmojis() {
    let allEmojis = await this.emojiRepository.find();
    this.logger.log(allEmojis);
  }

  // Lookup methods. Must include time frame.
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
