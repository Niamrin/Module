export function childLists(block) {
  if (block.type === "tabs") return block.data.tabs.map((tab) => tab.blocks);
  if (block.type === "spoiler") return [block.data.blocks];
  return [];
}

export function* walkBlocks(list, parents = []) {
  for (const block of list) {
    yield { block, list, parents };
    for (const children of childLists(block)) {
      yield* walkBlocks(children, [...parents, block]);
    }
  }
}

export function visibleTree(blocks) {
  // Only modify the export copy, including lists inside hidden tabs and spoilers.
  const copy = JSON.parse(JSON.stringify(blocks));
  function prune(list) {
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].hidden) list.splice(i, 1);
      else childLists(list[i]).forEach(prune);
    }
  }
  prune(copy);
  return copy;
}
