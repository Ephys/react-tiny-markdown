import React from 'react';

export default function nl2br(...nodes) {
  const newNodes = [];

  let i = 0;
  for (const node of nodes) {
    if (typeof node !== 'string') {
      newNodes.push(node);
      continue;
    }

    for (const line of node.split('\n')) {
      newNodes.push(line);
      newNodes.push(<br key={`br${i++}`} />);
    }

    // remove last BR
    newNodes.pop();
  }

  return newNodes;
}
