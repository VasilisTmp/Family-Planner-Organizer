import {Modal, View, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {useMyStore} from '../../store';
import colors from '../config/colors';

interface Props {
  visible: boolean;
  close: Function;
  openConfirmModal: Function;
  setAdminTo: Function;
  adminTo: string;
}

export default function AdminModal({
  visible,
  close,
  openConfirmModal,
  setAdminTo,
  adminTo,
}: Props) {
  const {members, groupAdminId} = useMyStore();

  /////////////////////////////////////////////////////////////////////////
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
            defaultValue={members.find(m => m.userId === adminTo)}
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
            dropdownStyle={{borderRadius: 20}}
            rowTextStyle={styles.dropdownOptionText}
            selectedRowStyle={{backgroundColor: colors.ripple}}
            data={members}
            buttonTextAfterSelection={() =>
              members.find(m => m.userId === adminTo)?.nickname || ''
            }
            onSelect={(selectedItem, index) => {
              if (selectedItem.userId !== groupAdminId) {
                setAdminTo(selectedItem.userId);
                openConfirmModal();
              }
            }}
            rowTextForSelection={(item, index) => item.nickname}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dropDownText: {left: 3, fontSize: 18, color: colors.text, textAlign: 'left'},
  dropdownOptionText: {fontSize: 18, textAlign: 'left', paddingHorizontal: 7},
});
