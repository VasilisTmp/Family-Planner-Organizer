import {useEffect} from 'react';
import {BackHandler} from 'react-native';

export function EffectBackHandler(action: Function) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        action();
        return true;
      },
    );
    return () => backHandler.remove();
  }, []);
}
