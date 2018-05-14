// @flow
import * as React from 'react';
import { hot } from 'react-hot-loader';

import styles from './MyComponent.block.css';

type Props = {};

class MyComponent extends React.Component<Props> {
  render() {
    return (
      <div>
        <p>HEllo this is my component</p>
      </div>
    );
  }
}

export default hot(module)(MyComponent);
