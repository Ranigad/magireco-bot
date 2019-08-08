
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { EmojiDatabaseService } from '../services/EmojiDatabaseService';
import { EmojiService } from '../services/EmojiService';
import { Logger } from '../services/Logger';

@Singleton
@AutoWired
export class EmojiListener implements ICommand {

  help = 'Listener for emoji data';
  aliases = ['emoji'];

  @Inject private emojiService: EmojiService;
  @Inject private emojiDatabaseService: EmojiDatabaseService;
  @Inject private logger: Logger;

  private emojiRegex = /\<a?\:(?<name>[\w]{2,})\:(?<id>[\d]+)\>/g;  // Regex to parse id and name from emoji in string

  async execute(args: ICommandArgs): Promise<ICommandResult> {
    this.emojiDatabaseService.printEmojis();

    return { };
  }

  async onMessage(message: Discord.Message) {
    let results = this.emojiRegex.exec(message.content);
    while (results) {
      const emoji_name = results.groups.name;
      const emoji = this.emojiService.getEmojiInstance(emoji_name);
      this.emojiDatabaseService.dbadd(emoji, message.author, message);
      results = this.emojiRegex.exec(message.content);
    }
  }

  async onEmojiAdd(reaction: Discord.MessageReaction, user: Discord.User) {
    const emoji = reaction.emoji;
    // Only add if reaction in server and custom emoji
    if (reaction.message.channel instanceof Discord.TextChannel && emoji.id) {
      this.emojiDatabaseService.reactionadd(emoji, user, reaction.message);
    } else {
      this.logger.error(`${emoji.name} not added`);
    }
  }

  async onEmojiRemove(reaction: Discord.MessageReaction, user: Discord.User) {
    // Only remove if reaction in server and custom emoji
    const emoji = reaction.emoji;
    if (reaction.message.channel instanceof Discord.TextChannel && emoji.id) {
      this.emojiDatabaseService.reactionremove(emoji, user, reaction.message);
    } else {
      this.logger.error(`${emoji.name} not deleted`);
    }
  }
}
