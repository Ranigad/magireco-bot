
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
// import * as Discord from 'discord.js'; // Do I need this?

import { ICommand, ICommandArgs, ICommandResult } from '../interfaces';
import { HelpService } from '../services/help';
import { EnvService } from '../services/env';
import { EmojiService } from '../services/emoji';

// Reacts to given message ID with given emoji name. Deletes after short duration.

@Singleton
@AutoWired
export class ReactNowCommand implements ICommand {

  help = 'React to a message given an emoji ID';
  aliases = ['reactnow', 'rn'];

  @Inject private logger: Logger;
  @Inject private EmojiService: EmojiService;

  async execute(cmdArgs: ICommandArgs): Promise<ICommandResult> {
    const { message, args } = cmdArgs;

    try {
      // Args should only be length 1 and check for text channel

      if (message.channel.type !== "text") {

        // Error, incorrect channel type
        message.channel.send("Sorry! You can only use this command in a server channel!")
          .then(errorMessage => {
            errorMessage.delete(1000); // TODO: Global error message timeout default?
            message.delete(1000);
          });
      }

      if (args.length !== 1) {

        // Error, number of arguments doesn't match
        message.channel.send("Sorry! You must include only the emoji name!")
          .then(errorMessage => {
            errorMessage.delete(1000); // TODO: Global error message timeout default?
            message.delete(1000);
          });
      } else {

        const emojiName = args[0];

        // get message, is Collection
        message.channel.fetchMessages({limit : 1, before : message.id})
          .then(fetchedMessage => {

            // Check if there is a previous message

            // Check if message fetch was successful, if it is correct type, and there was something received
            if (fetchedMessage === undefined || !(fetchedMessage instanceof Discord.Collection) || fetchedMessage.length < 1) {
              // Error no previous message found
              message.channel.send("Sorry! Previous message not found!")
                .then(errorMessage => {
                  errorMessage.delete(1000); // TODO: Global error message timeout default?
                  message.delete(1000);
                });
            }

            const targetMessage = fetchedMessage[0];
            const emoji = this.EmojiService.getEmoji(emojiName);

            targetMessage.react(emoji).then(messageReaction => {

                // After X time, remove
                message.delete(1000);
                // sleep for 1000
                messageReaction.remove();
            });
          });
      }
    } catch (e) {
      this.logger.error(e);
      message.channel.send('Sorry! I could not open that wiki page for some reason.');
    }

    return { };
  }
}
