import {useEffect} from 'react';
import {Modal, View, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {useMyStore} from '../../store';
import colors from '../config/colors';

interface Props {
  visible: boolean;
  close: Function;
  album: string;
  openConfirmModal: Function;
  setMoveTo: Function;
  moveTo: string;
}

export default function PhotoModal2({
  visible,
  close,
  album,
  openConfirmModal,
  setMoveTo,
  moveTo,
}: Props) {
  const {albums} = useMyStore();

  useEffect(() => {
    visible && setMoveTo(albums.find(a => a._id === album)?.name || '');
  }, [visible]);

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => close()}>
      <TouchableWithoutFeedback onPress={() => close()}>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            backgroundColor: `rgba(${colors.backgroundTrans},0.8)`,
            justifyContent: 'center',
          }}>
          <SelectDropdown
            disableAutoScroll
            onChangeSearchInputText={() => {}}
            defaultValue={albums.find(a => a.name === moveTo)}
            buttonStyle={{
              borderWidth: 1,
              borderColor: colors.text,
              width: 150,
              backgroundColor: colors.background,
              height: 48,
              borderRadius: 25,
            }}
            buttonTextStyle={styles.dropDownText}
            renderDropdownIcon={isOpened => {
              return (
                <FontAwesome
                  name={isOpened ? 'chevron-up' : 'chevron-down'}
                  color={colors.text}
                  size={16}
                />
              );
            }}
            dropdownIconPosition={'right'}
            rowTextStyle={{
              fontSize: 18,
              textAlign: 'left',
              paddingHorizontal: 7,
            }}
            dropdownStyle={{borderRadius: 20}}
            selectedRowStyle={{backgroundColor: colors.ripple}}
            data={albums}
            buttonTextAfterSelection={() => moveTo}
            onSelect={(selectedItem, index) => {
              if (selectedItem._id !== album) {
                setMoveTo(selectedItem.name);
                openConfirmModal();
              }
            }}
            rowTextForSelection={(item, index) => item.name}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dropDownText: {left: 3, fontSize: 18, color: colors.text, textAlign: 'left'},
});
