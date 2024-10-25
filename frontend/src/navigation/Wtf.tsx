import {NavigationContainer} from '@react-navigation/native';

import {LaunchStack, Tabs} from '.';
import {useMyStore} from '../../store';

export default function Wtf() {
  const {loggedIn} = useMyStore();
  return (
    <NavigationContainer>
      {loggedIn ? <Tabs /> : <LaunchStack />}
    </NavigationContainer>
  );
}
