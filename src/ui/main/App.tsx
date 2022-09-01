import React, { useEffect, useState } from 'react';
import { Channel } from '../../shared/enums';
import useIpcRenderer from '../shared/useIpcRenderer';
import styles from './App.module.scss';

const App: React.FC = () => {
  const renderer = useIpcRenderer();
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    renderer.on<string>(Channel.Version, (version) => setVersion(version));
  }, []);
  return <div className={styles.asd}>This is a completely different window, version {version}</div>;
};

export default App;
