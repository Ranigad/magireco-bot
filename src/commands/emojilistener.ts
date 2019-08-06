
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { DatabaseService } from '../services/DatabaseService';
import { Logger } from '../services/Logger';

@Singleton
@AutoWired
export class emojilistener implements ICommand {

  @Inject private databaseService: DatabaseService;

  async onMessage(message: Discord.Message) {


  }

  async onEmojiAdd(reaction: Discord.MessageReaction, user: Discord.User) {
    databaseService.

  }

  async onEmojiRemove(reaction: Discord.MessageReaction, user: Discord.User) {


  }
}
