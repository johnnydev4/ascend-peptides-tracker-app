/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A minimal in-browser stand-in for the Supabase JS client. It implements only
 * the query-builder and auth surface this app actually uses, backed by a
 * localStorage dataset. This is strictly for demo mode — the moment real
 * Supabase credentials are present, the real client is used instead.
 */
import { buildSeedDatabase, type Database, type Row } from "./seed";
import { DEMO_USER } from "./config";

const STORAGE_KEY = "peptide-tracker:demo-db";

function loadDb(): Database {
  if (typeof window === "undefined") return buildSeedDatabase();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Database;
  } catch {
    /* fall through to seed */
  }
  const seeded = buildSeedDatabase();
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    /* ignore quota errors */
  }
  return seeded;
}

function saveDb(db: Database) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
}

/** Resets the demo dataset back to its seeded state. */
export function resetDemoData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  loadDb();
}

interface Filter {
  col: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
  val: any;
}

interface Relation {
  alias: string;
  table: string;
  fk: string;
}

function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of input) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function parseRelations(select: string): Relation[] {
  const relations: Relation[] = [];
  for (const token of splitTopLevel(select)) {
    if (token.includes("(") && token.includes(":")) {
      const alias = token.slice(0, token.indexOf(":")).trim();
      const table = token
        .slice(token.indexOf(":") + 1, token.indexOf("("))
        .trim();
      relations.push({ alias, table, fk: `${alias}_id` });
    }
  }
  return relations;
}

function compare(a: any, b: any): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function matches(row: Row, filters: Filter[]): boolean {
  return filters.every(({ col, op, val }) => {
    const v = row[col];
    switch (op) {
      case "eq":
        return v === val;
      case "neq":
        return v !== val;
      case "gt":
        return compare(v, val) > 0;
      case "gte":
        return compare(v, val) >= 0;
      case "lt":
        return compare(v, val) < 0;
      case "lte":
        return compare(v, val) <= 0;
    }
  });
}

type Mode = "select" | "insert" | "update" | "delete" | "upsert";

class QueryBuilder implements PromiseLike<any> {
  private filters: Filter[] = [];
  private orderBy: { col: string; ascending: boolean } | null = null;
  private limitN: number | null = null;
  private selectStr = "*";
  private returnRows = false;
  private headOnly = false;
  private wantCount = false;
  private mode: Mode = "select";
  private payload: Row[] = [];
  private conflictCols: string[] = [];
  private ignoreDuplicates = false;

  constructor(
    private db: Database,
    private table: string,
    private persist: () => void
  ) {}

  private rows(): Row[] {
    return (this.db[this.table] ??= []);
  }

