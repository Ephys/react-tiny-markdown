// @flow

import * as React from 'react';
import VanillaAutoLinker, { AutolinkerConfig } from 'autolinker';

type AutoLinkerMatch = {
};

type Props = {
  text: string,
  children?: (nodes: React.Node) => React.Node,
  renderLink?: (match: AutoLinkerMatch) => React.Node,
  options?: AutolinkerConfig,
};

export default function AutoLinker(props: Props) {
  const { options, text, renderLink, children: render } = props;

  const matches = VanillaAutoLinker.parse(text, options);
  const tags = [];
  let lastOffset = 0;
  for (const match of matches) {
    const offset = match.getOffset();

    tags.push(text.substring(lastOffset, offset));

    tags.push(renderLink(match));

    lastOffset = offset + match.getMatchedText().length;
  }

  // add rest of text
  tags.push(text.substring(lastOffset, text.length));

  return render(tags);
}

AutoLinker.defaultProps = {
  children: nodes => nodes,
  renderLink: match => {
    switch (match.getType()) {
      case 'url':
      case 'email':
        return (
          <a
            href={match.getAnchorHref()}
            className={match.getCssClassSuffixes()}
            key={match.getOffset()}
            target="_blank"
          >
            {match.getAnchorText()}
          </a>
        );

      default:
        console.error(`AutoLinker matched unsupported link - ${match.getType()}`);

        return match.getAnchorText();
    }
  },
};
