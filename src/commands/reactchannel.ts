
import * as Discord from 'discord.js';

import { Inject, AutoWired, Singleton } from 'typescript-ioc';

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { EmojiService } from '../services/EmojiService';
import { Logger } from '../services/Logger';
import { ReactService } from '../services/ReactService';
import { ErrorMessageService } from '../services/ErrorMessageService';
import { Collection, GuildChannel, Message, TextChannel } from 'discord.js';

@Singleton
@AutoWired
export class ReactChannelCommand implements ICommand {

  help = 'React to the last message in a given channel with a specific emoji\n' +
    '**Usage**\n' +
    'reactchannel channel-name-or-id emoji-name';
  aliases = ['reactchannel', 'rc'];

  @Inject private logger: Logger;
  @Inject private emojiService: EmojiService;
  @Inject private reactService: ReactService;
  @Inject private errorMessageService: ErrorMessageService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const {message, args} = cmdArgs;

    // Can't apply a reaction to a channel when in a DM
    if (message.channel.type !== 'text') {
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  You cannot run this command in this chat!');
      if (message.deletable) {
        await message.delete(1000);
      }
      return {resultString: 'Invalid message channel type', result: {success: false}};
    }

    const commandArgs = args.split(' ');

    // Args should only be length 2
    if (commandArgs.length !== 2) {
      // Error, number of arguments doesn't match
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  You must include a channel name or id and an emoji name!');
      if (message.deletable) {
        await message.delete(1000);
      }
      return {resultString: 'Argument error occurred', result: {success: false}};
    }

    const commandChannel = message.channel as TextChannel;

    const channelIdOrName: string = commandArgs[0];
    const emojiName: string = commandArgs[1];

    if (commandChannel.id === channelIdOrName ||
      commandChannel.name === channelIdOrName) {
      return this.reactNow(emojiName, message);
    }

    const emoji = this.emojiService.getEmojiByName(emojiName);

    if (!emoji) {
      await this.errorMessageService.sendErrorMessage(message.channel,
        'Sorry!  Could not find that emoji!');
      if (message.deletable) {
        await message.delete(1000);
      }
      return { resultString: 'Could not find the emoji', result: {success: false}};
    }

    let channels: Collection<string, GuildChannel> = message.guild.channels;

    if (!channels || !(channels.array()) || channels.array().length < 1) {
      return this.couldNotFindTheChannel(message);
    }

    let textChannels: Collection<string, GuildChannel> = channels.filter((c) => c.type === 'text');

    let channel: TextChannel = textChannels.find('id', channelIdOrName) as TextChannel;

    if (!channel) {
      channel = textChannels.find('name', channelIdOrName) as TextChannel;
    }

    if (!channel) {
      return this.couldNotFindTheChannel(message);
    }

    let latestMessage = channel.lastMessageID;

    if (!latestMessage) {
      return this.couldNotFindMessageInChannel(message);
    }

    let targetMessage: Discord.Message;

    // fetchMessage() throws if no message (e.g. last message deleted)
    try {
      targetMessage = await channel.fetchMessage(latestMessage);
    } catch (ex) {
      return this.couldNotFindMessageInChannel(message);
    }

    if (!targetMessage) {
      return this.couldNotFindMessageInChannel(message);
    }

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

  async couldNotFindTheChannel(message: Discord.Message): Promise<ICommandResult> {
    await this.errorMessageService.sendErrorMessage(message.channel,
      'Sorry!  Could not find the given channel!');
    if (message.deletable) {
      await message.delete(1000);
    }
    return {resultString: 'Could not find the channel', result: {success: false}};
  }

  async couldNotFindMessageInChannel(message: Discord.Message): Promise<ICommandResult> {
    await this.errorMessageService.sendErrorMessage(message.channel,
      'Sorry!  Could not find a message in that channel!');
    if (message.deletable) {
      await message.delete(1000);
    }
    return {resultString: 'Could not find a message in that channel', result: {success: false}};
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

}
