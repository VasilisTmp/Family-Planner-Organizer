import {Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useRef} from 'react';

import {BackB, Background} from '../components';
import {useMyStore} from '../../store';
import globalStyles from '../config/globalStyles';
import {IdScreenPropsHomeStack} from '../navigation/HomeStack';
import {IdScreenPropsLaunchStack} from '../navigation/LaunchStack';

export default function IdScreen() {
  const {userId, loggedIn} = useMyStore();

  const textRef = useRef<Text>(null);
  const homeStackNavigation = useNavigation<IdScreenPropsHomeStack>();
  const launchStackNavigation = useNavigation<IdScreenPropsLaunchStack>();

  ///////////////////////////////////////////////////////////////////////////////
  return (
    <Background style={{justifyContent: 'center', alignItems: 'center'}}>
      <BackB
        onPress={() => {
          loggedIn
            ? homeStackNavigation.goBack()
            : launchStackNavigation.goBack();
        }}
      />
      <Text
        ref={textRef}
        style={[
          globalStyles.text,
          {
            textAlign: 'center',
            fontSize: 20,
            height: '100%',
            width: '100%',
            textAlignVertical: 'center',
          },
        ]}
        selectable>
        {userId}
      </Text>
    </Background>
  );
}
