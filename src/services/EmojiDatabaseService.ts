
import * as Discord from 'discord.js';
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { Emoji } from '../entity/Emoji';
import { createConnection } from 'typeorm';
import { Logger } from '../services/Logger';
import { DatabaseService } from '../services/DatabaseService';

@Singleton
@AutoWired
export class EmojiDatabaseService extends BaseService {

  @Inject private logger: Logger;
  @Inject private databaseService: DatabaseService;

  public async init(client: Discord.Client) {
    super.init(client);
  }

  // Add emoji to the db, also add to
  async dbadd(emoji: Discord.Emoji | Discord.ReactionEmoji, user: Discord.User, message: Discord.Message, isReact = false) {
    const emojiEntity = new Emoji();

    emojiEntity.emojiid = emoji.id;
    emojiEntity.emojiname = emoji.name;
    emojiEntity.username = user.username;
    emojiEntity.userid = user.id;
    emojiEntity.reaction = isReact;
    emojiEntity.serverid = message.guild.id;
    emojiEntity.messageid = message.id;
    emojiEntity.time = Date.now();

    try {
      await this.databaseService.getRepository(Emoji).save(emojiEntity);
      if (isReact) {
        this.logger.log(`Reaction: ${emoji.name} by ${user.username} in ${message.guild.name} added.`);
      } else {
        this.logger.log(`Emoji: ${emoji.name} by ${user.username} in ${message.guild.name} added.`);
      }
    } catch (e) {
      this.logger.error('Error in adding emoji to db: ', e);
    }
  }

  async reactionadd(emoji: Discord.Emoji | Discord.ReactionEmoji, user: Discord.User, message: Discord.Message) {
    await this.dbadd(emoji, user, message, true);
  }

  // Delete emoji from the db, used for TTL and Reaction removal
  // Is this used for anything aside from reactions? TTL can have separate function.
  async reactionremove(emoji: Discord.Emoji | Discord.ReactionEmoji, user: Discord.User, message: Discord.Message) {
    try {

      await this.databaseService.getRepository(Emoji).delete({
        emojiname: emoji.name,
        userid: user.id,
        messageid: message.id,
        reaction: true
      });
      this.logger.log(`Reaction: ${emoji.name} by ${user.username} in ${message.guild.name} deleted.`);
    } catch (e) {
      this.logger.error('Error removing reaction: ', e);
    }

  }

  async printEmojis() {
    let allEmojis = await this.databaseService.getRepository(Emoji).find();
    this.logger.log(allEmojis);
  }

  // Lookup methods. Must include time frame.
  // Get server data
  async serverLookup(serverid: string, reaction = false) {
    let query = this.databaseService.getRepository(Emoji)
      .createQueryBuilder('Emoji')
      .select('emoji.emojiname')
      .addSelect('emoji.emojiid')
      .addSelect('COUNT(*) AS count')
      .where(`emoji.serverid = ${serverid}`)
      .groupBy('emoji.emojiname')
      .orderBy('count', 'ASC');

    if (reaction) {
        query.andWhere('emoji.reaction = true');
    }

    return await query.getRawMany();
  }

  // get user data
  async userLookup(userid: string, serverid: string, reaction = false) {
    let query = this.databaseService.getRepository(Emoji)
      .createQueryBuilder('Emoji')
      .select('emoji.emojiname')
      .addSelect('emoji.emojiid')
      .addSelect('COUNT (*) AS count')
      .where(`emoji.userid = ${userid}`)
      .andWhere(`emoji.serverid = ${serverid}`)
      .groupBy('emoji.emojiname')
      .orderBy('count', 'ASC');

    if (reaction) {
        query.andWhere('emoji.reaction = true');
    }

    return await query.getRawMany();
  }

  // get emoji data
  async emojiLookup(emojiname: string, serverid: string, reaction = false) {
    let query = this.databaseService.getRepository(Emoji)
      .createQueryBuilder('Emoji')
      .select('emoji.username')
      .addSelect('COUNT (*) AS count')
      .where(`emoji.emojiname = '${emojiname}'`)
      .andWhere(`emoji.serverid = ${serverid}`)
      .groupBy('emoji.userid')
      .orderBy('count', 'ASC');

    if (reaction) {
        query.andWhere('emoji.reaction = true');
    }

    return await query.getRawMany();
  }

  // get reaction data
  /*async reactionLookup(serverid: string) {
    return await this.databaseService.getRepository(Emoji)
      .createQueryBuilder('Emoji')
      .select('emoji.emojiname')
      .addSelect('emoji.emojiid')
      .addSelect('COUNT(*) AS count')
      .where(`emoji.serverid = ${serverid}`)
      .andWhere(`emoji.reaction = true`)
      .groupBy('emoji.emojiname')
      .orderBy('count', 'ASC')
      .getRawMany();
  } */

  // get reaction by user data
  /*async reactionUserLookup(userid: string, serverid: string) {
    return await this.databaseService.getRepository(Emoji)
      .createQueryBuilder('Emoji')
      .select('emoji.emojiname')
      .addSelect('emoji.emojiid')
      .addSelect('COUNT (*) AS count')
      .where(`emoji.userid = ${userid}`)
      .andWhere(`emoji.serverid = ${serverid}`)
      .andWhere('emoji.reaction = true')
      .groupBy('emoji.emojiname')
      .orderBy('count', 'ASC')
      .getRawMany();
  }*/

  // getEmojiCount
  async constructEmojiCount() {

  }
}
// TODO: Make reaction just a specific class of general.emoji
// Optional reaction parameter. If parameter, then append reaction == true
