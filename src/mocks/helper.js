import { cloneDeep, pick } from 'lodash-es'
import MockData from './mockData';

const findParentNode = (obj, targetCode, parent = null) => {
  if (!obj) return null;
  if (obj.code === targetCode) return parent;

  if (obj.l) {
    for (let child of obj.l) {
      const result = findParentNode(child, targetCode, obj);
      if (result) return result;
    }
  }

  if (obj.r) {
    for (let child of obj.r) {
      const result = findParentNode(child, targetCode, obj);
      if (result) return result;
    }
  }

  return null;
};

const findNode = (obj, targetCode) => {
  if (!obj) return null;
  if (obj.code === targetCode) return obj;

  if (obj.l) {
    for (let child of obj.l) {
      const result = findNode(child, targetCode);
      if (result) return result;
    }
  }

  if (obj.r) {
    for (let child of obj.r) {
      const result = findNode(child, targetCode);
      if (result) return result;
    }
  }

  return null;
}

const copyNodeWithDepth = (obj, maxDepth, currentDepth = 0) => {
  if (!obj || currentDepth > maxDepth) return null;

  const newNode = pick(obj, ['code', 'name', 'introducer_code']);
  if (obj.l) {
    const parse = obj.l
      .map(child => copyNodeWithDepth(child, maxDepth, currentDepth + 1))
      .filter(child => child !== null);
    newNode.l = parse.length > 0 ? parse : null;
  } else {
    newNode.l = null;
  }

  if (obj.r) {
    const parse = obj.r
      .map(child => copyNodeWithDepth(child, maxDepth, currentDepth + 1))
      .filter(child => child !== null);
    newNode.r = parse.length > 0 ? parse : null;
  } else {
    newNode.r = null;
  }

  return newNode;
}

export const findNodeWithDepth = (targetCode, maxDepth) => {
  const targetNode = cloneDeep(findNode(MockData, targetCode));
  if (!targetNode) return null;

  return copyNodeWithDepth(targetNode, maxDepth);
}

export const findParentNodeWithDepth = (targetCode, maxDepth) => {
  const targetNode = cloneDeep(findParentNode(MockData, targetCode));
  if (!targetNode) return null;

  return copyNodeWithDepth(targetNode, maxDepth);
}
