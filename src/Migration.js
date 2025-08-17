import { getMigrations } from './migration/migrate.js';
import { Reporter } from './migration/Reporter.js';

export class Migration {
  client = null;
  reporter = new Reporter();

  constructor(client) {
    this.client = client;
  }

  async up(classes) {
    const migrations = await getMigrations(this.client);

    for (const key of Object.keys(classes)) {
      const version = migrations.get(key);
      const migration = new classes[key]();

      if (version == null || version < migration.version) {
        if (!this.reporter.count) {
          this.reporter.star();
        }

        await migration.up(this.client);
        await this.client.insert('migrations', [
          {
            name: key,
            version: Number(migration.version) || 0,
          },
        ]);

        this.reporter.up(key);
      }

      if (this.reporter.count) {
        this.reporter.done();
      }
    }
  }
}
