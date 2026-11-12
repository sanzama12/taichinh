import fs from "fs";
import path from "path";

export interface JsonDatabaseStructure {
  users: any[];
  accessKeys: any[];
  incomes: any[];
  bills: any[];
  billPayments: any[];
  expenses: any[];
  budgets: any[];
  savingsGoals: any[];
  savingsTransactions: any[];
  beeOrders: any[];
  fuelLogs: any[];
  bonusLogs: any[];
  debts: any[];
  supportTickets: any[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
  const randomChars = Math.random().toString(16).substring(2, 18).padEnd(16, "0");
  return timestamp + randomChars;
}

// Bộ nhớ đệm trong RAM để đọc siêu tốc (Ultra High Speed In-Memory Cache)
let memoryStore: JsonDatabaseStructure | null = null;
let saveTimeout: NodeJS.Timeout | null = null;

function loadDatabaseFromFile(): JsonDatabaseStructure {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          accessKeys: parsed.accessKeys || [],
          incomes: parsed.incomes || [],
          bills: parsed.bills || [],
          billPayments: parsed.billPayments || [],
          expenses: parsed.expenses || [],
          budgets: parsed.budgets || [],
          savingsGoals: parsed.savingsGoals || [],
          savingsTransactions: parsed.savingsTransactions || [],
          beeOrders: parsed.beeOrders || [],
          fuelLogs: parsed.fuelLogs || [],
          bonusLogs: parsed.bonusLogs || [],
          debts: parsed.debts || [],
          supportTickets: parsed.supportTickets || [],
        };
      }
    }
  } catch (err) {
    console.error("[JsonDb] Error loading database from file, reinitializing...", err);
  }

  const initial = createInitialSeedData();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
  } catch (e) {
    console.error("[JsonDb] Error writing initial database file:", e);
  }
  return initial;
}

export function getDatabase(): JsonDatabaseStructure {
  if (!memoryStore) {
    memoryStore = loadDatabaseFromFile();
  }
  return memoryStore;
}

export function flushDatabaseToDisk() {
  if (!memoryStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2), "utf-8");
  } catch (err) {
    console.error("[JsonDb] Failed to flush to disk:", err);
  }
}

function scheduleSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    flushDatabaseToDisk();
  }, 50); // Lưu đệm 50ms không làm nghẽn I/O
}

function matchesQuery(doc: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) return true;

  for (const key of Object.keys(query)) {
    const queryVal = query[key];

    // Xử lý truy vấn nested, ví dụ: "settings.emailReminder": true
    let docVal: any;
    if (key.includes(".")) {
      const parts = key.split(".");
      docVal = doc;
      for (const p of parts) {
        docVal = docVal ? docVal[p] : undefined;
      }
    } else {
      docVal = doc[key];
    }

    // Toán tử MongoDB ($gte, $lte, $gt, $lt, $regex, $exists, $ne)
    if (queryVal && typeof queryVal === "object" && !(queryVal instanceof Date) && !(queryVal instanceof RegExp)) {
      if ("$gte" in queryVal || "$lte" in queryVal || "$gt" in queryVal || "$lt" in queryVal) {
        const dTime = new Date(docVal).getTime();
        if ("$gte" in queryVal && !(dTime >= new Date(queryVal.$gte).getTime())) return false;
        if ("$lte" in queryVal && !(dTime <= new Date(queryVal.$lte).getTime())) return false;
        if ("$gt" in queryVal && !(dTime > new Date(queryVal.$gt).getTime())) return false;
        if ("$lt" in queryVal && !(dTime < new Date(queryVal.$lt).getTime())) return false;
        continue;
      }
      if ("$regex" in queryVal) {
        const regex =
          queryVal.$regex instanceof RegExp
            ? queryVal.$regex
            : new RegExp(queryVal.$regex, queryVal.$options || "");
        if (!regex.test(String(docVal || ""))) return false;
        continue;
      }
      if ("$exists" in queryVal) {
        const exists = docVal !== undefined && docVal !== null;
        if (queryVal.$exists && !exists) return false;
        if (!queryVal.$exists && exists) return false;
        continue;
      }
      if ("$ne" in queryVal) {
        if (String(docVal) === String(queryVal.$ne)) return false;
        continue;
      }
      if ("$in" in queryVal && Array.isArray(queryVal.$in)) {
        const strList = queryVal.$in.map(String);
        if (!strList.includes(String(docVal))) return false;
        continue;
      }
    }

    if (queryVal instanceof RegExp) {
      if (!queryVal.test(String(docVal || ""))) return false;
      continue;
    }

    // So sánh định danh ID (hỗ trợ cả ObjectId và string)
    if (key === "_id" || key.endsWith("Id") || key === "userId") {
      if (String(docVal) !== String(queryVal)) return false;
      continue;
    }

    if (queryVal instanceof Date) {
      if (new Date(docVal).getTime() !== queryVal.getTime()) return false;
      continue;
    }

    if (docVal !== queryVal && String(docVal) !== String(queryVal)) {
      return false;
    }
  }

  return true;
}

