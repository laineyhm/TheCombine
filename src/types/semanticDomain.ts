import {
  SemanticDomain,
  SemanticDomainFull,
  SemanticDomainTreeNode,
  SemanticDomainCount,
  SemanticDomainUserCount,
} from "api/models";
import { Bcp47Code } from "types/writingSystem";

export function newSemanticDomain(
  id = "",
  name = "",
  lang = Bcp47Code.Default as string
): SemanticDomainFull {
  return { id, name, guid: "", questions: [], description: "", lang };
}

export function newSemanticDomainForMongoDB(
  mongoId = "",
  guid = "",
  name = "",
  id = "",
  lang = Bcp47Code.Default as string,
  userId = ""
): SemanticDomain {
  return { mongoId, guid, name, id, lang, userId };
}

export function newSemanticDomainTreeNode(
  id = "",
  name = "",
  lang = Bcp47Code.Default as string
): SemanticDomainTreeNode {
  return {
    parent: undefined,
    previous: undefined,
    next: undefined,
    children: [],
    id,
    name,
    lang,
    guid: "",
  };
}

export function newSemanticDomainUserCount(
  domainSet = new Set<string>()
): SemanticDomainUserCount {
  return { id: "", domainSet: domainSet };
}

export function newSemanticDomainCount(
  semanticDomainTreeNode: SemanticDomainTreeNode,
  count = 0
): SemanticDomainCount {
  return {
    semanticDomainTreeNode: semanticDomainTreeNode,
    count: count,
  };
}

export function semDomFromTreeNode(
  node: SemanticDomainTreeNode
): SemanticDomainFull {
  const dom = newSemanticDomain(node.id, node.name, node.lang);
  return { ...dom, guid: node.guid };
}

export function treeNodeFromSemDom(
  dom: SemanticDomain
): SemanticDomainTreeNode {
  const node = newSemanticDomainTreeNode(dom.id, dom.name, dom.lang);
  return { ...node, guid: dom.guid };
}

export type TreeNodeMap = Record<string, SemanticDomainTreeNode>;
