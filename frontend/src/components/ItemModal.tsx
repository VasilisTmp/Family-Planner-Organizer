import {Dimensions, Image, Modal, View} from 'react-native';
import {Buffer} from 'buffer';

import colors from '../config/colors';

interface Props {
  visible: boolean;
  close: Function;
  image: string;
}

export default function ItemModal({visible, close, image = ''}: Props) {
  const url = image
    ? image
    : `data:image/jpeg;base64,${Buffer.from('').toString('base64')}`;
  const {width} = Dimensions.get('window');

  ///////////////////////////////////////////////////////////////////////
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => close()}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          backgroundColor: `rgba(${colors.backgroundTrans},0.8)`,
        }}>
        <Image
          style={{flex: 1, resizeMode: 'contain', width: width}}
          source={{uri: url}}
        />
      </View>
    </Modal>
  );
}
