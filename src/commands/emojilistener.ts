
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { EmojiDatabaseService } from '../services/EmojiDatabaseService';
import { Logger } from '../services/Logger';

@Singleton
@AutoWired
export class emojilistener implements ICommand {

  @Inject private emojiDatabaseService: EmojiDatabaseService;
  @Inject private logger: Logger;

  help = 'Listener for emoji data';
  aliases = ['emoji'];

  async execute(args: ICommandArgs): Promise<ICommandResult> {
    this.emojiDatabaseService.printEmojis();

    return { };
  }

  async onMessage(message: Discord.Message) {


  }

  async onEmojiAdd(reaction: Discord.MessageReaction, user: Discord.User) {
    const emoji = reaction.emoji;
    // Only add if reaction in server and custom emoji
    if (reaction.message.channel instanceof Discord.TextChannel && emoji.id) {
      this.emojiDatabaseService.reactionadd(emoji.name, emoji.id, user.username, user.id, reaction.message.guild.id, reaction.message.id);
    } else {
      this.logger.error(`${emoji.name} not added`);
    }
  }

  async onEmojiRemove(reaction: Discord.MessageReaction, user: Discord.User) {
    // Only remove if reaction in server and custom emoji
    const emoji = reaction.emoji;
    if (reaction.message.channel instanceof Discord.TextChannel && emoji.id) {
      this.emojiDatabaseService.reactionremove(emoji.name, user.id, reaction.message.id);
    } else {
      this.logger.error(`${emoji.name} not deleted`);
    }
  }
}
