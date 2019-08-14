
import { Entity, createConnection } from 'typeorm';
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { Logger } from '../services/Logger';

@Singleton
@AutoWired
export class DatabaseService extends BaseService {

  @Inject private logger: Logger;

  private database;

  public async init(client) {
    super.init(client);

    this.database = await createConnection();
  }

  public getRepository(name) {
    if (this.database) {
      return this.database.getRepository(name);
    } else {
      this.logger.log('DB Connection not initialized yet');
    }
  }

  public getDatabase() {
    return this.database;
  }
}
