async function createDatabase(client) {
  await client.new({ database: '' }).command(`CREATE DATABASE "${client.options.database}"`);
}

async function createTable(client) {
  await client.sql`
    CREATE TABLE migrations(
      name       String,
      version    UInt32,
      created_at DateTime DEFAULT now()
    )
    ENGINE = ReplacingMergeTree(version)
    ORDER BY name`;
}

export async function getMigrations(client) {
  const migrations = new Map();

  try {
    for (const row of await client.sql`SELECT name, version FROM migrations FINAL`) {
      migrations.set(row.name, row.version);
    }
  } catch (error) {
    switch (error?.type) {
      case 'UNKNOWN_DATABASE':
        await createDatabase(client);
        return await getMigrations(client);

      case 'UNKNOWN_TABLE':
        await createTable(client);
        return await getMigrations(client);

      default:
        throw error;
    }
  }

  return migrations;
}