export class JsonQuery<T> implements PromiseLike<T> {
  private collection: JsonCollection<any>;
  private query: any;
  private isSingle: boolean;
  private sortObj?: Record<string, 1 | -1>;
  private limitNum?: number;
  private selectFields?: string;

  constructor(collection: JsonCollection<any>, query: any, isSingle = false) {
    this.collection = collection;
    this.query = query;
    this.isSingle = isSingle;
  }

  sort(sortObj: Record<string, 1 | -1>) {
    this.sortObj = sortObj;
    return this;
  }

  limit(n: number) {
    this.limitNum = n;
    return this;
  }

  select(fields: string) {
    this.selectFields = fields;
    return this;
  }

  lean() {
    return this;
  }

  async exec(): Promise<T> {
    return this.collection.execute(this.query, this.isSingle, this.sortObj, this.limitNum, this.selectFields);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

export class JsonCollection<T extends { _id?: any }> {
  private key: keyof JsonDatabaseStructure;

  constructor(key: keyof JsonDatabaseStructure) {
    this.key = key;
  }

  private getItems(): any[] {
    const db = getDatabase();
    return db[this.key];
  }

  private wrapDoc(rawDoc: any): any {
    if (!rawDoc) return null;
    const doc = { ...rawDoc };

    // Đảm bảo _id luôn có phương thức .toString()
    const idStr = String(doc._id);
    doc._id = idStr;

    // Đảm bảo các thuộc tính Date là kiểu Date object
    for (const f of ["date", "createdAt", "updatedAt", "deadline", "paidAt", "expiresAt", "lastLoginAt"]) {
      if (doc[f] && typeof doc[f] === "string") {
        doc[f] = new Date(doc[f]);
      }
    }

    // Gắn phương thức .save()
    const self = this;
    doc.save = async function () {
      doc.updatedAt = new Date();
      const items = self.getItems();
      const idx = items.findIndex((i) => String(i._id) === idStr);
      if (idx >= 0) {
        items[idx] = { ...doc };
        scheduleSave();
      }
      return doc;
    };

    return doc;
  }

  find(query: any = {}): JsonQuery<T[]> {
    return new JsonQuery<T[]>(this, query, false);
  }

  findOne(query: any = {}): JsonQuery<T | null> {
    return new JsonQuery<T | null>(this, query, true);
  }

  findById(id: any): JsonQuery<T | null> {
    return new JsonQuery<T | null>(this, { _id: id }, true);
  }

  findByIdAndUpdate(id: any, update: any, options: any = {}): any {
    return this.findOneAndUpdate({ _id: id }, update, options);
  }

  async create(data: any): Promise<any> {
    const items = this.getItems();
    const now = new Date();

    if (Array.isArray(data)) {
      const created = data.map((item) => {
        const id = item._id ? String(item._id) : generateObjectId();
        const doc = {
          ...item,
          _id: id,
          createdAt: item.createdAt ? new Date(item.createdAt) : now,
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : now,
        };
        items.push(doc);
        return this.wrapDoc(doc);
      });
      scheduleSave();
      return created;
    } else {
      const id = data._id ? String(data._id) : generateObjectId();
      const doc = {
        ...data,
        _id: id,
        createdAt: data.createdAt ? new Date(data.createdAt) : now,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : now,
      };
      items.push(doc);
      scheduleSave();
      return this.wrapDoc(doc);
    }
  }

  findOneAndUpdate(query: any, update: any, options: any = {}): any {
    const promise = (async () => {
      const items = this.getItems();
      const idx = items.findIndex((i) => matchesQuery(i, query));

      if (idx >= 0) {
        const existing = items[idx];
        const directFields = Object.fromEntries(
          Object.entries(update).filter(([key]) => !key.startsWith("$"))
        );
        const fieldsToUpdate = { ...directFields, ...(update.$set || {}) };
        const incrementedFields = Object.fromEntries(
          Object.entries(update.$inc || {}).map(([key, value]) => [
            key,
            (Number(existing[key]) || 0) + Number(value),
          ])
        );

        const updated = {
          ...existing,
          ...fieldsToUpdate,
          ...incrementedFields,
          updatedAt: new Date(),
        };
        items[idx] = updated;
        scheduleSave();
        return this.wrapDoc(updated);
      } else if (options.upsert) {
        // Upsert: tạo mới nếu chưa có
        const fields = { ...query };
        if (update.$set) {
          Object.assign(fields, update.$set);
        } else {
          Object.assign(fields, update);
        }
        return await this.create(fields);
      }

      return null;
    })();

    return Object.assign(promise, { exec: () => promise });
  }

  updateOne(query: any, update: any): any {
    const promise = (async () => {
      const updated = await this.findOneAndUpdate(query, update);
      return {
        acknowledged: true,
        matchedCount: updated ? 1 : 0,
        modifiedCount: updated ? 1 : 0,
      };
    })();

    return Object.assign(promise, { exec: () => promise });
  }

  updateMany(query: any, update: any): any {
    const promise = (async () => {
      const items = this.getItems();
      const matchedItems = items.filter((item) => matchesQuery(item, query));
      for (const item of matchedItems) {
        await this.findOneAndUpdate({ _id: item._id }, update);
      }
      return {
        acknowledged: true,
        matchedCount: matchedItems.length,
        modifiedCount: matchedItems.length,
      };
    })();

    return Object.assign(promise, { exec: () => promise });
  }

  findOneAndDelete(query: any): any {
    const promise = (async () => {
      const items = this.getItems();
      const idx = items.findIndex((i) => matchesQuery(i, query));
      if (idx >= 0) {
        const [removed] = items.splice(idx, 1);
        scheduleSave();
        return this.wrapDoc(removed);
      }
      return null;
    })();

    return Object.assign(promise, { exec: () => promise });
  }

  deleteOne(query: any): any {
    const promise = (async () => {
      const res = await this.findOneAndDelete(query);
      return { deletedCount: res ? 1 : 0 };
    })();

    return Object.assign(promise, { exec: () => promise });
  }

  deleteMany(query: any): any {
    const promise = (async () => {
      const items = this.getItems();
      const initialLen = items.length;
      const remaining = items.filter((i) => !matchesQuery(i, query));
      const deletedCount = initialLen - remaining.length;

      if (deletedCount > 0) {
        const db = getDatabase();
        db[this.key] = remaining;
        scheduleSave();
      }

      return { deletedCount };
    })();

    return Object.assign(promise, { exec: () => promise });
  }

  distinct(field: string, query: any = {}): any {
    const promise = (async () => {
      const items = this.getItems();
      const filtered = items.filter((i) => matchesQuery(i, query));
      const set = new Set();
      for (const item of filtered) {
        if (item[field] !== undefined && item[field] !== null) {
          set.add(item[field]);
        }
      }
      return Array.from(set);
    })();

    return Object.assign(promise, { exec: () => promise });
  }

  async countDocuments(query: any = {}): Promise<number> {
    const items = this.getItems();
    return items.filter((i) => matchesQuery(i, query)).length;
  }

  async execute(
    query: any,
    isSingle: boolean,
    sortObj?: Record<string, 1 | -1>,
    limitNum?: number,
    selectFields?: string
  ): Promise<any> {
    const items = this.getItems();
    let matches = items.filter((i) => matchesQuery(i, query));

    // Sort
    if (sortObj) {
      matches.sort((a, b) => {
        for (const [key, dir] of Object.entries(sortObj)) {
          let valA = a[key];
          let valB = b[key];

          if (valA instanceof Date) valA = valA.getTime();
          if (valB instanceof Date) valB = valB.getTime();

          if (valA < valB) return dir === 1 ? -1 : 1;
          if (valA > valB) return dir === 1 ? 1 : -1;
        }
        return 0;
      });
    }

    // Limit
    if (typeof limitNum === "number" && limitNum > 0) {
      matches = matches.slice(0, limitNum);
    }

    // Select
    if (selectFields) {
      const isExclusion = selectFields.startsWith("-");
      const fieldList = selectFields.replace(/^-/, "").trim().split(/\s+/);

      matches = matches.map((m) => {
        const copy: any = { _id: m._id };
        if (isExclusion) {
          Object.assign(copy, m);
          for (const f of fieldList) delete copy[f];
        } else {
          for (const f of fieldList) copy[f] = m[f];
        }
        return copy;
      });
    }

    if (isSingle) {
      return matches.length > 0 ? this.wrapDoc(matches[0]) : null;
    }

    return matches.map((m) => this.wrapDoc(m));
  }
}

// Khởi tạo các Collections
export const jsonDb = {
  users: new JsonCollection("users"),
  accessKeys: new JsonCollection("accessKeys"),
  incomes: new JsonCollection("incomes"),
  bills: new JsonCollection("bills"),
  billPayments: new JsonCollection("billPayments"),
  expenses: new JsonCollection("expenses"),
  budgets: new JsonCollection("budgets"),
  savingsGoals: new JsonCollection("savingsGoals"),
  savingsTransactions: new JsonCollection("savingsTransactions"),
  beeOrders: new JsonCollection("beeOrders"),
  fuelLogs: new JsonCollection("fuelLogs"),
  bonusLogs: new JsonCollection("bonusLogs"),
  debts: new JsonCollection("debts"),
  supportTickets: new JsonCollection("supportTickets"),
};

export function isJsonDbActive(): boolean {
  // Mặc định kết nối MongoDB trực tiếp (100% Native MongoDB), chỉ dùng JSON DB nếu có biến USE_JSON_DB=true
  return process.env.USE_JSON_DB === "true";
}

/** Khởi tạo duy nhất tài khoản Admin bootstrap khi JSON DB chưa tồn tại. */
function createInitialSeedData(): JsonDatabaseStructure {
  const adminId = "673100000000000000000001";
  const now = new Date();

  return {
    users: [
      {
        _id: adminId,
        name: "Quản Trị Viên Xuân Việt",
        role: "admin",
        accessKey: "XUANVIETKEY",
        settings: {
          savingsRatePercent: 20,
          remindDaysBefore: 3,
          emailReminder: true,
          currency: "VND",
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ],

    accessKeys: [
      {
        _id: "673100000000000000000011",
        key: "XUANVIETKEY",
        name: "Quản Trị Viên Xuân Việt",
        userId: adminId,
        role: "admin",
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ],

    incomes: [],
    bills: [],
    billPayments: [],
    expenses: [],
    budgets: [],
    savingsGoals: [],
    savingsTransactions: [],
    beeOrders: [],
    fuelLogs: [],
    bonusLogs: [],
    debts: [],
    supportTickets: [],
  };
}