  select(str = "*", opts?: { count?: string; head?: boolean }) {
    this.selectStr = str;
    this.returnRows = true;
    if (opts?.head) this.headOnly = true;
    if (opts?.count) this.wantCount = true;
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, op: "eq", val });
    return this;
  }
  neq(col: string, val: any) {
    this.filters.push({ col, op: "neq", val });
    return this;
  }
  gt(col: string, val: any) {
    this.filters.push({ col, op: "gt", val });
    return this;
  }
  gte(col: string, val: any) {
    this.filters.push({ col, op: "gte", val });
    return this;
  }
  lt(col: string, val: any) {
    this.filters.push({ col, op: "lt", val });
    return this;
  }
  lte(col: string, val: any) {
    this.filters.push({ col, op: "lte", val });
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, ascending: opts?.ascending ?? true };
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }

  insert(rows: Row | Row[]) {
    this.mode = "insert";
    this.payload = Array.isArray(rows) ? rows : [rows];
    return this;
  }
  update(patch: Row) {
    this.mode = "update";
    this.payload = [patch];
    return this;
  }
  delete() {
    this.mode = "delete";
    return this;
  }
  upsert(
    rows: Row | Row[],
    opts?: { onConflict?: string; ignoreDuplicates?: boolean }
  ) {
    this.mode = "upsert";
    this.payload = Array.isArray(rows) ? rows : [rows];
    this.conflictCols = opts?.onConflict?.split(",").map((c) => c.trim()) ?? [];
    this.ignoreDuplicates = opts?.ignoreDuplicates ?? false;
    return this;
  }

  private applyDefaults(row: Row): Row {
    const nowIso = new Date().toISOString();
    const withDefaults: Row = { ...row };
    if (withDefaults.id == null) withDefaults.id = crypto.randomUUID();
    if (withDefaults.created_at == null) withDefaults.created_at = nowIso;
    if (this.table === "treatments" && withDefaults.updated_at == null) {
      withDefaults.updated_at = nowIso;
    }
    return withDefaults;
  }

  private resolveRelations(row: Row, relations: Relation[]): Row {
    if (relations.length === 0) return row;
    const resolved: Row = { ...row };
    for (const rel of relations) {
      const fkValue = row[rel.fk];
      const related =
        fkValue == null
          ? null
          : (this.db[rel.table] ?? []).find((r) => r.id === fkValue) ?? null;
      resolved[rel.alias] = related ? { ...related } : null;
    }
    return resolved;
  }

  private runSelect() {
    let result = this.rows().filter((r) => matches(r, this.filters));
    if (this.wantCount || this.headOnly) {
      const count = result.length;
      if (this.headOnly) return { data: null, error: null, count };
      // fallthrough returns rows with count below
      if (this.orderBy) {
        const { col, ascending } = this.orderBy;
        result = [...result].sort(
          (a, b) => compare(a[col], b[col]) * (ascending ? 1 : -1)
        );
      }
      if (this.limitN != null) result = result.slice(0, this.limitN);
      const relations = parseRelations(this.selectStr);
      return {
        data: result.map((r) => this.resolveRelations(r, relations)),
        error: null,
        count,
      };
    }
    if (this.orderBy) {
      const { col, ascending } = this.orderBy;
      result = [...result].sort(
        (a, b) => compare(a[col], b[col]) * (ascending ? 1 : -1)
      );
    }
    if (this.limitN != null) result = result.slice(0, this.limitN);
    const relations = parseRelations(this.selectStr);
    return {
      data: result.map((r) => this.resolveRelations(r, relations)),
      error: null,
      count: null,
    };
  }

  private execute(): { data: any; error: any; count: number | null } {
    switch (this.mode) {
      case "select":
        return this.runSelect();
      case "insert": {
        const inserted = this.payload.map((r) => this.applyDefaults(r));
        this.rows().push(...inserted);
        this.persist();
        return {
          data: this.returnRows ? inserted : null,
          error: null,
          count: null,
        };
      }
      case "update": {
        const patch = this.payload[0] ?? {};
        const updated: Row[] = [];
        for (const row of this.rows()) {
          if (matches(row, this.filters)) {
            Object.assign(row, patch);
            updated.push(row);
          }
        }
        this.persist();
        return {
          data: this.returnRows ? updated : null,
          error: null,
          count: null,
        };
      }
      case "delete": {
        const kept = this.rows().filter((r) => !matches(r, this.filters));
        this.db[this.table] = kept;
        this.persist();
        return { data: null, error: null, count: null };
      }
      case "upsert": {
        for (const incoming of this.payload) {
          const exists = this.rows().find((r) =>
            this.conflictCols.every((c) => r[c] === incoming[c])
          );
          if (exists) {
            if (!this.ignoreDuplicates) Object.assign(exists, incoming);
          } else {
            this.rows().push(this.applyDefaults(incoming));
          }
        }
        this.persist();
        return { data: null, error: null, count: null };
      }
    }
  }

  async single() {
    const res = this.execute();
    const rows = (res.data as Row[]) ?? [];
    if (Array.isArray(rows)) {
      return {
        data: rows[0] ?? null,
        error: rows.length ? null : { message: "No rows found" },
        count: res.count,
      };
    }
    return { data: rows, error: null, count: res.count };
  }

  async maybeSingle() {
    const res = this.execute();
    const rows = (res.data as Row[]) ?? [];
    return {
      data: Array.isArray(rows) ? rows[0] ?? null : rows,
      error: null,
      count: res.count,
    };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?:
      | ((value: any) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

function makeSession() {
  return {
    access_token: "demo-token",
    refresh_token: "demo-refresh",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: makeUser(),
  };
}

function makeUser() {
  return {
    id: DEMO_USER.id,
    email: DEMO_USER.email,
    aud: "authenticated",
    role: "authenticated",
    app_metadata: {},
    user_metadata: { display_name: DEMO_USER.displayName },
    created_at: new Date().toISOString(),
  };
}

export function createMockClient(): any {
  const db = loadDb();
  const persist = () => saveDb(db);

  return {
    from(table: string) {
      return new QueryBuilder(db, table, persist);
    },
    auth: {
      async getUser() {
        return { data: { user: makeUser() }, error: null };
      },
      async getSession() {
        return { data: { session: makeSession() }, error: null };
      },
      async signInWithPassword() {
        return {
          data: { user: makeUser(), session: makeSession() },
          error: null,
        };
      },
      async signUp() {
        return {
          data: { user: makeUser(), session: makeSession() },
          error: null,
        };
      },
      async signOut() {
        return { error: null };
      },
      async updateUser() {
        return { data: { user: makeUser() }, error: null };
      },
      async resetPasswordForEmail() {
        return { data: {}, error: null };
      },
      async exchangeCodeForSession() {
        return { data: { session: makeSession() }, error: null };
      },
      onAuthStateChange(_cb: unknown) {
        return {
          data: { subscription: { unsubscribe() {} } },
        };
      },
    },
  };
}
