
import * as Discord from 'discord.js';

import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { EmojiService } from '../services/EmojiService';
import { Logger } from '../services/logger';
import { ReactService } from '../services/ReactService';
import { ErrorMessageService } from '../services/ErrorMessageService';
import { Message } from 'discord.js';

// Reacts to given message ID with given emoji name. Deletes after short duration.
@Singleton
@AutoWired
export class ReactNowCommand implements ICommand {

  help = 'React to the message immediately above the command given an emoji name';
  aliases = ['reactnow', 'rn'];

  @Inject private logger: Logger;
  @Inject private emojiService: EmojiService;
  @Inject private reactService: ReactService;
  @Inject private errorMessageService: ErrorMessageService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const {message, args} = cmdArgs;

    const commandArgs = args.split(' ');

    // Args should only be length 1
    if (commandArgs.length !== 1) {
      // Error, number of arguments doesn't match
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  You must include only the emoji name!');
      if (message.deletable){
        await message.delete(1000);
      }
      return { resultString: 'Argument error occurred', result: {success: false}};
    }

    const emojiName = commandArgs[0];

    let fetchedMessage: Discord.Collection<string, Message> = await message.channel
      .fetchMessages({ limit: 1, before: message.id });
    if (fetchedMessage === undefined || !(fetchedMessage instanceof Discord.Collection) ||
      fetchedMessage.array() === undefined || fetchedMessage.array().length < 1) {
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  Could not find a message to react to!');
      await message.delete(1000);
      return { resultString: 'Could not find target message', result: {success: false}};
    }

    const targetMessage = fetchedMessage.array()[0];
    const emoji = this.emojiService.getEmojiByName(emojiName);

    await this.reactService.tempReactToMessage(targetMessage, emoji, message);

    return {};
  }
}
