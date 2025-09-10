export class ClickHouseTable {
  static version = 1;
  static tableName = '';

  static injectSQL({ source }, string) {
    source[source.length - 1] += this.tableName + string;
  }

  static toString() {
    return this.tableName;
  }
}
