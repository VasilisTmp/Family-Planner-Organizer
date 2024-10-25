import {ActivityIndicator, Modal, View} from 'react-native';

import colors from '../config/colors';
import {useMyStore} from '../../store';

export default function LoadingModal() {
  const {loading} = useMyStore();

  return (
    <Modal transparent visible={loading} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: `rgba(${colors.backgroundTrans},0.8)`,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator
          size={'large'}
          color={colors.details}
          animating={true}
        />
      </View>
    </Modal>
  );
}
