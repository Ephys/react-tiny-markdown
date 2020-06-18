import * as React from 'react';
import markdown from 'markdown-ast';
import AutoLinker from './Autolinker';
import nl2br from './nl2br';

type Props = {
  children: string,
  disableInteractive?: boolean,
};

function Markdown(props: Props) {
  const ast = markdown(props.children || '');

  return (
    <div className="rtm-markdown">
      {renderAst(ast, props.disableInteractive ?? false)}
    </div>
  );
}

function renderAst(ast, disableInteractive: boolean, createParagraphs = true, isInsideList = false) {
  if (!createParagraphs) {
    return ast.map(val => renderAstItem(val, disableInteractive, isInsideList));
  }

  const groups = [];

  for (const val of ast) {
    if (val.type === 'break') {
      groups.push({ type: 'p', items: [] });
      continue;
    }

    if (val.type === 'quote' || val.type === 'codeBlock' || val.type === 'border') {
      groups.push(val);
      continue;
    }

    if (val.type !== 'list') {
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.type !== 'p') {
        groups.push({ type: 'p', items: [] });
      }

      groups[groups.length - 1].items.push(val);

      continue;
    }

    insertListItem(groups, val);
  }

  return groups.map(val => renderAstItem(val, disableInteractive, isInsideList));
}

function insertListItem(groups, val) {
  const listType = val.bullet.match(/^[1-9]+\.$/) ? 'ol' : 'ul';
  const depth = val.indent.length;

  const lastGroup = groups[groups.length - 1];

  if (
    // if previous group not a list at all: new group
    // switch from p to ul/ol
    !lastGroup
    || (lastGroup.type !== 'ul' && lastGroup.type !== 'ol')

    // if previous group is a list but of wrong type and we're on the same indentation level: new group
    // -> switch from ul to ol / ol to ul
    || (lastGroup.depth >= depth && lastGroup.type !== listType)
  ) {
    groups.push({ type: listType, items: [val], depth });

    return;
  }

  // if on same indentation & same list type: insert in previous group
  if (lastGroup.depth >= depth) {
    lastGroup.items.push(val);

    return;
  }

  // go one level deeper
  insertListItem(lastGroup.items, val);
}

function renderAstItem(val, disableInteractive: boolean, isInList) {
  switch (val.type) {
    case 'p':
    case 'ul':
    case 'ol': {
      if (val.items.length === 0) {
        return null;
      }

      const Component = val.type;

      const elem = <Component>{renderAst(val.items, disableInteractive, false, true)}</Component>;

      if (isInList) {
        return <li className="list">{elem}</li>;
      }

      return elem;
    }

    case 'list':
      return <li>{renderAst(val.block, disableInteractive, false)}</li>;

    case 'text': {
      if (disableInteractive) {
        return nl2br(val.text);
      }

      return (
        <AutoLinker text={val.text}>
          {nodes => nl2br(...nodes)}
        </AutoLinker>
      );
    }

    case 'strike':
    case 'italic':
    case 'bold': {
      if (val.block.length === 0) {
        return null;
      }

      const Component = val.type === 'strike' ? 'del'
        : val.type === 'italic' ? 'em'
          : 'strong';

      return <Component>{renderAst(val.block, disableInteractive, false)}</Component>;
    }

    case 'codeSpan':
      return <code>{val.code}</code>;

    case 'codeBlock':
      return <pre className={val.syntax}><code>{val.code}</code></pre>;

    case 'quote':
      return <blockquote>{renderAst(val.block, disableInteractive, true)}</blockquote>;

    case 'link': {
      const content = renderAst(val.block, disableInteractive, false);

      if (disableInteractive) {
        return content;
      }

      return <a target="_blank" href={val.url}>{content}</a>;
    }

    case 'title':
      return <>{'#'.repeat(val.rank)}{' '}{renderAst(val.block, disableInteractive, false)}</>;

    case 'break':
      return null;

    case 'border': {
      if (val.text.startsWith('---')) {
        return <hr />;
      }

      return nl2br(val.text);
    }

    default:
      console.error('unsupported markdown item');
      console.error(val);

      return null;
  }
}

export default React.memo(Markdown);
