
import * as Discord from 'discord.js';
import { Inject } from 'typescript-ioc';

import { ICommandResult, IService } from './interfaces';

import { Logger } from './services/Logger';
import { CommandParser } from './services/CommandParser';
import { PresenceService } from './services/PresenceService';
import { EnvService } from './services/EnvService';
import { DatabaseService } from './services/DatabaseService';
import { WikiService } from './services/WikiService';
import { EmojiService } from './services/EmojiService';
import { ReactService } from './services/ReactService';
import { ErrorMessageService } from './services/ErrorMessageService';
import { BaseService } from './base/BaseService';

export class Bot {
  // these services have to be registered first
  @Inject private logger: Logger;
  @Inject private envService: EnvService;
  @Inject private databaseService: DatabaseService;
  @Inject private errorMessageService: ErrorMessageService;

  // these services can come in any particular order
  @Inject private emojiService: EmojiService;
  @Inject private presenceService: PresenceService;
  @Inject private wikiService: WikiService;
  @Inject private reactService: ReactService;

  // this service should come last
  @Inject private commandParser: CommandParser;

  public async init() {
    const DISCORD_TOKEN = this.envService.discordToken;
    const COMMAND_PREFIX = this.envService.commandPrefix;
    if (!DISCORD_TOKEN) { throw new Error('No Discord token specified!'); }

    const client = new Discord.Client();

    client.on('ready', async () => {
      this.logger.log('Initialized bot!');

      // auto-register all services
      for (const key in this) {
        const service: IService = (this[key] as unknown) as IService;
        if (!(service instanceof BaseService)) {
          continue;
        }

        await service.init(client);
      }

      this.logger.log('All services registered!');
    });

    client.on('message', async (msg) => {
      if (msg.author.bot || msg.author.id === client.user.id) { return; }

      const content = msg.content;

      if (content.startsWith(COMMAND_PREFIX)) {
        const result: ICommandResult = await this.commandParser.handleCommand(msg);
        this.logger.logCommandResult(result);

      } else {
        this.commandParser.handleMessage(msg);

      }
    });

    client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) { return; }

      this.commandParser.handleEmojiAdd(reaction, user);
    });

    client.on('messageReactionRemove', async (reaction, user) => {
      if (user.bot) { return; }

      this.commandParser.handleEmojiRemove(reaction, user);
    });

    // After everything is configured, login to the client
    await client.login(DISCORD_TOKEN);
  }
}
