
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import * as Discord from 'discord.js';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { Logger } from '../services/Logger';
import { EmojiService } from '../services/EmojiService';
import { EmojiDatabaseService } from '../services/EmojiDatabaseService';

@Singleton
@AutoWired
export class EmojiCommand implements ICommand {

  help = 'Get Emoji usage data by server, user, or emoji';
  aliases = ['emoji', 'e'];

  @Inject private logger: Logger;
  @Inject private emojiService: EmojiService;
  @Inject private emojiDatabaseService: EmojiDatabaseService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;
  }
}
