export class ClickHouseTable {
  static tableName = '';

  static injectSQL({ source }, string) {
    source[source.length - 1] += this.tableName + string;
  }

  static toString() {
    return this.tableName;
  }
}
