import { getMigrations } from './migrate.js';
import { Reporter } from './Reporter.js';

export class Migration {
  client = null;
  context = null;
  reporter = new Reporter();

  constructor(client, context = client) {
    this.client = client;
    this.context = context;
  }

  async up(classes) {
    const migrations = await getMigrations(this.client);

    for (const key of Object.keys(classes)) {
      const migration = new classes[key]();
      const version = Number(classes[key].version) || 1;

      if (!migrations.has(key) || migrations.get(key) < version) {
        await migration.up(this.context);
        await this.client.insert('migrations', [
          {
            name: key,
            version: version,
          },
        ]);

        this.reporter.up(key);
      }
    }
  }
}
