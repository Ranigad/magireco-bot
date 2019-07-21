
import * as Discord from 'discord.js';

import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { EmojiService } from '../services/EmojiService';
import { Logger } from '../services/logger';
import { ReactService } from '../services/ReactService';
import { ErrorMessageService } from '../services/ErrorMessageService';
import { Channel, DMChannel, GroupDMChannel, Message, TextChannel } from 'discord.js';

@Singleton
@AutoWired
export class ReactCommand implements ICommand {

  help = 'React to the message immediately above the command or react to a specific' +
    'message with a message-id\n' +
    '**Usage**\n' +
    'react message-id emoji-name - reacts to a specific message\n' +
    'react emoji-name - reacts to the above message\n' +
    '**Supported Servers**\n' +
    'PMMM: Magia Record\n' +
    '/r/MadokaMagica\n' +
    'Madoka\'s Disciples\n' +
    'Magireco Emotes for Discord Whales\n' +
    'and other partnered Emoji servers';
  aliases = ['react', 'r'];

  @Inject private logger: Logger;
  @Inject private emojiService: EmojiService;
  @Inject private reactService: ReactService;
  @Inject private errorMessageService: ErrorMessageService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const {message, args} = cmdArgs;

    const commandArgs = args.split(' ');

    // Args should only be length 1 or 2
    if (commandArgs.length !== 1 && commandArgs.length !== 2) {
      // Error, number of arguments doesn't match
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  You must either include an emoji name or a message-id and then an emoji name!');
      if (message.deletable) {
        await message.delete(1000);
      }
      return {resultString: 'Argument error occurred', result: {success: false}};
    }

    if (commandArgs.length === 1) {
      return await this.reactNow(commandArgs[0], message);
    } else {
      return await this.reactToMessage(commandArgs[0], commandArgs[1], message);
    }
  }

  /**
   * React to the message immediately above
   * @param emojiName - The emoji name
   * @param message - The command message
   */
  async reactNow(emojiName: string, message: Discord.Message): Promise<ICommandResult> {
    const emoji = this.emojiService.getEmojiByName(emojiName);

    if (!emoji) {
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  Could not find that emoji!');
      if (message.deletable) {
        await message.delete(1000);
      }
      return { resultString: 'Could not find the emoji', result: {success: false}};
    }

    let fetchedMessage: Discord.Collection<string, Message> = await message.channel
      .fetchMessages({limit: 1, before: message.id});
    if (!fetchedMessage || !(fetchedMessage instanceof Discord.Collection) ||
      !(fetchedMessage.array()) || fetchedMessage.array().length < 1) {
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  Could not find a message to react to!');
      if (message.deletable) {
        await message.delete(1000);
      }
      return {resultString: 'Could not find target message', result: {success: false}};
    }

    const targetMessage = fetchedMessage.array()[0];

    const success = await this.reactService.tempReactToMessage(targetMessage, emoji, message);

    if (success === false) {
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  Could not apply the reaction!');
      if (message.deletable) {
        await message.delete(1000);
      }
      return {resultString: 'Could not apply the reaction', result: {success: false}};
    }

    return {};
  }

  /**
   * React to a specific message given by its Id
   * @param messageId - The Id of the specific message
   * @param emojiName - The name of the emoji
   * @param message - The command message
   */
  async reactToMessage(messageId: string, emojiName: string, message: Discord.Message): Promise<ICommandResult> {
    const emoji = this.emojiService.getEmojiByName(emojiName);

    if (!emoji) {
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  Could not find that emoji!');
      if (message.deletable) {
        await message.delete(1000);
      }
      return { resultString: 'Could not find the emoji', result: {success: false}};
    }

    let initialId = message.channel.id;
    let channels: Channel[] = [];
    channels.push(message.channel);

    // Get all guild channels if in a guild chat
    if (message.channel.type === 'text') {
      let guild = message.guild;
      guild.channels.forEach((guildChannel) => {
        if (guildChannel.type === 'text' && guildChannel.id !== initialId) {
          channels.push(guildChannel as TextChannel);
        }
      });
    }

    // Loop through channels to try to apply emoji
    let success = false;
    while (channels.length > 0) {
      let channel = channels.shift();
      let textBasedChannel = channel as TextChannel | DMChannel | GroupDMChannel;
      if (!textBasedChannel || !textBasedChannel.lastMessageID) { continue; }
      try {
        let targetMessage = await textBasedChannel.fetchMessage(messageId);

        let applied = await this.reactService.tempReactToMessage(targetMessage,
          emoji, message);

        if (applied) {
          success = true;
          break;
        }
      } catch (ex) {
        // continue
      }
    }

    if (success === false) {
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  Could not find a message to react to!');
      if (message.deletable) {
        await message.delete(1000);
      }
      return {resultString: 'Could not find target message', result: {success: false}};
    }

    return {};
  }

}
