import { isJsonDbActive, JsonCollection } from "./json-db";

/**
 * Tạo Adapter kết nối linh hoạt giữa Mongoose Model và JSON Database Model
 * Tuân thủ mô hình Gang of Four (Adapter Pattern)
 * Cho phép chuyển đổi tức thì giữa MongoDB Cloud và JSON DB cục bộ mà không sửa đổi bất kỳ dòng mã nghiệp vụ nào!
 */
export function createModelAdapter<T = any>(
  _modelName: string,
  getMongooseModel: () => any,
  jsonCollection: JsonCollection<any>
): any {
  return new Proxy({} as any, {
    get(_target, prop) {
      if (isJsonDbActive()) {
        const val = (jsonCollection as any)[prop];
        if (typeof val === "function") {
          return val.bind(jsonCollection);
        }
        return val;
      } else {
        const model = getMongooseModel();
        const val = model[prop];
        if (typeof val === "function") {
          return val.bind(model);
        }
        return val;
      }
    },
    apply(_target, _thisArg, argArray) {
      if (isJsonDbActive()) {
        return (jsonCollection as any).create(...argArray);
      } else {
        const model = getMongooseModel();
        return model(...argArray);
      }
    },
    construct(_target, argArray) {
      if (isJsonDbActive()) {
        return (jsonCollection as any).create(argArray[0]);
      } else {
        const ModelClass = getMongooseModel();
        return new ModelClass(...argArray);
      }
    },
  });
}
