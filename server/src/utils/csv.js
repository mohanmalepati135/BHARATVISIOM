/**
 * Minimal CSV parser/serializer to avoid pulling in an extra dependency.
 * Usage mirrors the common `json2csv` Parser API used elsewhere in the codebase:
 *   new Parser(fields).parse(rows)
 */
class Parser {
  constructor(fields) {
    this.fields = fields;
  }

  escape(value) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  parse(rows) {
    const header = this.fields.join(',');
    const lines = rows.map((row) => this.fields.map((f) => this.escape(row[f])).join(','));
    return [header, ...lines].join('\n');
  }
}

module.exports = { Parser };
