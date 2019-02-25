import 'reflect-metadata';

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;

export type decoratorKey = string | symbol;

export const PRELOAD_MODULE_KEY = 'INJECTION_PRELOAD_MODULE_KEY';

export class DecoratorManager extends Map {

  /**
   * the key for meta data store in class
   */
  injectClassKeyPrefix = 'INJECTION_CLASS_META_DATA';
  /**
   * the key for method meta data store in class
   */
  injectClassMethodKeyPrefix = 'INJECTION_CLASS_METHOD_META_DATA';

  /**
   * the key for method meta data store in method
   */
  injectMethodKeyPrefix = 'INJECTION_METHOD_META_DATA';

  saveModule(key, module) {
    if (!this.has(key)) {
      this.set(key, new Set());
    }
    this.get(key).add(module);
  }

  protected getDecoratorClassKey(decoratorNameKey: decoratorKey) {
    return decoratorNameKey.toString() + '_CLS';
  }

  protected getDecoratorMethodKey(decoratorNameKey: decoratorKey) {
    return decoratorNameKey.toString() + '_METHOD';
  }

  protected getDecoratorClsMethodPrefix(decoratorNameKey: decoratorKey) {
    return decoratorNameKey.toString() + '_CLS_METHOD';
  }

  protected getDecoratorClsMethodKey(decoratorNameKey: decoratorKey, methodKey: decoratorKey) {
    return this.getDecoratorClsMethodPrefix(decoratorNameKey) + ':' + methodKey.toString();
  }

  listModule(key) {
    return Array.from(this.get(key) || {});
  }

  getOriginMetaData(metaKey, target, method?) {
    if (method) {
      // for property
      if (!Reflect.hasMetadata(metaKey, target, method)) {
        Reflect.defineMetadata(metaKey, new Map(), target, method);
      }
      return Reflect.getMetadata(metaKey, target, method);
    } else {
      if (typeof target === 'object') {
        target = target.constructor;
      }
      // for class
      if (!Reflect.hasMetadata(metaKey, target)) {
        Reflect.defineMetadata(metaKey, new Map(), target);
      }
      return Reflect.getMetadata(metaKey, target);
    }
  }

  /**
   * save meta data to class
   * @param decoratorNameKey the alias name for decorator
   * @param data the data you want to store
   * @param target target class
   */
  saveMetaData(decoratorNameKey: decoratorKey, data, target, method?) {
    if (method) {
      const originMap = this.getOriginMetaData(this.injectMethodKeyPrefix, target, method);
      originMap.set(manager.getDecoratorMethodKey(decoratorNameKey), data);
    } else {
      const originMap = this.getOriginMetaData(this.injectClassKeyPrefix, target);
      originMap.set(manager.getDecoratorClassKey(decoratorNameKey), data);
    }
  }

  attachMetaData(decoratorNameKey: decoratorKey, data, target, method?) {
    let originMap;
    let key;
    if (method) {
      originMap = this.getOriginMetaData(this.injectMethodKeyPrefix, target, method);
      key = manager.getDecoratorMethodKey(decoratorNameKey);
    } else {
      originMap = this.getOriginMetaData(this.injectClassKeyPrefix, target);
      key = manager.getDecoratorClassKey(decoratorNameKey);
    }
    if (!originMap.has(key)) {
      originMap.set(key, []);
    }
    originMap.get(key).push(data);
  }

  getMetaData(decoratorNameKey: decoratorKey, target, method?) {
    if (method) {
      const originMap = this.getOriginMetaData(this.injectMethodKeyPrefix, target, method);
      return originMap.get(manager.getDecoratorMethodKey(decoratorNameKey));
    } else {
      const originMap = this.getOriginMetaData(this.injectClassKeyPrefix, target);
      return originMap.get(manager.getDecoratorClassKey(decoratorNameKey));
    }
  }

  saveMethodDataToClass(decoratorNameKey: decoratorKey, data, target, method) {
    const originMap = this.getOriginMetaData(this.injectClassMethodKeyPrefix, target);
    originMap.set(manager.getDecoratorClsMethodKey(decoratorNameKey, method), data);
  }

  attachMethodDataToClass(decoratorNameKey: decoratorKey, data, target, method) {
    const originMap = this.getOriginMetaData(this.injectClassMethodKeyPrefix, target);
    const key = manager.getDecoratorClsMethodKey(decoratorNameKey, method);
    if (!originMap.has(key)) {
      originMap.set(key, []);
    }
    originMap.get(key).push(data);
  }

  getMethodDataFromClass(decoratorNameKey: decoratorKey, target, method) {
    const originMap = this.getOriginMetaData(this.injectClassMethodKeyPrefix, target);
    return originMap.get(manager.getDecoratorClsMethodKey(decoratorNameKey, method));
  }

  listMethodDataFromClass(decoratorNameKey: decoratorKey, target) {
    const originMap = this.getOriginMetaData(this.injectClassMethodKeyPrefix, target);
    const res = [];
    for (const [ key, value ] of originMap) {
      if (key.indexOf(this.getDecoratorClsMethodPrefix(decoratorNameKey)) !== -1) {
        res.push(value);
      }
    }
    return res;
  }
}

const manager = new DecoratorManager();

export function saveClassMetaData(decoratorNameKey: decoratorKey, data, target) {
  return manager.saveMetaData(decoratorNameKey, data, target);
}

export function attachClassMetaData(decoratorNameKey: decoratorKey, data, target) {
  return manager.attachMetaData(decoratorNameKey, data, target);
}

export function getClassMetaData(decoratorNameKey: decoratorKey, target) {
  return manager.getMetaData(decoratorNameKey, target);
}

export function saveMethodDataToClass(decoratorNameKey: decoratorKey, data, target, method) {
  return manager.saveMethodDataToClass(decoratorNameKey, data, target, method);
}

export function attachMethodDataToClass(decoratorNameKey: decoratorKey, data, target, method) {
  return manager.attachMethodDataToClass(decoratorNameKey, data, target, method);
}

export function getMethodDataFromClass(decoratorNameKey: decoratorKey, target, method) {
  return manager.getMethodDataFromClass(decoratorNameKey, target, method);
}

export function listMethodDataFromClass(decoratorNameKey: decoratorKey, target) {
  return manager.listMethodDataFromClass(decoratorNameKey, target);
}

export function saveMethodMetaData(decoratorNameKey: decoratorKey, data, target, method) {
  return manager.saveMetaData(decoratorNameKey, data, target, method);
}

export function attachMethodMetaData(decoratorNameKey: decoratorKey, data, target, method) {
  return manager.attachMetaData(decoratorNameKey, data, target, method);
}

export function getMethodMetaData(decoratorNameKey: decoratorKey, target, method) {
  return manager.getMetaData(decoratorNameKey, target, method);
}

export function savePreloadModule(target) {
  return saveModule(PRELOAD_MODULE_KEY, target);
}

export function listPreloadModule() {
  return manager.listModule(PRELOAD_MODULE_KEY);
}

export function saveModule(decoratorNameKey: decoratorKey, target) {
  return manager.saveModule(decoratorNameKey, target);
}

export function listModule(decoratorNameKey: decoratorKey) {
  return manager.listModule(decoratorNameKey);
}

export function clearAllModule() {
  return manager.clear();
}

export function getParamNames(func) {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if (result === null) {
    result = [];
  }
  return result;
}