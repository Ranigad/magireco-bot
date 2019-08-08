
import { Entity, createConnection } from 'typeorm';
import { Inject, AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { Logger } from '../services/Logger';

@Singleton
@AutoWired
export class DatabaseService extends BaseService {

  @Inject private logger: Logger;

  private _database;

  get database() {
    return this._database;
  }

  public async init(client) {
    super.init(client);

    this._database = await createConnection();
  }

  public getRepository(name) {
    if (!this._database) {
      this.logger.error('DB Connection not initialized yet');
    }
    return this._database.getRepository(name);
  }

}
