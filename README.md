# react-tiny-markdown

*Slack (& other chat app) flavored markdown*

## example

```tsx
import React from 'react';
import { Markdown } from '@ephys/react-tiny-markdown';
import '@ephys/react-tiny-markdown/src/default-styles.scss';

export function MyComponent() {
  return (
    <Markdown>
      body: regular link https://google.com (autolinker)
      [text link](https://google.com)
      
      # titles not allowed
      
      `code linline`
      ```
      multiline
      code block
      ```
      *italic*
      **bold**
      
      > quote
      > of
      > something
      
      paragraph 1
      
      paragraph 2
      
      - list item
      - list item
      - list item
        1. ol sublist
        2. ol sublist 2
          - we can go deeper
      
      ~~strike~~ 
      
      ---
      
      this is all
    </Markdown>
  );
}
```
